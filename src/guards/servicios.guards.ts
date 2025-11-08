import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { PermisosService } from '../services/permisos/permisos.service';

export const serviciosGuard: CanActivateFn = (route, state) => {
  const permisos = inject(PermisosService);
  const router = inject(Router);

  console.log('🔍 ServiciosGuard ejecutándose');
  
  // Verificar si tiene permiso para ver servicios
  if (permisos.tiene('servicios', 'ver')) {
    console.log('✅ Tiene permisos para servicios');
    return true;
  }

  console.log('❌ NO tiene permisos para servicios, redirigiendo a órdenes');
  // Redirigir a órdenes si no puede ver servicios
  router.navigate(['/ordenes/lista']);
  return false;
};