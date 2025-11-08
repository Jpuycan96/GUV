import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { PermisosService } from '../services/permisos/permisos.service';

export const usuariosGuard: CanActivateFn = (route, state) => {
  const permisos = inject(PermisosService);
  const router = inject(Router);

  console.log('🔍 UsuariosGuard ejecutándose');
  
  // Verificar si tiene permiso para ver usuarios
  if (permisos.tiene('usuarios', 'ver')) {
    console.log('✅ Tiene permisos para usuarios');
    return true;
  }

  console.log('❌ NO tiene permisos para usuarios, redirigiendo a inicio');
  router.navigate(['/']);
  return false;
};