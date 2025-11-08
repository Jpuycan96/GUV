import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UsuarioDTO {
  id?: number;
  nombre: string;
  username: string;
  enabled: boolean;
  roles: string[];
}

export interface CrearUsuarioDTO {
  nombre: string;
  username: string;
  password: string;
  roles?: string[]; // Opcional
}

export interface ActualizarUsuarioDTO {
  nombre: string;
  username: string;
  password?: string; // Opcional
}

export interface RolDTO {
  id: number;
  nombre: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  // Listar todos los usuarios
  listar(): Observable<UsuarioDTO[]> {
    return this.http.get<UsuarioDTO[]>(this.apiUrl);
  }

  // ✅ Alias para compatibilidad con código existente
  obtenerTodos(): Observable<UsuarioDTO[]> {
    return this.listar();
  }

  // Listar usuarios habilitados
  listarHabilitados(): Observable<UsuarioDTO[]> {
    return this.http.get<UsuarioDTO[]>(`${this.apiUrl}/habilitados`);
  }

  // Obtener usuario por ID
  obtenerPorId(id: number): Observable<UsuarioDTO> {
    return this.http.get<UsuarioDTO>(`${this.apiUrl}/${id}`);
  }

  // Crear nuevo usuario
  crear(dto: CrearUsuarioDTO): Observable<UsuarioDTO> {
    return this.http.post<UsuarioDTO>(this.apiUrl, dto);
  }

  // Actualizar usuario (sin roles)
  actualizar(id: number, dto: ActualizarUsuarioDTO): Observable<UsuarioDTO> {
    return this.http.put<UsuarioDTO>(`${this.apiUrl}/${id}`, dto);
  }

  // Habilitar usuario
  habilitar(id: number): Observable<UsuarioDTO> {
    return this.http.patch<UsuarioDTO>(`${this.apiUrl}/${id}/habilitar`, {});
  }

  // Deshabilitar usuario
  deshabilitar(id: number): Observable<UsuarioDTO> {
    return this.http.patch<UsuarioDTO>(`${this.apiUrl}/${id}/deshabilitar`, {});
  }

  // Actualizar roles de un usuario
  actualizarRoles(id: number, roles: string[]): Observable<UsuarioDTO> {
    return this.http.patch<UsuarioDTO>(`${this.apiUrl}/${id}/roles`, roles);
  }

  // Obtener lista de roles disponibles
  obtenerRolesDisponibles(): Observable<RolDTO[]> {
    return this.http.get<RolDTO[]>(`${environment.apiUrl}/roles`);
  }
}