import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';

import { MaterialService, MaterialDTO } from '../../../../../services/servicios-cotizaciones/material/material.service';
import { MaterialModalComponent } from '../../../components/material/material-modal/material-modal.component';
import { ModelosSectionComponent } from '../modelos-section/modelos-section.component';

@Component({
  selector: 'app-materiales-section',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    ModelosSectionComponent
  ],
  templateUrl: './materiales-section.component.html',
  styleUrl: './materiales-section.component.css'
})
export class MaterialesSectionComponent implements OnInit {
  // idServicio - ID del servicio actual (recibido del padre)
  @Input() idServicio: number | null = null;

  // lista de materiales del servicio
  materiales: MaterialDTO[] = [];

  // material seleccionado para ver sus modelos
  materialSeleccionado: MaterialDTO | null = null;

  // bandera de loading
  cargando: boolean = false;

  // mensaje de error
  error: string = '';

  constructor(
    private materialService: MaterialService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    // cargar materiales cuando el componente se inicializa
    if (this.idServicio) {
      this.cargarMateriales();
    }
  }

  // cargarMateriales - obtiene lista de materiales del servicio
  cargarMateriales(): void {
    if (!this.idServicio) return;

    this.cargando = true;
    this.error = '';

    this.materialService.obtenerPorServicio(this.idServicio).subscribe({
      next: (materiales) => {
        this.materiales = materiales;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar materiales:', err);
        this.error = 'Error al cargar los materiales';
        this.cargando = false;
      }
    });
  }

  // abrirModalCrear - abre modal para crear nuevo material
  abrirModalCrear(): void {
    const dialogRef = this.dialog.open(MaterialModalComponent, {
      width: '600px',
      data: { idServicio: this.idServicio }
    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado) {
        // recarga la lista si el usuario creó un material
        this.cargarMateriales();
      }
    });
  }

  // abrirModalEditar - abre modal para editar material
  // material - material a editar
  abrirModalEditar(material: MaterialDTO): void {
    const dialogRef = this.dialog.open(MaterialModalComponent, {
      width: '600px',
      data: { material, idServicio: this.idServicio }
    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado) {
        // recarga la lista si el usuario actualizó el material
        this.cargarMateriales();
      }
    });
  }

  // eliminarMaterial - elimina un material y recarga la lista
  // id - ID del material a eliminar
  eliminarMaterial(id: number | undefined): void {
    if (!id) return;

    if (confirm('¿Estás seguro de que deseas eliminar este material? Se eliminarán también todos sus modelos.')) {
      this.materialService.eliminar(id).subscribe({
        next: () => {
          this.cargarMateriales();
          // si el material eliminado estaba seleccionado, limpiar la selección
          if (this.materialSeleccionado?.idMaterial === id) {
            this.materialSeleccionado = null;
          }
        },
        error: (err) => {
          console.error('Error al eliminar material:', err);
          this.error = 'Error al eliminar el material';
        }
      });
    }
  }

  // seleccionarMaterial - marca un material como seleccionado para ver sus modelos
  // material - material seleccionado
  seleccionarMaterial(material: MaterialDTO): void {
    this.materialSeleccionado = material;
  }

  // recargar - recarga la lista de materiales
  recargar(): void {
    this.cargarMateriales();
  }
}