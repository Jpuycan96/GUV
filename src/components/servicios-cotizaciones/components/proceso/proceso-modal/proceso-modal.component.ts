import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { ProcesoService, ProcesoDTO } from '../../../../../services/servicios-cotizaciones/proceso/proceso.service';

export interface ProcesoModalData {
  proceso?: ProcesoDTO;
}

@Component({
  selector: 'app-proceso-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './proceso-modal.component.html',
  styleUrl: './proceso-modal.component.css'
})
export class ProcesoModalComponent implements OnInit {
  // formulario reactivo
  procesoForm: FormGroup;

  // bandera de loading
  cargando: boolean = false;

  // mensaje de error
  error: string = '';

  // bandera de edición
  editando: boolean = false;

  constructor(
    private fb: FormBuilder,
    private procesoService: ProcesoService,
    public dialogRef: MatDialogRef<ProcesoModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ProcesoModalData
  ) {
    this.procesoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      descripcion: ['', [Validators.maxLength(500)]],
      activo: [true]
    });

    if (data?.proceso) {
      this.editando = true;
    }
  }

  ngOnInit(): void {
    if (this.data?.proceso) {
      this.procesoForm.patchValue(this.data.proceso);
    }
  }

  // onSubmit - maneja el envío del formulario
  onSubmit(): void {
    if (this.procesoForm.invalid) {
      this.error = 'Por favor completa todos los campos requeridos';
      return;
    }

    this.cargando = true;
    this.error = '';

    const dto: ProcesoDTO = this.procesoForm.value;

    if (this.editando && this.data.proceso?.idProceso) {
      this.procesoService.actualizar(this.data.proceso.idProceso, dto).subscribe({
        next: (resultado) => {
          this.cargando = false;
          this.dialogRef.close(resultado);
        },
        error: (err) => {
          console.error('Error al actualizar proceso:', err);
          this.error = 'Error al actualizar el proceso. Verifica que el nombre no esté duplicado.';
          this.cargando = false;
        }
      });
    } else {
      this.procesoService.crear(dto).subscribe({
        next: (resultado) => {
          this.cargando = false;
          this.dialogRef.close(resultado);
        },
        error: (err) => {
          console.error('Error al crear proceso:', err);
          this.error = 'Error al crear el proceso. Verifica que el nombre no esté duplicado.';
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