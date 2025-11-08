import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { PrecioEscalaService, PrecioEscalaDTO } from '../../../../../services/servicios-cotizaciones/precio-escala/precio-escala.service';
import { MaterialService, MaterialDTO } from '../../../../../services/servicios-cotizaciones/material/material.service';
import { ModeloService, ModeloDTO } from '../../../../../services/servicios-cotizaciones/modelo/modelo.service';

export interface PrecioEscalaModalData {
  precio?: PrecioEscalaDTO;
  idServicio?: number;
}

@Component({
  selector: 'app-precio-escala-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './precio-escala-modal.component.html',
  styleUrl: './precio-escala-modal.component.css'
})
export class PrecioEscalaModalComponent implements OnInit {
  // formulario reactivo
  precioForm: FormGroup;

  // listas disponibles
  materiales: MaterialDTO[] = [];
  modelos: ModeloDTO[] = [];

  // bandera de loading
  cargando: boolean = false;

  // mensaje de error
  error: string = '';

  // bandera de edición
  editando: boolean = false;

  constructor(
    private fb: FormBuilder,
    private precioEscalaService: PrecioEscalaService,
    private materialService: MaterialService,
    private modeloService: ModeloService,
    public dialogRef: MatDialogRef<PrecioEscalaModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PrecioEscalaModalData
  ) {
    this.precioForm = this.fb.group({
      cantidadMin: ['', [Validators.required, Validators.min(1)]],
      cantidadMax: ['', [Validators.min(1)]],
      precioUnitario: ['', [Validators.required, Validators.min(0.01)]],
      unidadMedida: ['unidad', [Validators.required]],
      idMaterial: ['', [Validators.required]],
      idModelo: ['']
    });

    if (data.precio) {
      this.editando = true;
    }
  }

  ngOnInit(): void {
    this.cargarMateriales();

    if (this.data.precio) {
      this.precioForm.patchValue(this.data.precio);
      
      // si tiene material, cargar sus modelos
      if (this.data.precio.idMaterial) {
        this.cargarModelos(this.data.precio.idMaterial);
      }
    }

    // escuchar cambios en material para cargar modelos
    this.precioForm.get('idMaterial')?.valueChanges.subscribe(idMaterial => {
      if (idMaterial) {
        this.cargarModelos(idMaterial);
        this.precioForm.patchValue({ idModelo: '' }); // resetear modelo
      }
    });
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

  // cargarModelos - obtiene modelos del material seleccionado
  cargarModelos(idMaterial: number): void {
    this.modeloService.obtenerPorMaterial(idMaterial).subscribe({
      next: (modelos) => {
        this.modelos = modelos.filter(m => m.activo); // solo activos
      },
      error: (err) => {
        console.error('Error al cargar modelos:', err);
      }
    });
  }

  // onSubmit - maneja el envío del formulario
  onSubmit(): void {
    if (this.precioForm.invalid) {
      this.error = 'Por favor completa todos los campos requeridos';
      return;
    }

    this.cargando = true;
    this.error = '';

    const dto: PrecioEscalaDTO = {
      ...this.precioForm.value,
      idServicio: this.data.idServicio // ✅ AGREGAR idServicio
    };

    // si idModelo está vacío, quitarlo del DTO
    if (!dto.idModelo) {
      delete dto.idModelo;
    }

    // si cantidadMax está vacío, quitarlo (significa infinito)
    if (!dto.cantidadMax) {
      delete dto.cantidadMax;
    }

    if (this.editando && this.data.precio?.idPrecioEscala) {
      this.precioEscalaService.actualizar(this.data.precio.idPrecioEscala, dto).subscribe({
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
      this.precioEscalaService.crear(dto).subscribe({
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