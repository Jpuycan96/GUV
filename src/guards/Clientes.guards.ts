import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { PermisosService } from '../services/permisos/permisos.service';
export const clientesGuard: CanActivateFn = (route, state) => {
  const permisos = inject(PermisosService);
  const router = inject(Router);

  console.log('🔍 ClientesGuard ejecutándose');
  
  // Verificar si tiene permiso para ver clientes
  if (permisos.tiene('clientes', 'ver')) {
    console.log('✅ Tiene permisos para clientes');
    return true;
  }

  console.log('❌ NO tiene permisos para clientes, redirigiendo a inicio');
  router.navigate(['/']);
  return false;
};