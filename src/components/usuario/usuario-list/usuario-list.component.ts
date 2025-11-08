import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UsuarioService, UsuarioDTO } from '../../../services/usuario/usuario.service';

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
  totalUsuarios: number;
  activos: number;
  inactivos: number;
  porRol: { [key: string]: number };
}

@Component({
  selector: 'app-usuario-list',
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
  templateUrl: './usuario-list.component.html',
  styleUrls: ['./usuario-list.component.css']
})
export class UsuarioListComponent implements OnInit {
  usuarios: UsuarioDTO[] = [];
  usuariosFiltrados: UsuarioDTO[] = [];
  cargando = true;
  error = '';

  // Estadísticas
  stats: Stats = {
    totalUsuarios: 0,
    activos: 0,
    inactivos: 0,
    porRol: {}
  };

  // Filtros
  filtroEstado: string = 'TODOS';
  filtroRol: string = 'TODOS';
  filtroTexto: string = '';

  // Columnas de la tabla
  displayedColumns: string[] = ['id', 'nombre', 'username', 'roles', 'estado', 'acciones'];

  constructor(
    private usuarioService: UsuarioService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.cargando = true;
    this.error = '';
    
    this.usuarioService.listar().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.calcularEstadisticas();
        this.aplicarFiltros();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando usuarios', err);
        this.error = 'Error al cargar los usuarios';
        this.cargando = false;
      }
    });
  }

  calcularEstadisticas() {
    this.stats.totalUsuarios = this.usuarios.length;
    this.stats.activos = this.usuarios.filter(u => u.enabled).length;
    this.stats.inactivos = this.usuarios.filter(u => !u.enabled).length;

    // Contar por rol
    this.stats.porRol = {};
    this.usuarios.forEach(usuario => {
      usuario.roles.forEach(rol => {
        this.stats.porRol[rol] = (this.stats.porRol[rol] || 0) + 1;
      });
    });
  }

  aplicarFiltros() {
    this.usuariosFiltrados = this.usuarios.filter(usuario => {
      // Filtro por estado
      if (this.filtroEstado === 'ACTIVOS' && !usuario.enabled) return false;
      if (this.filtroEstado === 'INACTIVOS' && usuario.enabled) return false;

      // Filtro por rol
      if (this.filtroRol !== 'TODOS') {
        if (!usuario.roles.includes(this.filtroRol)) return false;
      }

      // Filtro por texto (busca en nombre y username)
      if (this.filtroTexto) {
        const texto = this.filtroTexto.toLowerCase();
        const coincide = 
          usuario.nombre.toLowerCase().includes(texto) ||
          usuario.username.toLowerCase().includes(texto);
        if (!coincide) return false;
      }

      return true;
    });
  }

  limpiarFiltros() {
    this.filtroEstado = 'TODOS';
    this.filtroRol = 'TODOS';
    this.filtroTexto = '';
    this.aplicarFiltros();
  }

  recargar() {
    this.cargarUsuarios();
  }

  nuevoUsuario() {
    this.router.navigate(['/usuarios/nuevo']);
  }

  editarUsuario(id: number, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.router.navigate(['/usuarios', id, 'editar']);
  }

  gestionarRoles(id: number, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.router.navigate(['/usuarios', id, 'roles']);
  }

  toggleEstado(usuario: UsuarioDTO, event: Event) {
    event.stopPropagation();
    
    const accion = usuario.enabled ? 'deshabilitar' : 'habilitar';
    if (!confirm(`¿Desea ${accion} al usuario ${usuario.nombre}?`)) {
      return;
    }

    if (usuario.enabled) {
      this.usuarioService.deshabilitar(usuario.id!).subscribe({
        next: () => this.cargarUsuarios(),
        error: (err) => {
          console.error('Error al deshabilitar', err);
          alert('Error al deshabilitar el usuario');
        }
      });
    } else {
      this.usuarioService.habilitar(usuario.id!).subscribe({
        next: () => this.cargarUsuarios(),
        error: (err) => {
          console.error('Error al habilitar', err);
          alert('Error al habilitar el usuario');
        }
      });
    }
  }

  getRolesDisponibles(): string[] {
    const rolesUnicos = new Set<string>();
    this.usuarios.forEach(u => u.roles.forEach(r => rolesUnicos.add(r)));
    return Array.from(rolesUnicos);
  }

  getRolLabel(rol: string): string {
    const labels: { [key: string]: string } = {
      'ROLE_ADMINISTRADOR': 'Administrador',
      'ADMINISTRADOR': 'Administrador',
      'ROLE_VENDEDOR': 'Vendedor',
      'VENDEDOR': 'Vendedor',
      'ROLE_CAJERO': 'Cajero',
      'CAJERO': 'Cajero',
      'ROLE_PRODUCCION': 'Producción',
      'PRODUCCION': 'Producción',
      'ROLE_DISEÑADOR': 'Diseñador',
      'DISEÑADOR': 'Diseñador'
    };
    return labels[rol] || rol.replace('ROLE_', '');
  }

  getRolClass(rol: string): string {
    const classes: { [key: string]: string } = {
      'ROLE_ADMINISTRADOR': 'rol-admin',
      'ADMINISTRADOR': 'rol-admin',
      'ROLE_VENDEDOR': 'rol-vendedor',
      'VENDEDOR': 'rol-vendedor',
      'ROLE_CAJERO': 'rol-cajero',
      'CAJERO': 'rol-cajero',
      'ROLE_PRODUCCION': 'rol-produccion',
      'PRODUCCION': 'rol-produccion',
      'ROLE_DISEÑADOR': 'rol-diseñador',
      'DISEÑADOR': 'rol-diseñador'
    };
    return classes[rol] || 'rol-default';
  }
}