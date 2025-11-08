import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// ========== DTOs ==========

export interface TurnoDTO {
  idTurno?: number;
  nombre: string;
  horaInicio: string;
  horaFin: string;
  montoInicialDefault?: number;
  activo?: boolean;
}

// ========== SERVICE ==========

@Injectable({
  providedIn: 'root'
})
export class TurnoService {
  private apiUrl = `${environment.apiUrl}/ordenes/turnos`;

  constructor(private http: HttpClient) { }

  // obtenerTodos - obtiene todos los turnos
  obtenerTodos(): Observable<TurnoDTO[]> {
    return this.http.get<TurnoDTO[]>(this.apiUrl);
  }

  // obtenerActivos - obtiene solo turnos activos
  obtenerActivos(): Observable<TurnoDTO[]> {
    return this.http.get<TurnoDTO[]>(`${this.apiUrl}/activos`);
  }

  // obtenerPorId - obtiene un turno por ID
  obtenerPorId(id: number): Observable<TurnoDTO> {
    return this.http.get<TurnoDTO>(`${this.apiUrl}/${id}`);
  }

  // crear - crea un nuevo turno
  crear(dto: TurnoDTO): Observable<TurnoDTO> {
    return this.http.post<TurnoDTO>(this.apiUrl, dto);
  }

  // actualizar - actualiza un turno
  actualizar(id: number, dto: TurnoDTO): Observable<TurnoDTO> {
    return this.http.put<TurnoDTO>(`${this.apiUrl}/${id}`, dto);
  }

  // eliminar - elimina un turno
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}