import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ServicioExtraDTO {
  idServicioExtra?: number;
  idServicio: number;
  idExtra: number;
}

@Injectable({
  providedIn: 'root'
})
export class ServicioExtraService {
  private apiUrl = `${environment.apiUrl}/servicios-extras`;

  constructor(private http: HttpClient) { }

  obtenerTodos(): Observable<ServicioExtraDTO[]> {
    return this.http.get<ServicioExtraDTO[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<ServicioExtraDTO> {
    return this.http.get<ServicioExtraDTO>(`${this.apiUrl}/${id}`);
  }

  obtenerPorServicio(idServicio: number): Observable<ServicioExtraDTO[]> {
    return this.http.get<ServicioExtraDTO[]>(`${this.apiUrl}/servicio/${idServicio}`);
  }

  obtenerPorExtra(idExtra: number): Observable<ServicioExtraDTO[]> {
    return this.http.get<ServicioExtraDTO[]>(`${this.apiUrl}/extra/${idExtra}`);
  }

  crear(dto: ServicioExtraDTO): Observable<ServicioExtraDTO> {
    return this.http.post<ServicioExtraDTO>(this.apiUrl, dto);
  }

  actualizar(id: number, dto: ServicioExtraDTO): Observable<ServicioExtraDTO> {
    return this.http.put<ServicioExtraDTO>(`${this.apiUrl}/${id}`, dto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}