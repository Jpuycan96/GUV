import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ServicioService, ServicioDTO } from '../../../../services/servicios-cotizaciones/servicio/servicio.service';

export interface ServicioAdminModalData {
  servicio?: ServicioDTO;
}

@Component({
  selector: 'app-servicio-admin-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './servicio-admin-modal.component.html',
  styleUrl: './servicio-admin-modal.component.css'
})
export class ServicioAdminModalComponent implements OnInit {
  // formulario reactivo
  servicioForm: FormGroup;

  // bandera de loading
  cargando: boolean = false;

  // mensaje de error
  error: string = '';

  // bandera de edición
  editando: boolean = false;

  // ✨ NUEVO: archivo de imagen seleccionado
  archivoSeleccionado: File | null = null;

  // ✨ NUEVO: URL de preview de la imagen
  imagenPreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private servicioService: ServicioService,
    public dialogRef: MatDialogRef<ServicioAdminModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ServicioAdminModalData
  ) {
    this.servicioForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      descripcion: ['', [Validators.maxLength(500)]]
    });

    if (data?.servicio) {
      this.editando = true;
    }
  }

  ngOnInit(): void {
    if (this.data?.servicio) {
      this.servicioForm.patchValue(this.data.servicio);
      // Si hay imagen existente, mostrarla
      if (this.data.servicio.imagenUrl) {
        this.imagenPreview = this.data.servicio.imagenUrl;
      }
    }
  }

  // ✨ NUEVO: maneja la selección de archivo
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        this.error = 'Por favor selecciona un archivo de imagen válido';
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.error = 'La imagen no debe superar los 5MB';
        return;
      }

      this.archivoSeleccionado = file;
      this.error = '';

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagenPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // ✨ NUEVO: eliminar imagen seleccionada
  eliminarImagen(): void {
    this.archivoSeleccionado = null;
    this.imagenPreview = this.editando && this.data.servicio?.imagenUrl 
      ? this.data.servicio.imagenUrl 
      : null;
    
    // Limpiar el input file
    const fileInput = document.getElementById('imagen') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  // ✨ NUEVO: abre el selector de archivos
  abrirSelectorArchivo(): void {
    const fileInput = document.getElementById('imagen') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  // onSubmit - maneja el envío del formulario
  onSubmit(): void {
    if (this.servicioForm.invalid) {
      this.error = 'Por favor completa todos los campos requeridos';
      return;
    }

    this.cargando = true;
    this.error = '';

    // ✨ MODIFICADO: usar FormData si hay imagen
    if (this.archivoSeleccionado) {
      const formData = new FormData();
      formData.append('nombre', this.servicioForm.get('nombre')?.value);
      
      const descripcion = this.servicioForm.get('descripcion')?.value;
      if (descripcion) {
        formData.append('descripcion', descripcion);
      }
      
      formData.append('imagen', this.archivoSeleccionado);

      if (this.editando && this.data.servicio?.idServicio) {
        this.servicioService.actualizarConImagen(this.data.servicio.idServicio, formData).subscribe({
          next: (resultado) => {
            this.cargando = false;
            this.dialogRef.close(resultado);
          },
          error: (err) => {
            console.error('Error al actualizar servicio:', err);
            this.error = 'Error al actualizar el servicio';
            this.cargando = false;
          }
        });
      } else {
        this.servicioService.crearConImagen(formData).subscribe({
          next: (resultado) => {
            this.cargando = false;
            this.dialogRef.close(resultado);
          },
          error: (err) => {
            console.error('Error al crear servicio:', err);
            this.error = 'Error al crear el servicio';
            this.cargando = false;
          }
        });
      }
    } else {
      // Sin imagen: usar método tradicional con JSON
      const dto: ServicioDTO = this.servicioForm.value;

      if (this.editando && this.data.servicio?.idServicio) {
        this.servicioService.actualizar(this.data.servicio.idServicio, dto).subscribe({
          next: (resultado) => {
            this.cargando = false;
            this.dialogRef.close(resultado);
          },
          error: (err) => {
            console.error('Error al actualizar servicio:', err);
            this.error = 'Error al actualizar el servicio';
            this.cargando = false;
          }
        });
      } else {
        this.servicioService.crear(dto).subscribe({
          next: (resultado) => {
            this.cargando = false;
            this.dialogRef.close(resultado);
          },
          error: (err) => {
            console.error('Error al crear servicio:', err);
            this.error = 'Error al crear el servicio';
            this.cargando = false;
          }
        });
      }
    }
  }

  // cancelar - cierra el modal
  cancelar(): void {
    this.dialogRef.close();
  }
}