import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// ========== DTOs ==========

export interface TipoPagoDTO {
  idTipoPago?: number;
  nombre: string;
  requiereOperacion?: boolean;
  activo?: boolean;
}

// ========== SERVICE ==========

@Injectable({
  providedIn: 'root'
})
export class TipoPagoService {
  private apiUrl = `${environment.apiUrl}/ordenes/tipos-pago`;

  constructor(private http: HttpClient) { }

  // obtenerTodos - obtiene todos los tipos de pago
  obtenerTodos(): Observable<TipoPagoDTO[]> {
    return this.http.get<TipoPagoDTO[]>(this.apiUrl);
  }

  // obtenerActivos - obtiene solo tipos de pago activos
  obtenerActivos(): Observable<TipoPagoDTO[]> {
    return this.http.get<TipoPagoDTO[]>(`${this.apiUrl}/activos`);
  }

  // obtenerPorId - obtiene un tipo de pago por ID
  obtenerPorId(id: number): Observable<TipoPagoDTO> {
    return this.http.get<TipoPagoDTO>(`${this.apiUrl}/${id}`);
  }

  // crear - crea un nuevo tipo de pago
  crear(dto: TipoPagoDTO): Observable<TipoPagoDTO> {
    return this.http.post<TipoPagoDTO>(this.apiUrl, dto);
  }

  // actualizar - actualiza un tipo de pago
  actualizar(id: number, dto: TipoPagoDTO): Observable<TipoPagoDTO> {
    return this.http.put<TipoPagoDTO>(`${this.apiUrl}/${id}`, dto);
  }

  // eliminar - elimina un tipo de pago
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}