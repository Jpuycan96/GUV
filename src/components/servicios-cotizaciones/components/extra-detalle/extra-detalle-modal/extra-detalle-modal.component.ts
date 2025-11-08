import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { ExtraDetalleService, ExtraDetalleDTO } from '../../../../../services/servicios-cotizaciones/extra-detalle/extra-detalle.service';

export interface ExtraDetalleModalData {
  idServicioExtra: number;
  detalle?: ExtraDetalleDTO;
}

@Component({
  selector: 'app-extra-detalle-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './extra-detalle-modal.component.html',
  styleUrl: './extra-detalle-modal.component.css'
})
export class ExtraDetalleModalComponent implements OnInit {
  // formulario reactivo
  detalleForm: FormGroup;

  // bandera de loading
  cargando: boolean = false;

  // mensaje de error
  error: string = '';

  // bandera de edición
  editando: boolean = false;

  constructor(
    private fb: FormBuilder,
    private extraDetalleService: ExtraDetalleService,
    public dialogRef: MatDialogRef<ExtraDetalleModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ExtraDetalleModalData
  ) {
    this.detalleForm = this.fb.group({
      precioExtraBase: ['', [Validators.required, Validators.min(0.01)]],
      unidadBaseExtra: ['unidad', [Validators.required]],
      cantidadMin: [''],
      cantidadMax: ['']
    });

    if (data.detalle) {
      this.editando = true;
    }
  }

  ngOnInit(): void {
    if (this.data.detalle) {
      this.detalleForm.patchValue(this.data.detalle);
    }
  }

  // onSubmit - maneja el envío del formulario
  onSubmit(): void {
    if (this.detalleForm.invalid) {
      this.error = 'Por favor completa todos los campos requeridos';
      return;
    }

    this.cargando = true;
    this.error = '';

    const dto: ExtraDetalleDTO = {
      ...this.detalleForm.value,
      idServicioExtra: this.data.idServicioExtra
    };

    // limpiar valores vacíos
    if (!dto.cantidadMin) {
      delete dto.cantidadMin;
    }
    if (!dto.cantidadMax) {
      delete dto.cantidadMax;
    }

    if (this.editando && this.data.detalle?.idExtraDetalle) {
      this.extraDetalleService.actualizar(this.data.detalle.idExtraDetalle, dto).subscribe({
        next: (resultado) => {
          this.cargando = false;
          this.dialogRef.close(resultado);
        },
        error: (err) => {
          console.error('Error al actualizar detalle:', err);
          this.error = 'Error al actualizar el detalle';
          this.cargando = false;
        }
      });
    } else {
      this.extraDetalleService.crear(dto).subscribe({
        next: (resultado) => {
          this.cargando = false;
          this.dialogRef.close(resultado);
        },
        error: (err) => {
          console.error('Error al crear detalle:', err);
          this.error = 'Error al crear el detalle';
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