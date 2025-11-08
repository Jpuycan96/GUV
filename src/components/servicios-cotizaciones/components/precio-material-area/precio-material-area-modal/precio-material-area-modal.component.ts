import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { PrecioMaterialAreaService, PrecioMaterialAreaDTO } from '../../../../../services/servicios-cotizaciones/precio-material-area/precio-material-area.service';
import { MaterialService, MaterialDTO } from '../../../../../services/servicios-cotizaciones/material/material.service';

export interface PrecioAreaModalData {
  precio?: PrecioMaterialAreaDTO;
  idServicio?: number;
}

@Component({
  selector: 'app-precio-material-area-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './precio-material-area-modal.component.html',
  styleUrl: './precio-material-area-modal.component.css'
})
export class PrecioMaterialAreaModalComponent implements OnInit {
  // formulario reactivo
  precioForm: FormGroup;

  // lista de materiales
  materiales: MaterialDTO[] = [];

  // bandera de loading
  cargando: boolean = false;

  // mensaje de error
  error: string = '';

  // bandera de edición
  editando: boolean = false;

  constructor(
    private fb: FormBuilder,
    private precioMaterialAreaService: PrecioMaterialAreaService,
    private materialService: MaterialService,
    public dialogRef: MatDialogRef<PrecioMaterialAreaModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PrecioAreaModalData
  ) {
    this.precioForm = this.fb.group({
      precioM2: ['', [Validators.required, Validators.min(0.01)]],
      unidadMedida: ['m2', [Validators.required]],
      idMaterial: ['', [Validators.required]]
    });

    if (data.precio) {
      this.editando = true;
    }
  }

  ngOnInit(): void {
    this.cargarMateriales();

    if (this.data.precio) {
      this.precioForm.patchValue(this.data.precio);
    }
  }

  // cargarMateriales - obtiene lista de materiales del servicio
  cargarMateriales(): void {
    if (!this.data.idServicio) {
      // si no hay idServicio, cargar todos
      this.materialService.obtenerTodos().subscribe({
        next: (materiales) => {
          this.materiales = materiales;
        },
        error: (err) => {
          console.error('Error al cargar materiales:', err);
          this.error = 'Error al cargar los materiales disponibles';
        }
      });
    } else {
      this.materialService.obtenerPorServicio(this.data.idServicio).subscribe({
        next: (materiales) => {
          this.materiales = materiales;
        },
        error: (err) => {
          console.error('Error al cargar materiales:', err);
          this.error = 'Error al cargar los materiales disponibles';
        }
      });
    }
  }

  // onSubmit - maneja el envío del formulario
  onSubmit(): void {
    if (this.precioForm.invalid) {
      this.error = 'Por favor completa todos los campos requeridos';
      return;
    }

    this.cargando = true;
    this.error = '';

    const dto: PrecioMaterialAreaDTO = {
      ...this.precioForm.value,
      idServicio: this.data.idServicio // ✅ AGREGAR idServicio
    };

    if (this.editando && this.data.precio?.idPrecioArea) {
      this.precioMaterialAreaService.actualizar(this.data.precio.idPrecioArea, dto).subscribe({
        next: (resultado) => {
          this.cargando = false;
          this.dialogRef.close(resultado);
        },
        error: (err) => {
          console.error('Error al actualizar precio:', err);
          this.error = 'Error al actualizar el precio';
          this.cargando = false;
        }
      });
    } else {
      this.precioMaterialAreaService.crear(dto).subscribe({
        next: (resultado) => {
          this.cargando = false;
          this.dialogRef.close(resultado);
        },
        error: (err) => {
          console.error('Error al crear precio:', err);
          this.error = 'Error al crear el precio';
          this.cargando = false;
        }
      });
    }
  }

  // cancelar - cierra el modal
  cancelar(): void {
    this.dialogRef.close();
  }
}