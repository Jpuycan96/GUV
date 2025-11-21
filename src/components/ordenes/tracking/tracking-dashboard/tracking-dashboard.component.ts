import { Component, OnInit, OnDestroy, ViewChildren, QueryList, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatExpansionModule, MatExpansionPanel } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';

import { OrdenTrabajoService, OrdenConProcesosDTO, DetalleConProcesosDTO, ProcesoSimpleDTO } from '../../../../services/ordenes/orden-trabajo/orden-trabajo.service';
import { OrdenProcesoService } from '../../../../services/ordenes/orden-proceso/orden-proceso.service';

@Component({
  selector: 'app-tracking-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatExpansionModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTooltipModule
  ],
  templateUrl: './tracking-dashboard.component.html',
  styleUrls: ['./tracking-dashboard.component.css']
})
export class TrackingDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  ordenes: OrdenConProcesosDTO[] = [];
  cargando = false;
  private ordenIdPendiente: number | null = null;
  
  @ViewChildren('ordenPanel') panels!: QueryList<MatExpansionPanel>;

  constructor(
    private ordenTrabajoService: OrdenTrabajoService,
    private ordenProcesoService: OrdenProcesoService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Detectar si viene un ID de orden en la URL
    this.route.queryParams.subscribe(params => {
      if (params['orden']) {
        this.ordenIdPendiente = parseInt(params['orden'], 10);
        console.log('🔍 ID de orden detectado en URL:', this.ordenIdPendiente);
      }
    });
    
    this.cargarOrdenes();
  }

  ngAfterViewInit(): void {
    // Suscribirse a cambios en los paneles
    this.panels.changes.subscribe(() => {
      const idPendiente = this.ordenIdPendiente;
      
      if (idPendiente) {
        console.log('🔄 Paneles renderizados, intentando expandir ID:', idPendiente);
        setTimeout(() => {
          this.expandirOrden(idPendiente);
          this.ordenIdPendiente = null;
        }, 100); // ✅ OPTIMIZADO: Reducido de 100ms (ya estaba bien)
      }
    });
  }

  ngOnDestroy(): void {
    // Cleanup si es necesario
  }

  cargarOrdenes(): void {
    this.cargando = true;
    
    this.ordenTrabajoService.obtenerOrdenesConProcesos().subscribe({
      next: (ordenes) => {
        this.ordenes = ordenes.sort((a, b) => a.idOrden - b.idOrden);
        this.cargando = false;
        console.log('✅ Órdenes cargadas:', this.ordenes.length);
        
        const idPendiente = this.ordenIdPendiente;
        
        if (idPendiente) {
          console.log('🔄 Expandiendo orden ID:', idPendiente);
          setTimeout(() => {
            this.expandirOrden(idPendiente);
            this.ordenIdPendiente = null;
          }, 300); // ✅ OPTIMIZADO: Reducido de 1000ms a 300ms
        }
      },
      error: (error) => {
        console.error('❌ Error al cargar órdenes:', error);
        this.cargando = false;
        this.snackBar.open('Error al cargar órdenes', 'Cerrar', { duration: 3000 });
      }
    });
  }

  expandirOrden(idOrden: number): void {
    console.log('🎯 Expandiendo orden ID:', idOrden);
    
    const ordenIndex = this.ordenes.findIndex(o => o.idOrden === idOrden);
    
    if (ordenIndex === -1) {
      console.warn('⚠️ Orden no encontrada, idOrden:', idOrden);
      this.snackBar.open('⚠️ Orden no encontrada', 'Cerrar', { duration: 3000 });
      return;
    }

    console.log(`✅ Orden: ${this.ordenes[ordenIndex].numeroOrden} (índice ${ordenIndex})`);
    
    setTimeout(() => {
      const panelsArray = this.panels.toArray();
      
      if (panelsArray.length === 0) {
        console.error('❌ No hay paneles renderizados');
        return;
      }
      
      if (panelsArray[ordenIndex]) {
        console.log('✅ Expandiendo panel...');
        
        panelsArray[ordenIndex].expanded = true;
        panelsArray[ordenIndex].open();
        this.cdr.detectChanges();
        
        setTimeout(() => {
          const elements = document.querySelectorAll('.orden-panel');
          if (elements[ordenIndex]) {
            (elements[ordenIndex] as HTMLElement).scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start' 
            });
            console.log('📍 Scroll completado');
          }
        }, 100); // ✅ OPTIMIZADO: Reducido de 500ms a 100ms
        
        this.snackBar.open(`📋 ${this.ordenes[ordenIndex].numeroOrden}`, 'Cerrar', {
          duration: 2000 // ✅ OPTIMIZADO: Reducido de 3000ms a 2000ms
        });
      } else {
        console.error('❌ Panel no encontrado');
      }
    }, 100); // ✅ OPTIMIZADO: Reducido de 500ms a 100ms
  }

  abrirModalCompletar(proceso: ProcesoSimpleDTO, detalle: DetalleConProcesosDTO, orden: OrdenConProcesosDTO): void {
    if (proceso.bloqueado) {
      this.snackBar.open('⚠️ Este proceso está bloqueado', 'Cerrar', { duration: 3000 });
      return;
    }

    if (proceso.estado === 'COMPLETADO') {
      this.snackBar.open('✅ Este proceso ya está completado', 'Cerrar', { duration: 3000 });
      return;
    }

    this.completarProceso(proceso.idOrdenProceso);
  }

  completarProceso(idProceso: number, observaciones?: string): void {
    this.ordenProcesoService.completarProceso(idProceso, observaciones).subscribe({
      next: (proceso) => {
        console.log('✅ Proceso completado:', proceso);
        this.snackBar.open('✅ Proceso completado exitosamente', 'Cerrar', { 
          duration: 3000
        });
        
        this.cargarOrdenes();
      },
      error: (error) => {
        console.error('❌ Error al completar proceso:', error);
        const mensaje = error.error?.message || 'Error al completar el proceso';
        this.snackBar.open(`❌ ${mensaje}`, 'Cerrar', { 
          duration: 5000
        });
      }
    });
  }

  getEstadoProcesoClass(estado: string): string {
    switch (estado) {
      case 'COMPLETADO': return 'proceso-completado';
      case 'EN_PROCESO': return 'proceso-en-curso';
      case 'PENDIENTE': return 'proceso-pendiente';
      default: return '';
    }
  }

  getEstadoProcesoIcon(estado: string): string {
    switch (estado) {
      case 'COMPLETADO': return 'check_circle';
      case 'EN_PROCESO': return 'pending';
      case 'PENDIENTE': return 'radio_button_unchecked';
      default: return 'help';
    }
  }

  getPrioridadOrden(orden: OrdenConProcesosDTO): string {
    if (!orden.fEntregaAcordada) return 'MEDIA';
    
    const fechaEntrega = new Date(orden.fEntregaAcordada);
    const hoy = new Date();
    const horasRestantes = (fechaEntrega.getTime() - hoy.getTime()) / (1000 * 60 * 60);
    
    if (horasRestantes < 24) return 'ALTA';
    if (horasRestantes < 72) return 'MEDIA';
    return 'BAJA';
  }

  getPrioridadColor(prioridad: string): string {
    switch (prioridad) {
      case 'ALTA': return 'warn';
      case 'MEDIA': return 'accent';
      case 'BAJA': return 'primary';
      default: return 'primary';
    }
  }
}