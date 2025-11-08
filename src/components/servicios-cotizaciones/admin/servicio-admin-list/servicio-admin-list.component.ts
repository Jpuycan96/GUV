import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ServicioService, ServicioDTO } from '../../../../services/servicio/servicio.service';
import { PermisosService } from '../../../../services/permisos/permisos.service';
import { ServicioAdminModalComponent } from '../servicio-admin-modal/servicio-admin-modal.component';

@Component({
  selector: 'app-servicio-admin-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDialogModule
  ],
  templateUrl: './servicio-admin-list.component.html',
  styleUrl: './servicio-admin-list.component.css'
})
export class ServicioAdminListComponent implements OnInit {
  // lista de servicios obtenida del backend
  servicios: ServicioDTO[] = [];
  
  // bandera para mostrar/ocultar loading spinner
  cargando: boolean = false;
  
  // mensaje de error si la petición falla
  error: string = '';

  constructor(
    private servicioService: ServicioService,
    private dialog: MatDialog,
    private router: Router,
    public permisos: PermisosService
  ) { }

  ngOnInit(): void {
    // Verificar si tiene permiso para ver servicios
    if (!this.permisos.tiene('servicios', 'ver')) {
      console.log('Usuario sin permisos para ver servicios, redirigiendo...');
      this.router.navigate(['/ordenes/lista']);
      return;
    }

    this.cargarServicios();
  }

  // Métodos de permisos para usar en el template
  puedeCrear(): boolean {
    return this.permisos.tiene('servicios', 'crear');
  }

  puedeEditar(): boolean {
    return this.permisos.tiene('servicios', 'editar');
  }

  puedeEliminar(): boolean {
    return this.permisos.tiene('servicios', 'eliminar');
  }

  // cargarServicios - obtiene la lista de servicios del backend
  cargarServicios(): void {
    this.cargando = true;
    this.error = '';
    
    this.servicioService.obtenerTodos().subscribe({
      next: (data) => {
        this.servicios = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar servicios:', err);
        this.error = 'Error al cargar los servicios';
        this.cargando = false;
      }
    });
  }

  // abrirModalCrear - abre modal para crear nuevo servicio
  abrirModalCrear(): void {
    if (!this.puedeCrear()) {
      alert('No tienes permisos para crear servicios');
      return;
    }

    const dialogRef = this.dialog.open(ServicioAdminModalComponent, {
      width: '700px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado) {
        this.cargarServicios();
      }
    });
  }

  // abrirModalEditar - abre modal para editar servicio
  abrirModalEditar(servicio: ServicioDTO, event: Event): void {
    event.stopPropagation(); // Evitar que se active el click del card

    if (!this.puedeEditar()) {
      alert('No tienes permisos para editar servicios');
      return;
    }
    
    const dialogRef = this.dialog.open(ServicioAdminModalComponent, {
      width: '700px',
      disableClose: true,
      data: { servicio }
    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado) {
        this.cargarServicios();
      }
    });
  }

  // eliminarServicio - elimina un servicio y recarga la lista
  eliminarServicio(id: number | undefined, event: Event): void {
    event.stopPropagation(); // Evitar que se active el click del card
    
    if (!id) return;

    if (!this.puedeEliminar()) {
      alert('No tienes permisos para eliminar servicios');
      return;
    }
    
    if (confirm('¿Estás seguro de que deseas eliminar este servicio? Se eliminarán también todos sus materiales, modelos, precios y extras.')) {
      this.servicioService.eliminar(id).subscribe({
        next: () => {
          this.cargarServicios();
        },
        error: (err) => {
          console.error('Error al eliminar servicio:', err);
          this.error = 'Error al eliminar el servicio';
        }
      });
    }
  }

  // recargar - recarga la lista de servicios
  recargar(): void {
    this.cargarServicios();
  }
}