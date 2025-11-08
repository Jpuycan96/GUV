import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ExtraDetalleDTO {
  idExtraDetalle?: number;
  idServicioExtra: number;
  precioExtraBase: number;
  unidadBaseExtra?: string;
  cantidadMin?: number;
  cantidadMax?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ExtraDetalleService {
  private apiUrl = `${environment.apiUrl}/extras-detalles`;

  constructor(private http: HttpClient) { }

  obtenerTodos(): Observable<ExtraDetalleDTO[]> {
    return this.http.get<ExtraDetalleDTO[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<ExtraDetalleDTO> {
    return this.http.get<ExtraDetalleDTO>(`${this.apiUrl}/${id}`);
  }

  obtenerPorExtra(idExtra: number): Observable<ExtraDetalleDTO[]> {
    return this.obtenerPorServicioExtra(idExtra);
  }

  obtenerPorServicioExtra(idServicioExtra: number): Observable<ExtraDetalleDTO[]> {
    return this.http.get<ExtraDetalleDTO[]>(`${this.apiUrl}/servicio-extra/${idServicioExtra}`);
  }

  crear(dto: ExtraDetalleDTO): Observable<ExtraDetalleDTO> {
    return this.http.post<ExtraDetalleDTO>(this.apiUrl, dto);
  }

  actualizar(id: number, dto: ExtraDetalleDTO): Observable<ExtraDetalleDTO> {
    return this.http.put<ExtraDetalleDTO>(`${this.apiUrl}/${id}`, dto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}