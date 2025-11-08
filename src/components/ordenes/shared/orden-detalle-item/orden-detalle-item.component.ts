import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { OrdenDetalleDTO } from '../../../../services/ordenes/orden-trabajo/orden-trabajo.service';

@Component({
  selector: 'app-orden-detalle-item',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule
  ],
  templateUrl: './orden-detalle-item.component.html',
  styleUrl: './orden-detalle-item.component.css'
})
export class OrdenDetalleItemComponent {
  @Input() detalle!: OrdenDetalleDTO;
  @Input() numero: number = 1;

  // Obtiene el color del estado
  getEstadoColor(estado: string | undefined): string {
    switch (estado) {
      case 'PENDIENTE': return 'warn';
      case 'EN_PROCESO': return 'primary';
      case 'COMPLETADO': return 'accent';
      default: return '';
    }
  }

  // Obtiene el label del estado
  getEstadoLabel(estado: string | undefined): string {
    switch (estado) {
      case 'PENDIENTE': return 'Pendiente';
      case 'EN_PROCESO': return 'En Proceso';
      case 'COMPLETADO': return 'Completado';
      default: return estado || 'Sin Estado';
    }
  }
}