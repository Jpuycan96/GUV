import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

import { TareaCardComponent } from '../tarea-card/tarea-card.component';
import { CompletarProcesoModalComponent } from '../completar-proceso-modal/completar-proceso-modal.component';
import { OrdenProcesoService, MisTareasDTO } from '../../../../services/ordenes/orden-proceso/orden-proceso.service';
import { WebsocketService, NotificacionDTO } from '../../../../services/ordenes/websocket/websocket.service';

@Component({
  selector: 'app-area-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    TareaCardComponent
  ],
  templateUrl: './area-dashboard.component.html',
  styleUrls: ['./area-dashboard.component.css']
})
export class AreaDashboardComponent implements OnInit, OnDestroy {
  nombreArea: string = '';
  tareas: MisTareasDTO[] = [];
  cargando = false;
  
  private notificacionSub?: Subscription;

  // Mapeo de nombres de área a nombres de proceso
  private areaProcesoMap: { [key: string]: string } = {
    'diseno': 'DISEÑO',
    'impresion': 'IMPRESIÓN',
    'corte': 'CORTE',
    'armado': 'ARMADO',
    'acabados': 'ACABADOS'
  };

  constructor(
    private route: ActivatedRoute,
    private ordenProcesoService: OrdenProcesoService,
    private websocketService: WebsocketService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // Obtener el área desde la ruta
    this.route.params.subscribe(params => {
      this.nombreArea = params['area'] || 'general';
      this.cargarTareas();
    });

    // Conectar WebSocket
    this.conectarWebSocket();

    // Suscribirse a notificaciones
    this.notificacionSub = this.websocketService.notificaciones$.subscribe(
      (notificacion: NotificacionDTO) => {
        this.manejarNotificacion(notificacion);
      }
    );
  }

  ngOnDestroy(): void {
    if (this.notificacionSub) {
      this.notificacionSub.unsubscribe();
    }
    this.websocketService.disconnect();
  }

  cargarTareas(): void {
    this.cargando = true;
    
    const nombreProceso = this.areaProcesoMap[this.nombreArea.toLowerCase()];
    
    if (nombreProceso) {
      // Cargar tareas de un área específica
      this.ordenProcesoService.obtenerTareasPorArea(nombreProceso).subscribe({
        next: (tareas) => {
          this.tareas = tareas;
          this.cargando = false;
          console.log(`✅ Tareas cargadas para ${nombreProceso}:`, tareas.length);
        },
        error: (error) => {
          console.error('❌ Error al cargar tareas:', error);
          this.cargando = false;
          this.snackBar.open('Error al cargar tareas', 'Cerrar', { duration: 3000 });
        }
      });
    } else {
      // Cargar todas las tareas
      this.ordenProcesoService.obtenerMisTareas().subscribe({
        next: (tareas) => {
          this.tareas = tareas;
          this.cargando = false;
          console.log('✅ Todas las tareas cargadas:', tareas.length);
        },
        error: (error) => {
          console.error('❌ Error al cargar tareas:', error);
          this.cargando = false;
          this.snackBar.open('Error al cargar tareas', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  abrirModalCompletar(tarea: MisTareasDTO): void {
    const dialogRef = this.dialog.open(CompletarProcesoModalComponent, {
      width: '500px',
      data: { tarea }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.completarProceso(tarea.idOrdenProceso, result.observaciones);
      }
    });
  }

  completarProceso(idProceso: number, observaciones?: string): void {
    this.ordenProcesoService.completarProceso(idProceso, observaciones).subscribe({
      next: (proceso) => {
        console.log('✅ Proceso completado:', proceso);
        this.snackBar.open('✅ Proceso completado exitosamente', 'Cerrar', { 
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        
        // Recargar tareas
        this.cargarTareas();
      },
      error: (error) => {
        console.error('❌ Error al completar proceso:', error);
        const mensaje = error.error?.message || 'Error al completar el proceso';
        this.snackBar.open(`❌ ${mensaje}`, 'Cerrar', { 
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  conectarWebSocket(): void {
    if (!this.websocketService.isConnected()) {
      this.websocketService.connect();
    }
  }

  manejarNotificacion(notificacion: NotificacionDTO): void {
    console.log('📩 Notificación recibida:', notificacion);
    
    // Mostrar notificación en snackbar
    this.snackBar.open(notificacion.mensaje, 'Ver', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
    
    // Recargar tareas si es una notificación de nuevo proceso
    if (notificacion.tipo === 'NUEVO_PROCESO') {
      this.cargarTareas();
    }
  }

  getTituloArea(): string {
    const titulos: { [key: string]: string } = {
      'diseno': 'Diseño',
      'impresion': 'Impresión UV',
      'corte': 'Corte',
      'armado': 'Armado',
      'acabados': 'Acabados',
      'general': 'Todas las Áreas'
    };
    return titulos[this.nombreArea.toLowerCase()] || 'Dashboard de Producción';
  }

  getIconoArea(): string {
    const iconos: { [key: string]: string } = {
      'diseno': 'brush',
      'impresion': 'print',
      'corte': 'content_cut',
      'armado': 'build',
      'acabados': 'auto_fix_high',
      'general': 'dashboard'
    };
    return iconos[this.nombreArea.toLowerCase()] || 'dashboard';
  }
}