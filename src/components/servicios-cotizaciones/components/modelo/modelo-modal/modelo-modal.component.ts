import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { ModeloService, ModeloDTO } from '../../../../../services/servicios-cotizaciones/modelo/modelo.service';
import { MaterialService, MaterialDTO } from '../../../../../services/servicios-cotizaciones/material/material.service';
export interface ModeloModalData {
  modelo?: ModeloDTO;
  idMaterial?: number;
}

@Component({
  selector: 'app-modelo-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modelo-modal.component.html',
  styleUrl: './modelo-modal.component.css'
})
export class ModeloModalComponent implements OnInit {
  // formulario reactivo
  modeloForm: FormGroup;

  // lista de materiales disponibles
  materiales: MaterialDTO[] = [];

  // bandera de loading
  cargando: boolean = false;

  // mensaje de error
  error: string = '';

  // bandera de edición
  editando: boolean = false;

  constructor(
    private fb: FormBuilder,
    private modeloService: ModeloService,
    private materialService: MaterialService,
    public dialogRef: MatDialogRef<ModeloModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ModeloModalData
  ) {
    this.modeloForm = this.fb.group({
      codigo: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)]],
      descripcion: ['', [Validators.maxLength(255)]],
      activo: [true],
      idMaterial: ['', [Validators.required]]
    });

    if (data.modelo) {
      this.editando = true;
    }
  }

  ngOnInit(): void {
    this.cargarMateriales();

    if (this.data.modelo) {
      this.modeloForm.patchValue(this.data.modelo);
    }

    if (this.data.idMaterial) {
      this.modeloForm.patchValue({ idMaterial: this.data.idMaterial });
    }
  }

  // cargarMateriales - obtiene lista de materiales disponibles
  cargarMateriales(): void {
    this.materialService.obtenerTodos().subscribe({
      next: (materiales) => {
        this.materiales = materiales;
      },
      error: (err) => {
        console.error('Error al cargar materiales:', err);
        this.error = 'Error al cargar los materiales disponibles';
      }
    });
  }

  // onSubmit - maneja el envío del formulario
  onSubmit(): void {
    if (this.modeloForm.invalid) {
      this.error = 'Por favor completa todos los campos requeridos';
      return;
    }

    this.cargando = true;
    this.error = '';

    const dto: ModeloDTO = this.modeloForm.value;

    if (this.editando && this.data.modelo?.idModelo) {
      this.modeloService.actualizar(this.data.modelo.idModelo, dto).subscribe({
        next: (resultado) => {
          this.cargando = false;
          this.dialogRef.close(resultado);
        },
        error: (err) => {
          console.error('Error al actualizar modelo:', err);
          this.error = 'Error al actualizar el modelo';
          this.cargando = false;
        }
      });
    } else {
      this.modeloService.crear(dto).subscribe({
        next: (resultado) => {
          this.cargando = false;
          this.dialogRef.close(resultado);
        },
        error: (err) => {
          console.error('Error al crear modelo:', err);
          this.error = 'Error al crear el modelo';
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