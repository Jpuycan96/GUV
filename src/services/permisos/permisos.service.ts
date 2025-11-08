import { Injectable } from '@angular/core';
import { AuthService } from '../AuthService';

export type Modulo = 'usuarios' | 'clientes' | 'ordenes' | 'turnos' | 'cajas' | 'pagos' | 'ventas' | 'produccion' | 'reportes' | 'servicios';
export type Accion = 'ver' | 'crear' | 'editar' | 'eliminar' | 'gestionar_roles' | 'habilitar' | 'deshabilitar';

@Injectable({
  providedIn: 'root'
})
export class PermisosService {

  // Matriz de permisos: { modulo: { accion: [roles_permitidos] } }
  private permisos: Record<Modulo, Record<string, string[]>> = {
    usuarios: {
      ver: ['ROLE_ADMINISTRADOR'],
      crear: ['ROLE_ADMINISTRADOR'],
      editar: ['ROLE_ADMINISTRADOR'],
      gestionar_roles: ['ROLE_ADMINISTRADOR'],
      habilitar: ['ROLE_ADMINISTRADOR'],
      deshabilitar: ['ROLE_ADMINISTRADOR']
    },
    clientes: {
      ver: ['ROLE_ADMINISTRADOR', 'ROLE_VENDEDOR', 'ROLE_CAJERO'],
      crear: ['ROLE_ADMINISTRADOR', 'ROLE_VENDEDOR'],
      editar: ['ROLE_ADMINISTRADOR', 'ROLE_VENDEDOR'],
      deshabilitar: ['ROLE_ADMINISTRADOR']
    },
    ordenes: {
      ver: ['ROLE_ADMINISTRADOR', 'ROLE_VENDEDOR', 'ROLE_CAJERO', 'ROLE_PRODUCCION', 'ROLE_DISEÑADOR'],
      crear: ['ROLE_ADMINISTRADOR', 'ROLE_VENDEDOR'],
      editar: ['ROLE_ADMINISTRADOR', 'ROLE_VENDEDOR'],
      eliminar: ['ROLE_ADMINISTRADOR']
    },
    turnos: {
      ver: ['ROLE_ADMINISTRADOR', 'ROLE_VENDEDOR'],
      crear: ['ROLE_ADMINISTRADOR', 'ROLE_VENDEDOR'],
      editar: ['ROLE_ADMINISTRADOR', 'ROLE_VENDEDOR']
    },
    cajas: {
      ver: ['ROLE_ADMINISTRADOR', 'ROLE_VENDEDOR', 'ROLE_CAJERO'],
      crear: ['ROLE_ADMINISTRADOR', 'ROLE_CAJERO'],
      editar: ['ROLE_ADMINISTRADOR', 'ROLE_CAJERO']
    },
    pagos: {
      ver: ['ROLE_ADMINISTRADOR', 'ROLE_CAJERO'],
      crear: ['ROLE_ADMINISTRADOR', 'ROLE_CAJERO'],
      editar: ['ROLE_ADMINISTRADOR', 'ROLE_CAJERO'],
      eliminar: ['ROLE_ADMINISTRADOR', 'ROLE_CAJERO']
    },
    ventas: {
      ver: ['ROLE_ADMINISTRADOR', 'ROLE_VENDEDOR', 'ROLE_CAJERO'],
      crear: ['ROLE_ADMINISTRADOR', 'ROLE_CAJERO'],
      editar: ['ROLE_ADMINISTRADOR', 'ROLE_CAJERO'],
      eliminar: ['ROLE_ADMINISTRADOR']
    },
    produccion: {
      ver: ['ROLE_ADMINISTRADOR', 'ROLE_PRODUCCION'],
      editar: ['ROLE_ADMINISTRADOR', 'ROLE_PRODUCCION']
    },
    reportes: {
      ver: ['ROLE_ADMINISTRADOR', 'ROLE_VENDEDOR', 'ROLE_CAJERO']
    },
    servicios: {
      ver: ['ROLE_ADMINISTRADOR'],
      crear: ['ROLE_ADMINISTRADOR'],
      editar: ['ROLE_ADMINISTRADOR'],
      eliminar: ['ROLE_ADMINISTRADOR']
    }
  };

  constructor(private authService: AuthService) {}

  /**
   * Verifica si el usuario actual tiene permiso para realizar una acción en un módulo
   */
  tiene(modulo: Modulo, accion: Accion): boolean {
    const usuario = this.authService.getCurrentUser();
    
    if (!usuario || !usuario.isAuthenticated) {
      return false;
    }

    // ADMINISTRADOR tiene acceso a todo
    if (this.esAdministrador(usuario.roles)) {
      return true;
    }

    // Verificar permisos específicos
    const accionesModulo = this.permisos[modulo];
    if (!accionesModulo) {
      return false;
    }

    const rolesPermitidos = accionesModulo[accion];
    if (!rolesPermitidos) {
      return false;
    }

    // Verificar si algún rol del usuario está en la lista de roles permitidos
    return usuario.roles.some(rol => rolesPermitidos.includes(rol));
  }

  /**
   * Verifica si el usuario es administrador
   */
  esAdministrador(roles: string[]): boolean {
    return roles.some(rol => rol === 'ROLE_ADMINISTRADOR');
  }

  /**
   * Obtiene todos los roles del usuario actual
   */
  getRolesUsuarioActual(): string[] {
    const usuario = this.authService.getCurrentUser();
    return usuario?.roles || [];
  }

  /**
   * Verifica si el usuario tiene al menos uno de los roles especificados
   */
  tieneAlgunRol(rolesRequeridos: string[]): boolean {
    const usuario = this.authService.getCurrentUser();
    if (!usuario || !usuario.isAuthenticated) {
      return false;
    }

    return usuario.roles.some(rol => rolesRequeridos.includes(rol));
  }
}