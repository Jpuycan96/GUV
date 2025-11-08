import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ServicioService, ServicioDTO } from '../../../../services/servicio/servicio.service';
import { MaterialesSectionComponent } from '../shared-dashboard/materiales-section/materiales-section.component';
import { PreciosSectionComponent } from '../shared-dashboard/precios-section/precios-section.component';
import { ExtrasSectionComponent } from '../shared-dashboard/extras-section/extras-section.component';
import { ProcesosSectionComponent } from '../shared-dashboard/procesos-section/procesos-section.component'; // ← NUEVO

@Component({
  selector: 'app-servicio-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MaterialesSectionComponent,
    PreciosSectionComponent,
    ExtrasSectionComponent,
    ProcesosSectionComponent // ← NUEVO
  ],
  templateUrl: './servicio-dashboard.component.html',
  styleUrl: './servicio-dashboard.component.css'
})
export class ServicioDashboardComponent implements OnInit {
  // servicio actual
  servicio: ServicioDTO | null = null;

  // ID del servicio desde la ruta
  servicioId: number | null = null;

  // bandera de loading
  cargando: boolean = false;

  // mensaje de error
  error: string = '';

  constructor(
    private servicioService: ServicioService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    // obtener ID del servicio desde la ruta
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.servicioId = Number(id);
      this.cargarServicio(this.servicioId);
    } else {
      this.error = 'Servicio no especificado';
    }
  }

  // cargarServicio - obtiene los datos del servicio
  // id - ID del servicio a cargar
  cargarServicio(id: number): void {
    this.cargando = true;
    this.error = '';

    this.servicioService.obtenerPorId(id).subscribe({
      next: (servicio) => {
        this.servicio = servicio;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar servicio:', err);
        this.error = 'Error al cargar el servicio';
        this.cargando = false;
      }
    });
  }

  // volver - navega de vuelta a lista de servicios
  volver(): void {
    this.router.navigate(['/servicios-cotizaciones/servicios']);
  }
}