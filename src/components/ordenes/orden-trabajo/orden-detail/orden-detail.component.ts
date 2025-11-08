import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common'; // ✅ Agregar Location aquí
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule } from '@angular/forms';
import { OrdenTrabajoService, OrdenTrabajoDTO, OrdenDetalleDTO } from '../../../../services/ordenes/orden-trabajo/orden-trabajo.service';
import { OrdenPagoService, OrdenPagoDTO } from '../../../../services/ordenes/orden-pago/orden-pago.service';
import { ComprobanteService, ComprobanteDTO } from '../../../../services/ordenes/comprobante/comprobante.service';
import { PermisosService } from '../../../../services/permisos/permisos.service';
import { PagoEventService } from '../../../../services/pago-event/pago-event.service';
import { OrdenDetalleItemComponent } from '../../shared/orden-detalle-item/orden-detalle-item.component';
import { OrdenPagoModalComponent } from '../../shared/orden-pago-modal/orden-pago-modal.component';
import { ComprobanteModalComponent } from '../../shared/comprobante-modal/comprobante-modal.component';


@Component({
  selector: 'app-orden-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatChipsModule,
    MatTabsModule,
    MatTableModule,
    MatDialogModule,
    MatSelectModule,
    MatFormFieldModule,
    MatMenuModule,
    FormsModule,
    OrdenDetalleItemComponent
  ],
  templateUrl: './orden-detail.component.html',
  styleUrl: './orden-detail.component.css'
})
export class OrdenDetailComponent implements OnInit {
  orden?: OrdenTrabajoDTO;
  detalles: OrdenDetalleDTO[] = [];
  pagos: OrdenPagoDTO[] = [];
  comprobantes: ComprobanteDTO[] = [];
  
  cargando = false;
  error = '';
  
  // Columnas de tablas
  columnasPagos = ['fecha', 'monto', 'tipoPago', 'operacion', 'cajero', 'acciones'];
  columnasComprobantes = ['tipo', 'numero', 'fecha', 'total', 'estado', 'acciones'];
  
  // Estados disponibles
  estadosDisponibles = [
    { value: 'PENDIENTE', label: 'Pendiente' },
    { value: 'EN_PROCESO', label: 'En Proceso' },
    { value: 'COMPLETADO', label: 'Completado' },
    { value: 'ENTREGADO', label: 'Entregado' },
    { value: 'CANCELADO', label: 'Cancelado' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ordenService: OrdenTrabajoService,
    private pagoService: OrdenPagoService,
    private comprobanteService: ComprobanteService,
    private dialog: MatDialog,
    public permisos: PermisosService,
    private pagoEventService: PagoEventService,
    private location: Location // ✅ NUEVO: Inyectar Location
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarOrden(+id);
    }
  }

  // Métodos de permisos
  puedeRegistrarPago(): boolean {
    return this.permisos.tiene('pagos', 'crear');
  }

  puedeAnularPago(): boolean {
    return this.permisos.tiene('pagos', 'eliminar');
  }

  puedeEmitirComprobante(): boolean {
    return this.permisos.esAdministrador(this.permisos.getRolesUsuarioActual());
  }

  cargarOrden(id: number): void {
    this.cargando = true;
    this.error = '';

    this.ordenService.obtenerPorId(id).subscribe({
      next: (orden) => {
        console.log('📋 Orden cargada:', orden);
        console.log('📅 fRecepcion:', orden.fRecepcion);
        console.log('🤝 fEntregaAcordada:', orden.fEntregaAcordada);
        console.log('✅ fEntregaReal:', orden.fEntregaReal);
        
        this.orden = orden;
        this.cargarDetalles(id);
        this.cargarPagos(id);
        this.cargarComprobantes(id);
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar orden:', err);
        this.error = 'Error al cargar la orden';
        this.cargando = false;
      }
    });
  }

  cargarDetalles(idOrden: number): void {
    this.ordenService.obtenerDetalles(idOrden).subscribe({
      next: (detalles) => {
        this.detalles = detalles.sort((a, b) => 
          (a.ordenVisualizacion || 0) - (b.ordenVisualizacion || 0)
        );
      },
      error: (err) => {
        console.error('Error al cargar detalles:', err);
      }
    });
  }

