// guards/auth.guards.ts
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/AuthService';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('🔍 AuthGuard ejecutándose para URL:', state.url);
  
  const token = authService.getToken();
  console.log('🔑 Token existe:', !!token);
  
  const isAuth = authService.isAuthenticated();
  console.log('✅ isAuthenticated():', isAuth);

  if (isAuth) {
    console.log('✅ Acceso permitido a:', state.url);
    return true;
  }

  console.log('❌ Acceso denegado - Redirigiendo a login');
  console.log('❌ Razón: Token inválido o expirado');
  
  // Si hay token pero está expirado, intentar refrescar
  if (token) {
    console.log('⚠️ Token presente pero expirado, intenta hacer login de nuevo');
  }

  // Redirigir al login con la URL de retorno
  router.navigate(['/login'], { 
    queryParams: { returnUrl: state.url } 
  });
  return false;
};