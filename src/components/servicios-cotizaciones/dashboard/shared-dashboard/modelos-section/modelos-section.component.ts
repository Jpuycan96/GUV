import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';


import { ModeloService, ModeloDTO } from '../../../../../services/servicios-cotizaciones/modelo/modelo.service';
import { ModeloModalComponent } from '../../../components/modelo/modelo-modal/modelo-modal.component';

@Component({
  selector: 'app-modelos-section',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatChipsModule,
    MatCardModule
  ],
  templateUrl: './modelos-section.component.html',
  styleUrl: './modelos-section.component.css'
})
export class ModelosSectionComponent implements OnInit {
  // idMaterial - ID del material actual (recibido del padre)
  @Input() idMaterial: number | null = null;

  // lista de modelos del material
  modelos: ModeloDTO[] = [];

  // bandera de loading
  cargando: boolean = false;

  // mensaje de error
  error: string = '';

  constructor(
    private modeloService: ModeloService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    // cargar modelos cuando el componente se inicializa
    if (this.idMaterial) {
      this.cargarModelos();
    }
  }

  // cargarModelos - obtiene lista de modelos del material
  cargarModelos(): void {
    if (!this.idMaterial) return;

    this.cargando = true;
    this.error = '';

    this.modeloService.obtenerPorMaterial(this.idMaterial).subscribe({
      next: (modelos) => {
        this.modelos = modelos;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar modelos:', err);
        this.error = 'Error al cargar los modelos';
        this.cargando = false;
      }
    });
  }

  // abrirModalCrear - abre modal para crear nuevo modelo
  abrirModalCrear(): void {
    const dialogRef = this.dialog.open(ModeloModalComponent, {
      width: '600px',
      data: { idMaterial: this.idMaterial }
    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado) {
        // recargó la lista si el usuario creó un modelo
        this.cargarModelos();
      }
    });
  }

  // abrirModalEditar - abre modal para editar modelo
  // modelo - modelo a editar
  abrirModalEditar(modelo: ModeloDTO): void {
    const dialogRef = this.dialog.open(ModeloModalComponent, {
      width: '600px',
      data: { modelo }
    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado) {
        // recargó la lista si el usuario actualizó el modelo
        this.cargarModelos();
      }
    });
  }

  // eliminarModelo - elimina un modelo y recarga la lista
  // id - ID del modelo a eliminar
  eliminarModelo(id: number | undefined): void {
    if (!id) return;

    if (confirm('¿Estás seguro de que deseas eliminar este modelo?')) {
      this.modeloService.eliminar(id).subscribe({
        next: () => {
          this.cargarModelos();
        },
        error: (err) => {
          console.error('Error al eliminar modelo:', err);
          this.error = 'Error al eliminar el modelo';
        }
      });
    }
  }

  // recargar - recarga la lista de modelos
  recargar(): void {
    this.cargarModelos();
  }

  // obtenerEstado - retorna texto y color del estado activo/inactivo
  obtenerEstado(activo: boolean | undefined) {
    return {
      texto: activo ? 'Activo' : 'Inactivo',
      color: activo ? 'accent' : 'warn'
    };
  }
}