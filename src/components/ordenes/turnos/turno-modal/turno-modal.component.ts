import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TurnoService, TurnoDTO } from '../../../../services/ordenes/turno/turno.service';

export interface TurnoModalData {
  turno?: TurnoDTO;
}

@Component({
  selector: 'app-turno-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './turno-modal.component.html',
  styleUrl: './turno-modal.component.css'
})
export class TurnoModalComponent implements OnInit {
  // formulario reactivo
  turnoForm: FormGroup;

  // bandera de loading
  cargando: boolean = false;

  // mensaje de error
  error: string = '';

  // bandera de edición
  editando: boolean = false;

  constructor(
    private fb: FormBuilder,
    private turnoService: TurnoService,
    public dialogRef: MatDialogRef<TurnoModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TurnoModalData
  ) {
    this.turnoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      horaInicio: ['', [Validators.required]],
      horaFin: ['', [Validators.required]],
      montoInicialDefault: [0, [Validators.required, Validators.min(0)]],
      activo: [true]
    });

    if (data?.turno) {
      this.editando = true;
    }
  }

  ngOnInit(): void {
    if (this.data?.turno) {
      this.turnoForm.patchValue(this.data.turno);
    }
  }

  // onSubmit - maneja el envío del formulario
  onSubmit(): void {
    if (this.turnoForm.invalid) {
      this.error = 'Por favor completa todos los campos requeridos correctamente';
      Object.keys(this.turnoForm.controls).forEach(key => {
        this.turnoForm.get(key)?.markAsTouched();
      });
      return;
    }

    // Validar que hora fin sea mayor que hora inicio
    const horaInicio = this.turnoForm.get('horaInicio')?.value;
    const horaFin = this.turnoForm.get('horaFin')?.value;
    
    if (horaInicio && horaFin && horaInicio >= horaFin) {
      this.error = 'La hora de fin debe ser mayor a la hora de inicio';
      return;
    }

    this.cargando = true;
    this.error = '';

    const dto: TurnoDTO = this.turnoForm.value;

    if (this.editando && this.data.turno?.idTurno) {
      this.turnoService.actualizar(this.data.turno.idTurno, dto).subscribe({
        next: (resultado) => {
          this.cargando = false;
          this.dialogRef.close(resultado);
        },
        error: (err) => {
          console.error('Error al actualizar turno:', err);
          this.error = 'Error al actualizar el turno';
          this.cargando = false;
        }
      });
    } else {
      this.turnoService.crear(dto).subscribe({
        next: (resultado) => {
          this.cargando = false;
          this.dialogRef.close(resultado);
        },
        error: (err) => {
          console.error('Error al crear turno:', err);
          this.error = 'Error al crear el turno';
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