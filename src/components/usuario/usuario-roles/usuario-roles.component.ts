import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuarioService, UsuarioDTO, RolDTO } from '../../../services/usuario/usuario.service';
// ✅ RolDTO importado del service - no duplicado
// ✅ Sin HttpClient - usa solo el service

// ✅ Material Design imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-usuario-roles',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,        // ✅ Material Design
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './usuario-roles.component.html',
  styleUrls: ['./usuario-roles.component.css']
})
export class UsuarioRolesComponent implements OnInit {
  usuario?: UsuarioDTO;
  rolesDisponibles: RolDTO[] = [];
  rolesSeleccionados: Set<string> = new Set();
  
  // ✅ Estados de UI
  cargando = true;
  guardando = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private usuarioService: UsuarioService
    // ✅ Sin HttpClient - solo service
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarDatos(+id);  // ✅ Método separado
    }
  }

  // ✅ Carga datos en paralelo con manejo de errores
  cargarDatos(id: number) {
    this.cargando = true;

    Promise.all([
      this.usuarioService.obtenerPorId(id).toPromise(),
      this.usuarioService.obtenerRolesDisponibles().toPromise()  // ✅ Usa el service
    ]).then(([usuario, roles]) => {
      this.usuario = usuario;
      this.rolesDisponibles = roles || [];
      this.rolesSeleccionados = new Set(usuario?.roles || []);
      this.cargando = false;
    }).catch(err => {
      console.error('Error cargando datos', err);
      this.error = 'Error al cargar los datos';
      this.cargando = false;
    });
  }

  toggleRol(nombreRol: string) {
    if (this.rolesSeleccionados.has(nombreRol)) {
      this.rolesSeleccionados.delete(nombreRol);
    } else {
      this.rolesSeleccionados.add(nombreRol);
    }
  }

  // ✅ Método para checkbox
  isRolSeleccionado(nombreRol: string): boolean {
    return this.rolesSeleccionados.has(nombreRol);
  }

  // ✅ Guardar con feedback y manejo de errores
  guardar() {
    if (!this.usuario) return;

    this.guardando = true;
    this.error = '';

    this.usuarioService.actualizarRoles(this.usuario.id!, Array.from(this.rolesSeleccionados))
      .subscribe({
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
  }

  cancelar() {
    this.router.navigate(['/usuarios']);
  }

  // ✅ Métodos helper para UI
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