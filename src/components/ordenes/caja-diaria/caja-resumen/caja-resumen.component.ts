import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { PagoEventService } from '../../../../services/pago-event/pago-event.service';


// Services
import { CajaDiariaService, CajaDiariaDTO } from '../../../../services/ordenes/caja-diaria/caja-diaria.service';
import { OrdenTrabajoService, OrdenTrabajoDTO } from '../../../../services/ordenes/orden-trabajo/orden-trabajo.service';

@Component({
  selector: 'app-caja-resumen',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatChipsModule,
    MatDividerModule,
    MatTableModule,
    MatTabsModule
  ],
  templateUrl: './caja-resumen.component.html',
  styleUrl: './caja-resumen.component.css'
})
export class CajaResumenComponent implements OnInit {
  
  caja?: CajaDiariaDTO;
  cargando = false;
  error = '';
  idCaja?: number;

  // ✅ NUEVO: Órdenes del turno
  ordenesTurno: OrdenTrabajoDTO[] = [];
  ordenesPendientes: OrdenTrabajoDTO[] = [];
  cargandoOrdenes = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cajaService: CajaDiariaService,
    private ordenService: OrdenTrabajoService,
    private pagoEventService: PagoEventService // ✅ NUEVO

  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.idCaja = +params['id'];
      if (this.idCaja) {
        this.cargarCaja();
        // ❌ NO llamar cargarOrdenes() aquí - se llama desde cargarCaja()
      }
    });

      // ✅ SUSCRIBIRSE A EVENTOS DE PAGO
  this.pagoEventService.pagoRegistrado$.subscribe(() => {
    console.log('🔔 [CajaResumen] Evento de pago recibido - Recargando...');
    if (this.idCaja) {
      this.recargar();
    }
  });

  }

 /**
 * ✅ Cargar datos de la caja (con cache-busting)
 */
cargarCaja(): void {
  // ✅ Validar que idCaja exista
  if (!this.idCaja) {
    console.error('❌ [cargarCaja] No hay ID de caja');
    return;
  }

  this.cargando = true;
  this.error = '';

  console.log('📦 [cargarCaja] Cargando caja ID:', this.idCaja);

  // ✅ Agregar timestamp para evitar cache
  const timestamp = new Date().getTime();
  
  this.cajaService.obtenerPorId(this.idCaja, timestamp).subscribe({
    next: (caja) => {
      console.log('✅ Caja cargada:', caja);
      this.caja = caja;
      this.cargarOrdenes();
      this.cargando = false;
    },
    error: (err) => {
      console.error('❌ Error al cargar caja:', err);
      this.error = 'Error al cargar la caja';
      this.cargando = false;
    }
  });
}

