import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { PermisosService } from '../services/permisos/permisos.service';                

export const ordenesGuard: CanActivateFn = (route, state) => {
  const permisos = inject(PermisosService);
  const router = inject(Router);

  console.log('🔍 OrdenesGuard ejecutándose');
  
  // Verificar si tiene permiso para ver órdenes
  if (permisos.tiene('ordenes', 'ver')) {
    console.log('✅ Tiene permisos para órdenes');
    return true;
  }

  console.log('❌ NO tiene permisos para órdenes, redirigiendo a inicio');
  router.navigate(['/']);
  return false;
};