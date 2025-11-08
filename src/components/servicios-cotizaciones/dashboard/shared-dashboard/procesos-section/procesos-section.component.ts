import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { ServicioProcesoService, ServicioProcesoDTO } from '../../../../../services/servicios-cotizaciones/servicio-proceso/servicio-proceso.service';
import { ProcesoService, ProcesoDTO } from '../../../../../services/servicios-cotizaciones/proceso/proceso.service';
import { ProcesoModalComponent } from '../../../components/proceso/proceso-modal/proceso-modal.component';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'app-procesos-section',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatExpansionModule,  // ← AGREGAR ESTE
    FormsModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './procesos-section.component.html',
  styleUrl: './procesos-section.component.css'
})
export class ProcesosSectionComponent implements OnInit {
  @Input() idServicio!: number;

  // Lista de procesos del servicio
  procesoServicio: ServicioProcesoDTO[] = [];

  // Lista de todos los procesos disponibles (para agregar)
  procesosDisponibles: ProcesoDTO[] = [];

  // bandera de loading
  cargando: boolean = false;

  // mensaje de error
  error: string = '';

  // modo edición de orden
  editandoOrden: boolean = false;

  constructor(
    private servicioProcesoService: ServicioProcesoService,
    private procesoService: ProcesoService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    if (this.idServicio) {
      this.cargarProcesos();
      this.cargarProcesosDisponibles();
    }
  }

  // cargarProcesos - obtiene procesos del servicio
  cargarProcesos(): void {
    this.cargando = true;
    this.error = '';

    this.servicioProcesoService.obtenerPorServicio(this.idServicio).subscribe({
      next: (procesos) => {
        this.procesoServicio = procesos.sort((a, b) => (a.orden || 0) - (b.orden || 0));
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar procesos:', err);
        this.error = 'Error al cargar los procesos';
        this.cargando = false;
      }
    });
  }

  // cargarProcesosDisponibles - obtiene todos los procesos activos
  cargarProcesosDisponibles(): void {
    this.procesoService.obtenerActivos().subscribe({
      next: (procesos) => {
        this.procesosDisponibles = procesos;
      },
      error: (err) => {
        console.error('Error al cargar procesos disponibles:', err);
      }
    });
  }

  // abrirModalCrearProceso - abre modal para crear nuevo proceso
  abrirModalCrearProceso(): void {
    const dialogRef = this.dialog.open(ProcesoModalComponent, {
      width: '600px'
    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado) {
        this.cargarProcesosDisponibles();
      }
    });
  }

  // agregarProcesoAlServicio - abre selector para agregar proceso existente
  agregarProcesoAlServicio(idProceso: number): void {
    const dto: ServicioProcesoDTO = {
      idServicio: this.idServicio,
      idProceso: idProceso,
      orden: this.procesoServicio.length + 1,
      obligatorio: true
    };

    this.servicioProcesoService.agregar(dto).subscribe({
      next: () => {
        this.cargarProcesos();
      },
      error: (err) => {
        console.error('Error al agregar proceso:', err);
        this.error = 'Error al agregar el proceso. Puede que ya esté agregado.';
      }
    });
  }

  // actualizarProceso - actualiza datos del proceso en el servicio
  actualizarProceso(proceso: ServicioProcesoDTO): void {
    if (!proceso.idServicioProceso) return;

    this.servicioProcesoService.actualizar(proceso.idServicioProceso, proceso).subscribe({
      next: () => {
        this.cargarProcesos();
      },
      error: (err) => {
        console.error('Error al actualizar proceso:', err);
        this.error = 'Error al actualizar el proceso';
      }
    });
  }

  // eliminarProceso - elimina un proceso del servicio
  eliminarProceso(idServicioProceso: number | undefined): void {
    if (!idServicioProceso) return;

    if (confirm('¿Estás seguro de que deseas eliminar este proceso del servicio?')) {
      this.servicioProcesoService.eliminar(idServicioProceso).subscribe({
        next: () => {
          this.cargarProcesos();
        },
        error: (err) => {
          console.error('Error al eliminar proceso:', err);
          this.error = 'Error al eliminar el proceso';
        }
      });
    }
  }

  // guardarOrdenes - guarda los cambios de orden
  guardarOrdenes(): void {
    const promesas = this.procesoServicio.map((proceso, index) => {
      proceso.orden = index + 1;
      if (proceso.idServicioProceso) {
        return this.servicioProcesoService.actualizar(proceso.idServicioProceso, proceso).toPromise();
      }
      return Promise.resolve();
    });

    Promise.all(promesas).then(() => {
      this.editandoOrden = false;
      this.cargarProcesos();
    }).catch(err => {
      console.error('Error al guardar órdenes:', err);
      this.error = 'Error al guardar el orden';
    });
  }

  // moverArriba - mueve proceso una posición arriba
  moverArriba(index: number): void {
    if (index > 0) {
      [this.procesoServicio[index], this.procesoServicio[index - 1]] = 
      [this.procesoServicio[index - 1], this.procesoServicio[index]];
    }
  }

  // moverAbajo - mueve proceso una posición abajo
  moverAbajo(index: number): void {
    if (index < this.procesoServicio.length - 1) {
      [this.procesoServicio[index], this.procesoServicio[index + 1]] = 
      [this.procesoServicio[index + 1], this.procesoServicio[index]];
    }
  }

  // recargar - recarga la lista de procesos
  recargar(): void {
    this.cargarProcesos();
    this.cargarProcesosDisponibles();
  }

  // getProcesosNoAsignados - filtra procesos que no están en el servicio
  getProcesosNoAsignados(): ProcesoDTO[] {
    const idsAsignados = this.procesoServicio.map(sp => sp.idProceso);
    return this.procesosDisponibles.filter(p => !idsAsignados.includes(p.idProceso!));
  }

  // editarTiempoEstimado - permite editar el tiempo estimado de un proceso
editarTiempoEstimado(proceso: ServicioProcesoDTO): void {
  const tiempoActual = proceso.tiempoEstimadoMinutos || 0;
  const nuevoTiempo = prompt(
    `Tiempo estimado para "${proceso.nombreProceso}" (en minutos):`, 
    tiempoActual.toString()
  );

  if (nuevoTiempo !== null) {
    const minutos = parseInt(nuevoTiempo, 10);
    if (!isNaN(minutos) && minutos >= 0) {
      proceso.tiempoEstimadoMinutos = minutos;
      this.actualizarProceso(proceso);
    } else {
      alert('Por favor ingresa un número válido de minutos');
    }
  }
}
}