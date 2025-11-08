import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { MaterialService, MaterialDTO } from '../../../../../services/servicios-cotizaciones/material/material.service';
import { ServicioService, ServicioDTO } from '../../../../../services/servicio/servicio.service';

export interface MaterialModalData {
  material?: MaterialDTO;
  idServicio?: number;
}

@Component({
  selector: 'app-material-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './material-modal.component.html',
  styleUrl: './material-modal.component.css'
})
export class MaterialModalComponent implements OnInit {
  // formulario reactivo
  materialForm: FormGroup;

  // lista de servicios disponibles
  servicios: ServicioDTO[] = [];

  // bandera de loading
  cargando: boolean = false;

  // mensaje de error
  error: string = '';

  // bandera de edición
  editando: boolean = false;

  constructor(
    private fb: FormBuilder,
    private materialService: MaterialService,
    private servicioService: ServicioService,
    public dialogRef: MatDialogRef<MaterialModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MaterialModalData
  ) {
    this.materialForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      descripcion: ['', [Validators.maxLength(255)]],
      idServicio: ['', [Validators.required]]
    });

    if (data.material) {
      this.editando = true;
    }
  }

  ngOnInit(): void {
    this.cargarServicios();

    if (this.data.material) {
      this.materialForm.patchValue(this.data.material);
    }

    if (this.data.idServicio) {
      this.materialForm.patchValue({ idServicio: this.data.idServicio });
    }
  }

  // cargarServicios - obtiene lista de servicios disponibles
  cargarServicios(): void {
    this.servicioService.obtenerTodos().subscribe({
      next: (servicios) => {
        this.servicios = servicios;
      },
      error: (err) => {
        console.error('Error al cargar servicios:', err);
        this.error = 'Error al cargar los servicios disponibles';
      }
    });
  }

  // onSubmit - maneja el envío del formulario
  onSubmit(): void {
    if (this.materialForm.invalid) {
      this.error = 'Por favor completa todos los campos requeridos';
      return;
    }

    this.cargando = true;
    this.error = '';

    const dto: MaterialDTO = this.materialForm.value;

    if (this.editando && this.data.material?.idMaterial) {
      this.materialService.actualizar(this.data.material.idMaterial, dto).subscribe({
        next: (resultado) => {
          this.cargando = false;
          this.dialogRef.close(resultado);
        },
        error: (err) => {
          console.error('Error al actualizar material:', err);
          this.error = 'Error al actualizar el material';
          this.cargando = false;
        }
      });
    } else {
      this.materialService.crear(dto).subscribe({
        next: (resultado) => {
          this.cargando = false;
          this.dialogRef.close(resultado);
        },
        error: (err) => {
          console.error('Error al crear material:', err);
          this.error = 'Error al crear el material';
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