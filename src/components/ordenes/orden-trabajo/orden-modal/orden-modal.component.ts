import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { Router } from '@angular/router';
import { OrdenTrabajoService, OrdenTrabajoDTO, OrdenDetalleDTO } from '../../../../services/ordenes/orden-trabajo/orden-trabajo.service';
import { OrdenDetalleItemComponent } from '../../shared/orden-detalle-item/orden-detalle-item.component';

@Component({
  selector: 'app-orden-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    OrdenDetalleItemComponent
  ],
  templateUrl: './orden-modal.component.html',
  styleUrl: './orden-modal.component.css'
})
export class OrdenModalComponent implements OnInit {
  orden?: OrdenTrabajoDTO;
  detalles: OrdenDetalleDTO[] = [];
  cargando = false;
  error = '';

  constructor(
    private dialogRef: MatDialogRef<OrdenModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { idOrden: number },
    private ordenService: OrdenTrabajoService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cargarOrden();
  }

  cargarOrden(): void {
    this.cargando = true;
    
    this.ordenService.obtenerPorId(this.data.idOrden).subscribe({
      next: (orden) => {
        this.orden = orden;
        this.cargarDetalles();
      },
      error: (err) => {
        console.error('Error al cargar orden:', err);
        this.error = 'Error al cargar la orden';
        this.cargando = false;
      }
    });
  }

  cargarDetalles(): void {
    this.ordenService.obtenerDetalles(this.data.idOrden).subscribe({
      next: (detalles) => {
        this.detalles = detalles;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar detalles:', err);
        this.cargando = false;
      }
    });
  }

  verDetalle(): void {
    this.dialogRef.close();
    this.router.navigate(['/ordenes/detalle', this.data.idOrden]);
  }

  cerrar(): void {
    this.dialogRef.close();
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
}