  cargarPagos(idOrden: number): void {
    this.pagoService.obtenerPagosPorOrden(idOrden).subscribe({
      next: (pagos) => {
        this.pagos = pagos.filter(p => !p.anulado);
      },
      error: (err) => {
        console.error('Error al cargar pagos:', err);
      }
    });
  }

  cargarComprobantes(idOrden: number): void {
    this.comprobanteService.obtenerComprobantesPorOrden(idOrden).subscribe({
      next: (comprobantes) => {
        this.comprobantes = comprobantes.filter(c => !c.anulado);
      },
      error: (err) => {
        console.error('Error al cargar comprobantes:', err);
      }
    });
  }

  registrarEntregaReal(): void {
    if (!this.orden || !this.orden.idOrden) return;

    const fechaActual = new Date().toISOString();
    
    if (confirm('¿Confirmar que el cliente vino a recoger su orden ahora?')) {
      console.log('📦 Registrando entrega real...');
      
      this.ordenService.registrarEntregaReal(this.orden.idOrden, fechaActual).subscribe({
        next: (ordenActualizada) => {
          console.log('✅ Entrega real registrada:', ordenActualizada);
          this.orden = ordenActualizada;
          alert('✅ Entrega registrada correctamente');
        },
        error: (err) => {
          console.error('❌ Error al registrar entrega real:', err);
          alert('Error al registrar la entrega: ' + (err.error?.message || 'Error desconocido'));
        }
      });
    }
  }

  // ✅ ACTUALIZADO: Abre modal para registrar pago
  abrirModalPago(): void {
    if (!this.orden || !this.orden.idOrden) return;

    if (!this.puedeRegistrarPago()) {
      alert('No tienes permisos para registrar pagos');
      return;
    }

    const dialogRef = this.dialog.open(OrdenPagoModalComponent, {
      width: '500px',
      data: {
        idOrden: this.orden.idOrden,
        saldoPendiente: this.orden.saldoPendiente || 0,
        idUsuario: 1
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        console.log('✅ [Detail] Pago registrado - Recargando orden y notificando...');
        
        this.cargarOrden(this.orden!.idOrden!);
        this.pagoEventService.notificarPagoRegistrado();
      }
    });
  }

  abrirModalComprobante(): void {
    if (!this.orden || !this.orden.idOrden) return;

    if (!this.puedeEmitirComprobante()) {
      alert('No tienes permisos para emitir comprobantes');
      return;
    }

    const dialogRef = this.dialog.open(ComprobanteModalComponent, {
      width: '600px',
      data: {
        idOrden: this.orden.idOrden,
        total: this.orden.totalFinal,
        idUsuario: 1,
        clienteRuc: this.orden.razonSocial?.match(/\d{11}/)?.[0],
        clienteRazon: this.orden.razonSocial,
        clienteDireccion: this.orden.direccion
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarComprobantes(this.orden!.idOrden!);
      }
    });
  }

  cambiarEstado(nuevoEstado: string): void {
    if (!this.orden || !this.orden.idOrden) return;

    console.log('🔄 Cambiando estado de:', this.orden.estado, 'a:', nuevoEstado);

    if (confirm(`¿Cambiar el estado de la orden a "${this.getEstadoLabel(nuevoEstado)}"?`)) {
      this.ordenService.actualizarEstado(this.orden.idOrden, nuevoEstado).subscribe({
        next: (ordenActualizada) => {
          console.log('✅ Estado actualizado:', ordenActualizada);
          console.log('📅 fEntregaReal después de actualizar:', ordenActualizada.fEntregaReal);
          
          this.orden = ordenActualizada;
          
          if (nuevoEstado === 'ENTREGADO' && ordenActualizada.fEntregaReal) {
            alert(`✅ Estado actualizado a ENTREGADO\n📅 Fecha de entrega registrada: ${new Date(ordenActualizada.fEntregaReal).toLocaleString('es-PE')}`);
          } else {
            alert('✅ Estado actualizado correctamente');
          }
        },
        error: (err) => {
          console.error('❌ Error al actualizar estado:', err);
          alert('Error al actualizar el estado: ' + (err.error?.message || 'Error desconocido'));
        }
      });
    }
  }

