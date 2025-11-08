import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ServicioDTO {
  idServicio?: number;
  nombre: string;
  descripcion?: string;
  imagenUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ServicioService {
  private apiUrl = `${environment.apiUrl}/servicios`;

  constructor(private http: HttpClient) { }

  // obtiene todos los servicios
  obtenerTodos(): Observable<ServicioDTO[]> {
    return this.http.get<ServicioDTO[]>(this.apiUrl);
  }

  // obtiene un servicio por ID
  obtenerPorId(id: number): Observable<ServicioDTO> {
    return this.http.get<ServicioDTO>(`${this.apiUrl}/${id}`);
  }

  // crea un nuevo servicio
  crear(dto: ServicioDTO): Observable<ServicioDTO> {
    return this.http.post<ServicioDTO>(this.apiUrl, dto);
  }

  // actualiza un servicio existente
  actualizar(id: number, dto: ServicioDTO): Observable<ServicioDTO> {
    return this.http.put<ServicioDTO>(`${this.apiUrl}/${id}`, dto);
  }

  // elimina un servicio
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}