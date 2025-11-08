import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';

import { ServicioExtraService, ServicioExtraDTO } from '../../../../../services/servicios-cotizaciones/servicio-extra/servicio-extra.service';
import { ExtraService, ExtraDTO } from '../../../../../services/servicios-cotizaciones/extra/extra.service';
import { ExtraDetalleService, ExtraDetalleDTO } from '../../../../../services/servicios-cotizaciones/extra-detalle/extra-detalle.service';
import { ServicioExtraModalComponent } from '../../../components/servicio-extra/servicio-extra-modal/servicio-extra-modal.component';
import { ExtraDetalleModalComponent } from '../../../components/extra-detalle/extra-detalle-modal/extra-detalle-modal.component';

// Interfaz para mostrar extras con información completa
interface ExtraConDetalles {
  servicioExtra: ServicioExtraDTO;
  extra: ExtraDTO;
  detalles: ExtraDetalleDTO[];
}

@Component({
  selector: 'app-extras-section',
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
    MatExpansionModule,
    MatDividerModule
  ],
  templateUrl: './extras-section.component.html',
  styleUrl: './extras-section.component.css'
})
export class ExtrasSectionComponent implements OnInit {
  @Input() idServicio!: number;

  // Lista de extras del servicio con sus detalles
  extrasConDetalles: ExtraConDetalles[] = [];

  // bandera de loading
  cargando: boolean = false;

  // mensaje de error
  error: string = '';

  constructor(
    private servicioExtraService: ServicioExtraService,
    private extraService: ExtraService,
    private extraDetalleService: ExtraDetalleService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    if (this.idServicio) {
      this.cargarExtras();
    }
  }

  // cargarExtras - obtiene extras del servicio con sus detalles
  cargarExtras(): void {
    this.cargando = true;
    this.error = '';

    this.servicioExtraService.obtenerPorServicio(this.idServicio).subscribe({
      next: async (serviciosExtras) => {
        // Cargar información completa de cada extra
        const promesas = serviciosExtras.map(async (se) => {
          try {
            // Obtener información del extra
            const extra = await this.extraService.obtenerPorId(se.idExtra).toPromise();
            
            // Obtener detalles de precio
            const detalles = await this.extraDetalleService
              .obtenerPorServicioExtra(se.idServicioExtra!)
              .toPromise();

            return {
              servicioExtra: se,
              extra: extra!,
              detalles: detalles || []
            } as ExtraConDetalles;
          } catch (err) {
            console.error('Error cargando extra:', err);
            return null;
          }
        });

        const resultados = await Promise.all(promesas);
        this.extrasConDetalles = resultados.filter(r => r !== null) as ExtraConDetalles[];
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar extras:', err);
        this.error = 'Error al cargar los extras';
        this.cargando = false;
      }
    });
  }

  // abrirModalAgregarExtra - abre modal para agregar extra al servicio
  abrirModalAgregarExtra(): void {
    const dialogRef = this.dialog.open(ServicioExtraModalComponent, {
      width: '600px',
      data: { idServicio: this.idServicio }
    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado) {
        this.cargarExtras();
      }
    });
  }

  // abrirModalDetalle - abre modal para agregar/editar detalle de precio
  abrirModalDetalle(extraConDetalles: ExtraConDetalles, detalle?: ExtraDetalleDTO): void {
    const dialogRef = this.dialog.open(ExtraDetalleModalComponent, {
      width: '700px',
      data: {
        idServicioExtra: extraConDetalles.servicioExtra.idServicioExtra,
        detalle: detalle
      }
    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado) {
        this.cargarExtras();
      }
    });
  }

  // eliminarExtra - elimina un extra del servicio
  eliminarExtra(idServicioExtra: number | undefined): void {
    if (!idServicioExtra) return;

    if (confirm('¿Estás seguro de que deseas eliminar este extra del servicio? Se eliminarán también todos sus detalles de precio.')) {
      this.servicioExtraService.eliminar(idServicioExtra).subscribe({
        next: () => {
          this.cargarExtras();
        },
        error: (err) => {
          console.error('Error al eliminar extra:', err);
          this.error = 'Error al eliminar el extra';
        }
      });
    }
  }

  // eliminarDetalle - elimina un detalle de precio
  eliminarDetalle(idExtraDetalle: number | undefined): void {
    if (!idExtraDetalle) return;

    if (confirm('¿Estás seguro de que deseas eliminar este detalle de precio?')) {
      this.extraDetalleService.eliminar(idExtraDetalle).subscribe({
        next: () => {
          this.cargarExtras();
        },
        error: (err) => {
          console.error('Error al eliminar detalle:', err);
          this.error = 'Error al eliminar el detalle';
        }
      });
    }
  }

  // recargar - recarga la lista de extras
  recargar(): void {
    this.cargarExtras();
  }

  // obtenerColorTipo - retorna color según tipo de extra
  obtenerColorTipo(tipo?: string) {
    const colores: {[key: string]: 'primary' | 'accent' | 'warn'} = {
      'Acabado': 'primary',
      'Corte': 'accent',
      'Empaque': 'warn'
    };
    return colores[tipo || ''] || 'primary';
  }

  // formatearRango - formatea el rango de cantidad
  formatearRango(detalle: ExtraDetalleDTO): string {
    if (!detalle.cantidadMin && !detalle.cantidadMax) {
      return 'Sin límite';
    }
    if (detalle.cantidadMin && !detalle.cantidadMax) {
      return `${detalle.cantidadMin}+`;
    }
    if (!detalle.cantidadMin && detalle.cantidadMax) {
      return `Hasta ${detalle.cantidadMax}`;
    }
    return `${detalle.cantidadMin} - ${detalle.cantidadMax}`;
  }
}