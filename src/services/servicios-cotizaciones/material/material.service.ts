import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MaterialDTO {
  idMaterial?: number;
  nombre: string;
  descripcion?: string;
  idServicio: number;
}

@Injectable({
  providedIn: 'root'
})
export class MaterialService {
  private apiUrl = `${environment.apiUrl}/materiales`;

  constructor(private http: HttpClient) { }

  obtenerTodos(): Observable<MaterialDTO[]> {
    return this.http.get<MaterialDTO[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<MaterialDTO> {
    return this.http.get<MaterialDTO>(`${this.apiUrl}/${id}`);
  }

  obtenerPorServicio(idServicio: number): Observable<MaterialDTO[]> {
    return this.http.get<MaterialDTO[]>(`${this.apiUrl}/servicio/${idServicio}`);
  }

  crear(dto: MaterialDTO): Observable<MaterialDTO> {
    return this.http.post<MaterialDTO>(this.apiUrl, dto);
  }

  actualizar(id: number, dto: MaterialDTO): Observable<MaterialDTO> {
    return this.http.put<MaterialDTO>(`${this.apiUrl}/${id}`, dto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}