// services/AuthService.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../environments/environment';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface User {
  username: string;
  roles: string[];
  isAuthenticated: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Timer para refresh automático
  private tokenRefreshTimer: any = null;

  constructor() {
    this.checkStoredAuth();
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          this.setToken(response.accessToken, response.refreshToken);
          this.decodeAndSetUser(response.accessToken);
          this.scheduleTokenRefresh(response.accessToken);
        }),
        catchError(error => {
          console.error('Error en login:', error);
          return throwError(() => error);
        })
      );
  }

  logout(): void {
    // Cancelar el timer de refresh si existe
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
      this.tokenRefreshTimer = null;
    }

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  refreshToken(): Observable<LoginResponse> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      this.logout();
      return throwError(() => 'No refresh token available');
    }

    return this.http.post<LoginResponse>(`${this.apiUrl}/refresh`, null, {
      params: { refreshToken }
    }).pipe(
      tap(response => {
        this.setToken(response.accessToken, response.refreshToken);
        this.decodeAndSetUser(response.accessToken);
        this.scheduleTokenRefresh(response.accessToken);
        console.log('✅ Token renovado automáticamente');
      }),
      catchError(error => {
        console.error('❌ Error al renovar token:', error);
        this.logout();
        return throwError(() => error);
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // ✅ NUEVO: Método para obtener usuario actual con idUsuario
  getUsuarioActual(): { idUsuario: number; username: string; roles: string[] } | null {
    const user = this.currentUserSubject.value;
    if (!user) return null;

    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        idUsuario: payload.idUsuario,
        username: user.username,
        roles: user.roles
      };
    } catch {
      return null;
    }
  }

  private checkStoredAuth(): void {
    if (this.isAuthenticated()) {
      const token = this.getToken();
      if (token) {
        this.decodeAndSetUser(token);
        this.scheduleTokenRefresh(token);
      }
    } else {
      this.logout();
    }
  }

  private decodeAndSetUser(token: string): void {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const user: User = {
        username: payload.sub,
        roles: payload.roles || [],
        isAuthenticated: true
      };
      this.currentUserSubject.next(user);
    } catch (error) {
      console.error('Error decodificando token:', error);
      this.logout();
    }
  }

  private setToken(accessToken: string, refreshToken: string): void {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  // 🔄 NUEVO: Programar renovación automática del token
  private scheduleTokenRefresh(token: string): void {
    try {
      // Cancelar timer anterior si existe
      if (this.tokenRefreshTimer) {
        clearTimeout(this.tokenRefreshTimer);
      }

      // Decodificar token para obtener tiempo de expiración
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiresAt = payload.exp * 1000; // convertir a milisegundos
      const now = Date.now();
      
      // Calcular cuándo renovar (2 minutos antes de que expire)
      const refreshBuffer = 2 * 60 * 1000; // 2 minutos en milisegundos
      const refreshIn = expiresAt - now - refreshBuffer;

      console.log(`🔄 Token expira en: ${Math.floor((expiresAt - now) / 1000)} segundos`);
      console.log(`⏰ Renovación programada en: ${Math.floor(refreshIn / 1000)} segundos`);

      // Si el token expira en menos de 2 minutos, renovar inmediatamente
      if (refreshIn <= 0) {
        console.log('⚠️ Token próximo a expirar, renovando ahora...');
        this.refreshToken().subscribe();
        return;
      }

      // Programar renovación automática
      this.tokenRefreshTimer = setTimeout(() => {
        console.log('🔄 Renovando token automáticamente...');
        this.refreshToken().subscribe({
          error: (err) => {
            console.error('❌ Error al renovar token automáticamente:', err);
          }
        });
      }, refreshIn);

    } catch (error) {
      console.error('Error programando renovación de token:', error);
    }
  }
}