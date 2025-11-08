import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ModeloDTO {
  idModelo?: number;
  codigo: string;
  descripcion?: string;
  activo: boolean;
  idMaterial: number;
}

@Injectable({
  providedIn: 'root'
})
export class ModeloService {
  private apiUrl = `${environment.apiUrl}/modelos`;

  constructor(private http: HttpClient) { }

  obtenerTodos(): Observable<ModeloDTO[]> {
    return this.http.get<ModeloDTO[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<ModeloDTO> {
    return this.http.get<ModeloDTO>(`${this.apiUrl}/${id}`);
  }

  obtenerPorMaterial(idMaterial: number): Observable<ModeloDTO[]> {
    return this.http.get<ModeloDTO[]>(`${this.apiUrl}/material/${idMaterial}`);
  }

  obtenerActivos(): Observable<ModeloDTO[]> {
    return this.http.get<ModeloDTO[]>(`${this.apiUrl}/activos`);
  }

  crear(dto: ModeloDTO): Observable<ModeloDTO> {
    return this.http.post<ModeloDTO>(this.apiUrl, dto);
  }

  actualizar(id: number, dto: ModeloDTO): Observable<ModeloDTO> {
    return this.http.put<ModeloDTO>(`${this.apiUrl}/${id}`, dto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}