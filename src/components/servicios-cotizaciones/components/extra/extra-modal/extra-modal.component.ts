import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { ExtraService, ExtraDTO } from '../../../../../services/servicios-cotizaciones/extra/extra.service';

export interface ExtraModalData {
  extra?: ExtraDTO;
}

@Component({
  selector: 'app-extra-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './extra-modal.component.html',
  styleUrl: './extra-modal.component.css'
})
export class ExtraModalComponent implements OnInit {
  // formulario reactivo
  extraForm: FormGroup;

  // tipos de extras predefinidos
  tiposExtra: string[] = [
    'Acabado',
    'Corte',
    'Empaque',
    'Instalación',
    'Diseño',
    'Otro'
  ];

  // bandera de loading
  cargando: boolean = false;

  // mensaje de error
  error: string = '';

  // bandera de edición
  editando: boolean = false;

  constructor(
    private fb: FormBuilder,
    private extraService: ExtraService,
    public dialogRef: MatDialogRef<ExtraModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ExtraModalData
  ) {
    this.extraForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      tipo: ['Acabado', [Validators.required]]
    });

    if (data?.extra) {
      this.editando = true;
    }
  }

  ngOnInit(): void {
    if (this.data?.extra) {
      this.extraForm.patchValue(this.data.extra);
    }
  }

  // onSubmit - maneja el envío del formulario
  onSubmit(): void {
    if (this.extraForm.invalid) {
      this.error = 'Por favor completa todos los campos requeridos';
      return;
    }

    this.cargando = true;
    this.error = '';

    const dto: ExtraDTO = this.extraForm.value;

    if (this.editando && this.data.extra?.idExtra) {
      this.extraService.actualizar(this.data.extra.idExtra, dto).subscribe({
        next: (resultado) => {
          this.cargando = false;
          this.dialogRef.close(resultado);
        },
        error: (err) => {
          console.error('Error al actualizar extra:', err);
          this.error = 'Error al actualizar el extra';
          this.cargando = false;
        }
      });
    } else {
      this.extraService.crear(dto).subscribe({
        next: (resultado) => {
          this.cargando = false;
          this.dialogRef.close(resultado);
        },
        error: (err) => {
          console.error('Error al crear extra:', err);
          this.error = 'Error al crear el extra';
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