import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ProcesoDTO {
  idProceso?: number;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProcesoService {
  private apiUrl = `${environment.apiUrl}/procesos`;

  constructor(private http: HttpClient) { }

  obtenerTodos(): Observable<ProcesoDTO[]> {
    return this.http.get<ProcesoDTO[]>(this.apiUrl);
  }

  obtenerActivos(): Observable<ProcesoDTO[]> {
    return this.http.get<ProcesoDTO[]>(`${this.apiUrl}/activos`);
  }

  obtenerPorId(id: number): Observable<ProcesoDTO> {
    return this.http.get<ProcesoDTO>(`${this.apiUrl}/${id}`);
  }

  crear(dto: ProcesoDTO): Observable<ProcesoDTO> {
    return this.http.post<ProcesoDTO>(this.apiUrl, dto);
  }

  actualizar(id: number, dto: ProcesoDTO): Observable<ProcesoDTO> {
    return this.http.put<ProcesoDTO>(`${this.apiUrl}/${id}`, dto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}