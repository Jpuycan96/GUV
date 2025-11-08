import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClienteService, ClienteDTO } from '../../../services/cliente/cliente.service';
import { PermisosService } from '../../../services/permisos/permisos.service';

// Material imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';

interface Stats {
  totalClientes: number;
  activos: number;
  inactivos: number;
}

@Component({
  selector: 'app-cliente-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule
  ],
  templateUrl: './cliente-list.component.html',
  styleUrls: ['./cliente-list.component.css']
})
export class ClienteListComponent implements OnInit {
  clientes: ClienteDTO[] = [];
  clientesFiltrados: ClienteDTO[] = [];
  cargando = true;
  error = '';

  // Estadísticas
  stats: Stats = {
    totalClientes: 0,
    activos: 0,
    inactivos: 0
  };

  // Filtros
  filtroEstado: string = 'TODOS';
  filtroTexto: string = '';

  // Columnas de la tabla
  displayedColumns: string[] = ['id', 'nombre', 'telefono', 'email', 'ruc', 'estado', 'acciones'];

  constructor(
    private clienteService: ClienteService,
    private router: Router,
    public permisos: PermisosService
  ) {}

  ngOnInit(): void {
    // Verificar si tiene permiso para ver clientes
    if (!this.permisos.tiene('clientes', 'ver')) {
      console.log('Usuario sin permisos para ver clientes, redirigiendo...');
      this.router.navigate(['/']);
      return;
    }
    
    this.cargarClientes();
  }

  // Métodos de permisos para usar en el template
  puedeCrear(): boolean {
    return this.permisos.tiene('clientes', 'crear');
  }

  puedeEditar(): boolean {
    return this.permisos.tiene('clientes', 'editar');
  }

  puedeDeshabilitar(): boolean {
    return this.permisos.tiene('clientes', 'deshabilitar');
  }

  cargarClientes() {
    this.cargando = true;
    this.error = '';
    
    this.clienteService.listar().subscribe({
      next: (data) => {
        this.clientes = data;
        this.calcularEstadisticas();
        this.aplicarFiltros();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando clientes', err);
        this.error = 'Error al cargar los clientes';
        this.cargando = false;
      }
    });
  }

  calcularEstadisticas() {
    this.stats.totalClientes = this.clientes.length;
    this.stats.activos = this.clientes.filter(c => c.enabled).length;
    this.stats.inactivos = this.clientes.filter(c => !c.enabled).length;
  }

  aplicarFiltros() {
    this.clientesFiltrados = this.clientes.filter(cliente => {
      // Filtro por estado
      if (this.filtroEstado === 'ACTIVOS' && !cliente.enabled) return false;
      if (this.filtroEstado === 'INACTIVOS' && cliente.enabled) return false;

      // Filtro por texto (busca en nombre, email, teléfono, ruc)
      if (this.filtroTexto) {
        const texto = this.filtroTexto.toLowerCase();
        const coincide = 
          cliente.nombre.toLowerCase().includes(texto) ||
          (cliente.email && cliente.email.toLowerCase().includes(texto)) ||
          (cliente.telefono && cliente.telefono.toLowerCase().includes(texto)) ||
          (cliente.ruc && cliente.ruc.toLowerCase().includes(texto));
        if (!coincide) return false;
      }

      return true;
    });
  }

  limpiarFiltros() {
    this.filtroEstado = 'TODOS';
    this.filtroTexto = '';
    this.aplicarFiltros();
  }

  recargar() {
    this.cargarClientes();
  }

  nuevoCliente() {
    if (!this.puedeCrear()) {
      alert('No tienes permisos para crear clientes');
      return;
    }
    this.router.navigate(['/clientes/nuevo']);
  }

  editarCliente(id: number, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    
    if (!this.puedeEditar()) {
      alert('No tienes permisos para editar clientes');
      return;
    }
    
    this.router.navigate(['/clientes/editar', id]);
  }

  toggleEstado(cliente: ClienteDTO, event: Event) {
    event.stopPropagation();
    
    if (!this.puedeDeshabilitar()) {
      alert('No tienes permisos para deshabilitar/habilitar clientes');
      return;
    }
    
    const accion = cliente.enabled ? 'deshabilitar' : 'habilitar';
    if (!confirm(`¿Desea ${accion} al cliente ${cliente.nombre}?`)) {
      return;
    }

    if (cliente.enabled) {
      this.clienteService.deshabilitar(cliente.idCliente!).subscribe({
        next: () => this.cargarClientes(),
        error: (err) => {
          console.error('Error al deshabilitar', err);
          alert('Error al deshabilitar el cliente');
        }
      });
    } else {
      this.clienteService.habilitar(cliente.idCliente!).subscribe({
        next: () => this.cargarClientes(),
        error: (err) => {
          console.error('Error al habilitar', err);
          alert('Error al habilitar el cliente');
        }
      });
    }
  }
}