import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ServicioService, ServicioDTO } from '../../../../services/servicio/servicio.service';
import { ProcesoService, ProcesoDTO } from '../../../../services/servicios-cotizaciones/proceso/proceso.service';
import { ServicioProcesoService, ServicioProcesoDTO } from '../../../../services/servicios-cotizaciones/servicio-proceso/servicio-proceso.service';
import { MaterialService, MaterialDTO } from '../../../../services/servicios-cotizaciones/material/material.service';

@Component({
  selector: 'app-servicio-procesos-config',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatTableModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatCheckboxModule
  ],
  templateUrl: './servicio-procesos-config.component.html',
  styleUrls: ['./servicio-procesos-config.component.css']
})
export class ServicioProcesosConfigComponent implements OnInit {
  
  servicios: ServicioDTO[] = [];
  procesosDisponibles: ProcesoDTO[] = [];
  procesosAsignados: ServicioProcesoDTO[] = [];
  materialesDelServicio: MaterialDTO[] = [];
  
  private materialesCargados = new Map<number, MaterialDTO[]>();
  
  servicioSeleccionado: ServicioDTO | null = null;
  materialSeleccionado: MaterialDTO | null = null;
  procesoAgregar: number = 0;
  
  materialParaNuevoProceso: number = 0;
  puedeParaleloNuevoProceso: boolean = false;
  
  showEditModal = false;
  procesoEditando: ServicioProcesoDTO | null = null;
  
  loading = false;
  mensaje: { tipo: 'success' | 'error' | 'info', texto: string } | null = null;

  constructor(
    private servicioService: ServicioService,
    private procesoService: ProcesoService,
    private servicioProcesoService: ServicioProcesoService,
    private materialService: MaterialService
  ) {}

  ngOnInit(): void {
    this.cargarServicios();
    this.cargarProcesosActivos();
  }

  cargarServicios(): void {
    this.loading = true;
    this.servicioService.obtenerTodos().subscribe({
      next: (data) => {
        this.servicios = data;
        this.loading = false;
      },
      error: (err) => {
        this.mostrarMensaje('error', 'Error al cargar servicios');
        console.error(err);
        this.loading = false;
      }
    });
  }

  cargarProcesosActivos(): void {
    this.procesoService.obtenerActivos().subscribe({
      next: (data) => {
        this.procesosDisponibles = data;
      },
      error: (err) => {
        this.mostrarMensaje('error', 'Error al cargar procesos');
        console.error(err);
      }
    });
  }

  cargarProcesosDelServicio(idServicio: number): void {
    this.servicioProcesoService.obtenerPorServicio(idServicio).subscribe({
      next: (data) => {
        this.procesosAsignados = data.sort((a, b) => (a.orden || 0) - (b.orden || 0));
      },
      error: (err) => {
        this.mostrarMensaje('error', 'Error al cargar procesos del servicio');
        console.error(err);
      }
    });
  }

  cargarProcesosPorMaterial(idServicio: number, idMaterial: number): void {
    this.servicioProcesoService.obtenerPorServicioYMaterial(idServicio, idMaterial).subscribe({
      next: (data) => {
        this.procesosAsignados = data.sort((a, b) => (a.orden || 0) - (b.orden || 0));
      },
      error: (err) => {
        this.mostrarMensaje('error', 'Error al cargar procesos');
        console.error(err);
      }
    });
  }

  cargarMaterialesDelServicio(idServicio: number): void {
    if (this.materialesCargados.has(idServicio)) {
      this.materialesDelServicio = this.materialesCargados.get(idServicio)!;
      
      if (this.materialesDelServicio.length > 0) {
        const primerMaterialId = this.materialesDelServicio[0].idMaterial!;
        this.cargarProcesosPorMaterial(idServicio, primerMaterialId);
      } else {
        this.cargarProcesosDelServicio(idServicio);
      }
      return;
    }

    this.materialService.obtenerPorServicio(idServicio).subscribe({
      next: (data) => {
        this.materialesDelServicio = data;
        this.materialesCargados.set(idServicio, data);
        
        if (data.length > 0) {
          const primerMaterialId = data[0].idMaterial!;
          this.cargarProcesosPorMaterial(idServicio, primerMaterialId);
        } else {
          this.cargarProcesosDelServicio(idServicio);
        }
      },
      error: (err) => {
        this.mostrarMensaje('error', 'Error al cargar materiales');
        console.error(err);
      }
    });
  }

  seleccionarServicio(servicio: ServicioDTO): void {
    this.servicioSeleccionado = servicio;
    this.procesoAgregar = 0;
    this.materialSeleccionado = null;
    
    // ✅ Limpiar procesos inmediatamente
    this.procesosAsignados = [];
    
    if (servicio.idServicio) {
      this.cargarMaterialesDelServicio(servicio.idServicio);
    }
  }

  cambiarMaterial(materialId: number | null): void {
    // ✅ Limpiar procesos inmediatamente
    this.procesosAsignados = [];
    
    if (this.servicioSeleccionado?.idServicio) {
      if (materialId) {
        this.cargarProcesosPorMaterial(this.servicioSeleccionado.idServicio, materialId);
      } else {
        this.cargarProcesosDelServicio(this.servicioSeleccionado.idServicio);
      }
    }
  }

