import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuarioService, UsuarioDTO, CrearUsuarioDTO, RolDTO } from '../../../services/usuario/usuario.service';

// Material imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './usuario-form.component.html',
  styleUrls: ['./usuario-form.component.css']
})
export class UsuarioFormComponent implements OnInit {
  usuario: CrearUsuarioDTO = { 
    nombre: '', 
    username: '', 
    password: '', 
    roles: [] 
  };
  
  editMode = false;
  idUsuario?: number;
  cargando = false;
  guardando = false;
  error = '';

  // Roles disponibles
  rolesDisponibles: RolDTO[] = [];
  rolesSeleccionados: Set<string> = new Set();

  constructor(
    private usuarioService: UsuarioService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Cargar roles disponibles
    this.cargarRolesDisponibles();

    // Verificar si es edición
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editMode = true;
      this.idUsuario = +id;
      this.cargarUsuario(+id);
    }
  }

  cargarRolesDisponibles() {
    this.usuarioService.obtenerRolesDisponibles().subscribe({
      next: (roles) => {
        this.rolesDisponibles = roles;
      },
      error: (err) => {
        console.error('Error cargando roles', err);
        this.error = 'Error al cargar los roles disponibles';
      }
    });
  }

  cargarUsuario(id: number) {
    this.cargando = true;
    this.usuarioService.obtenerPorId(id).subscribe({
      next: (u) => {
        this.usuario = {
          nombre: u.nombre,
          username: u.username,
          password: '', // No mostrar contraseña
          roles: u.roles
        };
        this.rolesSeleccionados = new Set(u.roles);
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando usuario', err);
        this.error = 'Error al cargar el usuario';
        this.cargando = false;
      }
    });
  }

  toggleRol(nombreRol: string) {
    if (this.rolesSeleccionados.has(nombreRol)) {
      this.rolesSeleccionados.delete(nombreRol);
    } else {
      this.rolesSeleccionados.add(nombreRol);
    }
  }

  isRolSeleccionado(nombreRol: string): boolean {
    return this.rolesSeleccionados.has(nombreRol);
  }

  guardar() {
    // Validaciones
    if (!this.usuario.nombre.trim()) {
      this.error = 'El nombre es obligatorio';
      return;
    }

    if (!this.usuario.username.trim()) {
      this.error = 'El username es obligatorio';
      return;
    }

    if (!this.editMode && !this.usuario.password.trim()) {
      this.error = 'La contraseña es obligatoria';
      return;
    }

    // Asignar roles seleccionados
    this.usuario.roles = Array.from(this.rolesSeleccionados);

    this.guardando = true;
    this.error = '';

    if (this.editMode && this.idUsuario) {
      // Actualizar usuario (sin password si no se cambió)
      const dto: any = { 
        nombre: this.usuario.nombre,
        username: this.usuario.username
      };
      
      if (this.usuario.password.trim()) {
        dto.password = this.usuario.password;
      }

      // Primero actualizar datos básicos
      this.usuarioService.actualizar(this.idUsuario, dto).subscribe({
        next: () => {
          // Luego actualizar roles
          this.usuarioService.actualizarRoles(this.idUsuario!, Array.from(this.rolesSeleccionados)).subscribe({
            next: () => {
              this.guardando = false;
              this.router.navigate(['/usuarios']);
            },
            error: (err) => {
              console.error('Error actualizando roles', err);
              this.error = 'Error al actualizar los roles';
              this.guardando = false;
            }
          });
        },
        error: (err) => {
          console.error('Error actualizando usuario', err);
          this.error = err.error?.message || 'Error al actualizar el usuario';
          this.guardando = false;
        }
      });
    } else {
      // Crear nuevo usuario
      this.usuarioService.crear(this.usuario).subscribe({
        next: () => {
          this.guardando = false;
          this.router.navigate(['/usuarios']);
        },
        error: (err) => {
          console.error('Error creando usuario', err);
          this.error = err.error?.message || 'Error al crear el usuario';
          this.guardando = false;
        }
      });
    }
  }

  cancelar() {
    this.router.navigate(['/usuarios']);
  }

  getRolLabel(rol: RolDTO): string {
    const labels: { [key: string]: string } = {
      'ROLE_ADMINISTRADOR': 'Administrador',
      'ROLE_VENDEDOR': 'Vendedor',
      'ROLE_CAJERO': 'Cajero',
      'ROLE_PRODUCCION': 'Producción'
    };
    return labels[rol.nombre] || rol.nombre.replace('ROLE_', '');
  }

  getRolDescription(rol: RolDTO): string {
    const descriptions: { [key: string]: string } = {
      'ROLE_ADMINISTRADOR': 'Acceso total al sistema',
      'ROLE_VENDEDOR': 'Gestión de órdenes y clientes',
      'ROLE_CAJERO': 'Gestión de caja y pagos',
      'ROLE_PRODUCCION': 'Gestión de procesos productivos'
    };
    return descriptions[rol.nombre] || '';
  }
}