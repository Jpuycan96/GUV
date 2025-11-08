import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';

import { ServicioExtraService, ServicioExtraDTO } from '../../../../../services/servicios-cotizaciones/servicio-extra/servicio-extra.service';
import { ExtraService, ExtraDTO } from '../../../../../services/servicios-cotizaciones/extra/extra.service';
import { ExtraModalComponent } from '../../extra/extra-modal/extra-modal.component';

export interface ServicioExtraModalData {
  idServicio: number;
}

@Component({
  selector: 'app-servicio-extra-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './servicio-extra-modal.component.html',
  styleUrl: './servicio-extra-modal.component.css'
})
export class ServicioExtraModalComponent implements OnInit {
  // formulario reactivo
  servicioExtraForm: FormGroup;

  // lista de extras disponibles
  extras: ExtraDTO[] = [];

  // bandera de loading
  cargando: boolean = false;

  // mensaje de error
  error: string = '';

  constructor(
    private fb: FormBuilder,
    private servicioExtraService: ServicioExtraService,
    private extraService: ExtraService,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<ServicioExtraModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ServicioExtraModalData
  ) {
    this.servicioExtraForm = this.fb.group({
      idExtra: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.cargarExtras();
  }

  // cargarExtras - obtiene lista de extras disponibles
  cargarExtras(): void {
    this.extraService.obtenerTodos().subscribe({
      next: (extras) => {
        this.extras = extras;
      },
      error: (err) => {
        console.error('Error al cargar extras:', err);
        this.error = 'Error al cargar los extras disponibles';
      }
    });
  }

  // abrirModalCrearExtra - abre modal para crear nuevo extra
  abrirModalCrearExtra(): void {
    const dialogRef = this.dialog.open(ExtraModalComponent, {
      width: '600px'
    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado) {
        this.cargarExtras();
        // Seleccionar automáticamente el extra recién creado
        this.servicioExtraForm.patchValue({ idExtra: resultado.idExtra });
      }
    });
  }

  // onSubmit - maneja el envío del formulario
  onSubmit(): void {
    if (this.servicioExtraForm.invalid) {
      this.error = 'Por favor selecciona un extra';
      return;
    }

    this.cargando = true;
    this.error = '';

    const dto: ServicioExtraDTO = {
      idServicio: this.data.idServicio,
      idExtra: this.servicioExtraForm.value.idExtra
    };

    this.servicioExtraService.crear(dto).subscribe({
      next: (resultado) => {
        this.cargando = false;
        this.dialogRef.close(resultado);
      },
      error: (err) => {
        console.error('Error al agregar extra:', err);
        this.error = 'Error al agregar el extra al servicio';
        this.cargando = false;
      }
    });
  }

  // cancelar - cierra el modal
  cancelar(): void {
    this.dialogRef.close();
  }
}