  agregarProceso(): void {
    if (!this.servicioSeleccionado || !this.servicioSeleccionado.idServicio || !this.procesoAgregar) {
      this.mostrarMensaje('error', 'Debe seleccionar un proceso');
      return;
    }

    const procesoSeleccionado = this.procesosDisponibles.find(p => p.idProceso === this.procesoAgregar);
    if (!procesoSeleccionado) return;

    const siguienteOrden = this.procesosAsignados.length > 0
      ? Math.max(...this.procesosAsignados.map(p => p.orden || 0)) + 1
      : 1;

    const materialSeleccionadoActual = this.materialesDelServicio.length > 0 
      ? this.materialesDelServicio[0] 
      : null;

    const dto: ServicioProcesoDTO = {
      idServicio: this.servicioSeleccionado.idServicio,
      idProceso: this.procesoAgregar,
      orden: siguienteOrden,
      obligatorio: true,
      tiempoEstimadoMinutos: 30,
      idMaterial: materialSeleccionadoActual?.idMaterial,
      puedeParalelo: this.puedeParaleloNuevoProceso
    };

    this.servicioProcesoService.agregar(dto).subscribe({
      next: (procesoCreado) => {
        this.procesosAsignados.push(procesoCreado);
        this.procesosAsignados.sort((a, b) => (a.orden || 0) - (b.orden || 0));
        
        this.procesoAgregar = 0;
        this.puedeParaleloNuevoProceso = false;
        
        this.mostrarMensaje('success', 'Proceso agregado correctamente');
      },
      error: (err) => {
        this.mostrarMensaje('error', err.error?.message || 'Error al agregar proceso');
        console.error(err);
      }
    });
  }

  abrirModalEditar(proceso: ServicioProcesoDTO): void {
    this.procesoEditando = { ...proceso };
    this.showEditModal = true;
  }

  guardarEdicion(): void {
    if (!this.procesoEditando || !this.procesoEditando.idServicioProceso) return;

    const index = this.procesosAsignados.findIndex(
      p => p.idServicioProceso === this.procesoEditando!.idServicioProceso
    );
    
    if (index === -1) return;
    
    const procesoAnterior = { ...this.procesosAsignados[index] };
    this.procesosAsignados[index] = { ...this.procesoEditando };
    
    this.cerrarModalEditar();

    this.servicioProcesoService.actualizar(
      this.procesoEditando.idServicioProceso,
      this.procesoEditando
    ).subscribe({
      next: () => {
        this.mostrarMensaje('success', 'Proceso actualizado correctamente');
      },
      error: (err) => {
        this.procesosAsignados[index] = procesoAnterior;
        this.mostrarMensaje('error', 'Error al actualizar proceso');
        console.error(err);
      }
    });
  }

  cerrarModalEditar(): void {
    this.showEditModal = false;
    this.procesoEditando = null;
  }

  eliminarProceso(proceso: ServicioProcesoDTO): void {
    if (!confirm(`¿Eliminar "${proceso.nombreProceso}" del servicio?`)) return;
    if (!proceso.idServicioProceso) return;

    const procesoEliminado = { ...proceso };
    this.procesosAsignados = this.procesosAsignados.filter(
      p => p.idServicioProceso !== proceso.idServicioProceso
    );

    this.servicioProcesoService.eliminar(proceso.idServicioProceso).subscribe({
      next: () => {
        this.mostrarMensaje('success', 'Proceso eliminado correctamente');
      },
      error: (err) => {
        this.procesosAsignados.push(procesoEliminado);
        this.procesosAsignados.sort((a, b) => (a.orden || 0) - (b.orden || 0));
        this.mostrarMensaje('error', 'Error al eliminar proceso');
        console.error(err);
      }
    });
  }

  moverArriba(index: number): void {
    if (index === 0) return;

    const nuevoArray = [...this.procesosAsignados];
    
    const proceso1 = { ...nuevoArray[index] };
    const proceso2 = { ...nuevoArray[index - 1] };

    const ordenTemp = proceso1.orden;
    proceso1.orden = proceso2.orden;
    proceso2.orden = ordenTemp;

    nuevoArray[index] = proceso1;
    nuevoArray[index - 1] = proceso2;
    
    this.procesosAsignados = nuevoArray.sort((a, b) => (a.orden || 0) - (b.orden || 0));

    this.actualizarOrdenSilencioso(proceso1);
    this.actualizarOrdenSilencioso(proceso2);
  }

  moverAbajo(index: number): void {
    if (index === this.procesosAsignados.length - 1) return;

    const nuevoArray = [...this.procesosAsignados];
    
    const proceso1 = { ...nuevoArray[index] };
    const proceso2 = { ...nuevoArray[index + 1] };

    const ordenTemp = proceso1.orden;
    proceso1.orden = proceso2.orden;
    proceso2.orden = ordenTemp;

    nuevoArray[index] = proceso1;
    nuevoArray[index + 1] = proceso2;
    
    this.procesosAsignados = nuevoArray.sort((a, b) => (a.orden || 0) - (b.orden || 0));

    this.actualizarOrdenSilencioso(proceso1);
    this.actualizarOrdenSilencioso(proceso2);
  }

  private actualizarOrdenSilencioso(proceso: ServicioProcesoDTO): void {
    if (!proceso.idServicioProceso) return;

    this.servicioProcesoService.actualizar(proceso.idServicioProceso, proceso).subscribe({
      error: (err) => {
        console.error('Error al actualizar orden:', err);
      }
    });
  }

  getProcesosNoAsignados(): ProcesoDTO[] {
    const idsAsignados = this.procesosAsignados.map(p => p.idProceso);
    return this.procesosDisponibles.filter(p => !idsAsignados.includes(p.idProceso!));
  }

  mostrarMensaje(tipo: 'success' | 'error' | 'info', texto: string): void {
    this.mensaje = { tipo, texto };
    setTimeout(() => {
      this.mensaje = null;
    }, 4000);
  }
}