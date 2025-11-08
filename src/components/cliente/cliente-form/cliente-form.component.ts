import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ClienteService, ClienteDTO, CrearClienteDTO, ActualizarClienteDTO } from '../../../services/cliente/cliente.service';

// Material imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './cliente-form.component.html',
  styleUrls: ['./cliente-form.component.css']
})
export class ClienteFormComponent implements OnInit {
  cliente: CrearClienteDTO = { 
    nombre: '', 
    telefono: '', 
    email: '', 
    direccion: '',
    ruc: '',
    razonSocial: ''
  };
  
  editMode = false;
  idCliente?: number;
  cargando = false;
  guardando = false;
  error = '';

  constructor(
    private clienteService: ClienteService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editMode = true;
      this.idCliente = +id;
      this.cargarCliente(+id);
    }
  }

  cargarCliente(id: number) {
    this.cargando = true;
    this.clienteService.obtenerPorId(id).subscribe({
      next: (c) => {
        this.cliente = {
          nombre: c.nombre,
          telefono: c.telefono || '',
          email: c.email || '',
          direccion: c.direccion || '',
          ruc: c.ruc || '',
          razonSocial: c.razonSocial || ''
        };
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando cliente', err);
        this.error = 'Error al cargar el cliente';
        this.cargando = false;
      }
    });
  }

  guardar() {
    // Validaciones
    if (!this.cliente.nombre.trim()) {
      this.error = 'El nombre es obligatorio';
      return;
    }

    if (this.cliente.email && !this.validarEmail(this.cliente.email)) {
      this.error = 'El email no es válido';
      return;
    }

    this.guardando = true;
    this.error = '';

    if (this.editMode && this.idCliente) {
      // Actualizar cliente
      const dto: ActualizarClienteDTO = {
        nombre: this.cliente.nombre,
        telefono: this.cliente.telefono,
        email: this.cliente.email,
        direccion: this.cliente.direccion,
        ruc: this.cliente.ruc,
        razonSocial: this.cliente.razonSocial
      };

      this.clienteService.actualizar(this.idCliente, dto).subscribe({
        next: () => {
          this.guardando = false;
          this.router.navigate(['/clientes']);
        },
        error: (err) => {
          console.error('Error actualizando cliente', err);
          this.error = err.error?.message || 'Error al actualizar el cliente';
          this.guardando = false;
        }
      });
    } else {
      // Crear nuevo cliente
      this.clienteService.crear(this.cliente).subscribe({
        next: () => {
          this.guardando = false;
          this.router.navigate(['/clientes']);
        },
        error: (err) => {
          console.error('Error creando cliente', err);
          this.error = err.error?.message || 'Error al crear el cliente';
          this.guardando = false;
        }
      });
    }
  }

  cancelar() {
    this.router.navigate(['/clientes']);
  }

  validarEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
}