  convertirAOrden(): void {
    if (!this.orden || !this.orden.idOrden) return;

    if (confirm('¿Convertir esta cotización en una orden de trabajo?')) {
      this.ordenService.convertirCotizacionAOrden(this.orden.idOrden).subscribe({
        next: (nuevaOrden) => {
          alert(`✅ Orden creada: ${nuevaOrden.numeroOrden}`);
          this.router.navigate(['/ordenes/detalle', nuevaOrden.idOrden]);
        },
        error: (err) => {
          console.error('Error al convertir cotización:', err);
          alert('Error al convertir la cotización');
        }
      });
    }
  }

  eliminarOrden(): void {
    if (!this.orden || !this.orden.idOrden) return;

    if (confirm('¿Estás seguro de eliminar esta orden? Esta acción no se puede deshacer.')) {
      this.ordenService.eliminar(this.orden.idOrden).subscribe({
        next: () => {
          alert('✅ Orden eliminada correctamente');
          this.router.navigate(['/ordenes']);
        },
        error: (err) => {
          console.error('Error al eliminar orden:', err);
          alert('Error al eliminar la orden');
        }
      });
    }
  }

  anularPago(idPago: number | undefined): void {
    if (!idPago) return;

    if (!this.puedeAnularPago()) {
      alert('No tienes permisos para anular pagos');
      return;
    }

    const motivo = prompt('Ingresa el motivo de anulación:');
    if (!motivo) return;

    this.pagoService.anularPago(idPago, 1, motivo).subscribe({
      next: () => {
        alert('✅ Pago anulado correctamente');
        this.cargarPagos(this.orden!.idOrden!);
        this.cargarOrden(this.orden!.idOrden!);
        this.pagoEventService.notificarPagoRegistrado();
      },
      error: (err) => {
        console.error('Error al anular pago:', err);
        alert('Error al anular el pago');
      }
    });
  }

  anularComprobante(idComprobante: number | undefined): void {
    if (!idComprobante) return;

    if (!this.puedeEmitirComprobante()) {
      alert('No tienes permisos para anular comprobantes');
      return;
    }

    const motivo = prompt('Ingresa el motivo de anulación:');
    if (!motivo) return;

    this.comprobanteService.anularComprobante(idComprobante, 1, motivo).subscribe({
      next: () => {
        alert('✅ Comprobante anulado correctamente');
        this.cargarComprobantes(this.orden!.idOrden!);
      },
      error: (err) => {
        console.error('Error al anular comprobante:', err);
        alert('Error al anular el comprobante');
      }
    });
  }

  imprimirOrden(): void {
    window.print();
  }

  // ✅ CORREGIDO: Usar historial del navegador
  volver(): void {
    this.location.back();
  }

  getEstadoClass(estado: string | undefined): string {
    switch (estado) {
      case 'PENDIENTE': return 'estado-pendiente';
      case 'EN_PROCESO': return 'estado-proceso';
      case 'COMPLETADO': return 'estado-completado';
      case 'ENTREGADO': return 'estado-entregado';
      case 'CANCELADO': return 'estado-cancelado';
      default: return '';
    }
  }

  getEstadoLabel(estado: string | undefined): string {
    switch (estado) {
      case 'PENDIENTE': return 'Pendiente';
      case 'EN_PROCESO': return 'En Proceso';
      case 'COMPLETADO': return 'Completado';
      case 'ENTREGADO': return 'Entregado';
      case 'CANCELADO': return 'Cancelado';
      default: return estado || 'Sin Estado';
    }
  }

  getEstadoSunatClass(estado: string | undefined): string {
    switch (estado) {
      case 'ACEPTADO': return 'sunat-aceptado';
      case 'RECHAZADO': return 'sunat-rechazado';
      case 'PENDIENTE': return 'sunat-pendiente';
      default: return 'sunat-sin-enviar';
    }
  }
}