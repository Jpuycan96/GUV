// services/AuthInterceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from './AuthService';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  // Agregar token si existe
  const token = authService.getToken();
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // ✅ SOLO intentar renovar en 401 (Unauthorized), NO en 403 (Forbidden)
      // 401 = Token inválido/expirado
      // 403 = Token válido pero sin permisos
      if (error.status === 401 && token) {
        console.log('⚠️ Token inválido o expirado (401), intentando renovar...');
        
        return authService.refreshToken().pipe(
          switchMap((response) => {
            console.log('✅ Token renovado, reintentando petición...');
            
            // Reintentar la petición original con el nuevo token
            const newReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${response.accessToken}`
              }
            });
            return next(newReq);
          }),
          catchError((refreshError) => {
            // Si falla el refresh, hacer logout
            console.error('❌ No se pudo renovar el token, cerrando sesión...');
            authService.logout();
            return throwError(() => refreshError);
          })
        );
      }
      
      // ✅ Si es 403, NO intentar renovar - es un problema de permisos
      if (error.status === 403) {
        console.warn('⚠️ Error 403 (Forbidden) - Permisos insuficientes');
        // NO hacer logout, solo devolver el error
      }
      
      return throwError(() => error);
    })
  );
};