cargarOrdenes(): void {
  if (!this.caja) {
    console.error('❌ No hay caja cargada');
    return;
  }

  this.cargandoOrdenes = true;

  // ✅ BUSCAR TODAS LAS ÓRDENES
  this.ordenService.obtenerTodas().subscribe({
    next: (ordenes) => {
      console.log('📦 Total órdenes recibidas:', ordenes.length);
      console.log('🔍 Buscando órdenes para caja ID:', this.caja!.idCaja);

      // ✅ SEPARAR ÓRDENES DEL TURNO Y PENDIENTES DE OTROS DÍAS
      this.ordenesTurno = [];
      this.ordenesPendientes = [];

      ordenes.forEach(orden => {
        // Solo órdenes (no cotizaciones)
        if (!orden.esCotizacion) {
          
          // ✅ Órdenes de ESTE turno/caja
          if (orden.idCajaDiaria === this.caja!.idCaja) {
            this.ordenesTurno.push(orden);
            console.log('✅ Orden vinculada:', orden.numeroOrden, 'CajaID:', orden.idCajaDiaria);
          }
          
          // ⚠️ Órdenes pendientes de OTROS turnos/cajas
          else if ((orden.saldoPendiente || 0) > 0) {
            this.ordenesPendientes.push(orden);
            console.log('⚠️ Orden pendiente de otro turno:', orden.numeroOrden, 
                       'Saldo:', orden.saldoPendiente, 
                       'CajaID:', orden.idCajaDiaria);
          }
        }
      });

      console.log('✅ Órdenes del turno:', this.ordenesTurno.length);
      console.log('⚠️ Órdenes pendientes de otros días:', this.ordenesPendientes.length);

      this.cargandoOrdenes = false;
    },
    error: (err) => {
      console.error('❌ Error al cargar órdenes:', err);
      this.cargandoOrdenes = false;
    }
  });
}

  // ========== ✅ NUEVO: HELPERS PARA ESTADO DE PAGO ==========
  getEstadoPagoClass(orden: OrdenTrabajoDTO): string {
    const saldo = orden.saldoPendiente || 0;
    const total = orden.totalFinal || 0;

    if (saldo === 0) return 'pago-completo';
    if (saldo === total) return 'sin-pagar';
    return 'pago-parcial';
  }

  getEstadoPagoIcon(orden: OrdenTrabajoDTO): string {
    const saldo = orden.saldoPendiente || 0;
    const total = orden.totalFinal || 0;

    if (saldo === 0) return 'check_circle';
    if (saldo === total) return 'cancel';
    return 'warning';
  }

  getEstadoPagoTexto(orden: OrdenTrabajoDTO): string {
    const saldo = orden.saldoPendiente || 0;
    const total = orden.totalFinal || 0;

    if (saldo === 0) return 'Pagado';
    if (saldo === total) return 'Sin pagar';
    return 'Pago parcial';
  }

  esDeTurnoActual(orden: OrdenTrabajoDTO): boolean {
    return this.ordenesTurno.some(o => o.idOrden === orden.idOrden);
  }

  // ========== VER DETALLE ORDEN ==========
  verOrden(idOrden: number | undefined): void {
    if (idOrden) {
      this.router.navigate(['/ordenes/detalle', idOrden]);
    }
  }

  // ========== VOLVER ==========
  volver(): void {
    this.router.navigate(['/ordenes/cajas']);
  }

  // ========== IMPRIMIR ==========
  imprimir(): void {
    window.print();
  }

  // ========== RECALCULAR ==========
  recalcular(): void {
    if (!this.idCaja) return;

    if (!confirm('¿Estás seguro de recalcular los totales de esta caja?')) {
      return;
    }

    this.cajaService.recalcularTotales(this.idCaja).subscribe({
      next: () => {
        alert('Totales recalculados correctamente');
        this.cargarCaja(); // Esto ahora también recarga las órdenes
      },
      error: (err) => {
        console.error('Error al recalcular:', err);
        alert('Error al recalcular los totales');
      }
    });
  }

  // ========== HELPERS ==========
  getEstadoClass(estado: string): string {
    return estado === 'ABIERTA' ? 'estado-abierta' : 'estado-cerrada';
  }

  getTotalDigital(): number {
    if (!this.caja) return 0;
    return (this.caja.totalYape || 0) + 
           (this.caja.totalPlin || 0) + 
           (this.caja.totalTransferencia || 0);
  }

  getTotalCobrado(): number {
    if (!this.caja) return 0;
    return (this.caja.totalEfectivo || 0) + this.getTotalDigital();
  }

  getMontoEsperado(): number {
    if (!this.caja) return 0;
    return (this.caja.montoInicial || 0) + (this.caja.totalEfectivo || 0);
  }

  getDiferenciaClass(): string {
    if (!this.caja?.diferencia) return '';
    return this.caja.diferencia > 0 ? 'diferencia-positiva' : 
           this.caja.diferencia < 0 ? 'diferencia-negativa' : 
           'diferencia-cero';
  }

  getPorcentajeTipoPago(monto: number): number {
    const total = this.getTotalCobrado();
    if (total === 0) return 0;
    return (monto / total) * 100;
  }

  // ========== RECARGAR ==========
/**
 * ✅ RECARGA TODO (el backend ya recalculó en registrarPago)
 */
recargar(): void {
  if (!this.idCaja) return;
  
  console.log('🔄 [recargar] Recargando caja ID:', this.idCaja);
  
  // Simplemente recargar - el backend ya recalculó los totales
  this.cargarCaja();
}

  
}