import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PrecioEscalaDTO {
  idPrecioEscala?: number;
  idServicio: number;
  idMaterial: number;
  idModelo?: number;
  cantidadMin: number;
  cantidadMax?: number;
  precioUnitario: number;
  unidadMedida?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PrecioEscalaService {
  private apiUrl = `${environment.apiUrl}/precios-escala`;

  constructor(private http: HttpClient) { }

  obtenerTodos(): Observable<PrecioEscalaDTO[]> {
    return this.http.get<PrecioEscalaDTO[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<PrecioEscalaDTO> {
    return this.http.get<PrecioEscalaDTO>(`${this.apiUrl}/${id}`);
  }

  obtenerPorServicio(idServicio: number): Observable<PrecioEscalaDTO[]> {
    return this.http.get<PrecioEscalaDTO[]>(`${this.apiUrl}/servicio/${idServicio}`);
  }

  obtenerPorMaterial(idMaterial: number): Observable<PrecioEscalaDTO[]> {
    return this.http.get<PrecioEscalaDTO[]>(`${this.apiUrl}/material/${idMaterial}`);
  }

  obtenerPorModelo(idModelo: number): Observable<PrecioEscalaDTO[]> {
    return this.http.get<PrecioEscalaDTO[]>(`${this.apiUrl}/modelo/${idModelo}`);
  }

  obtenerPorServicioYMaterial(idServicio: number, idMaterial: number): Observable<PrecioEscalaDTO[]> {
    return this.http.get<PrecioEscalaDTO[]>(`${this.apiUrl}/servicio/${idServicio}/material/${idMaterial}`);
  }

  crear(dto: PrecioEscalaDTO): Observable<PrecioEscalaDTO> {
    return this.http.post<PrecioEscalaDTO>(this.apiUrl, dto);
  }

  actualizar(id: number, dto: PrecioEscalaDTO): Observable<PrecioEscalaDTO> {
    return this.http.put<PrecioEscalaDTO>(`${this.apiUrl}/${id}`, dto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}