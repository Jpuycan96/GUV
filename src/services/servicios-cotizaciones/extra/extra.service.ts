import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ExtraDTO {
  idExtra?: number;
  nombre: string;
  tipo?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExtraService {
  private apiUrl = `${environment.apiUrl}/extras`;

  constructor(private http: HttpClient) { }

  obtenerTodos(): Observable<ExtraDTO[]> {
    return this.http.get<ExtraDTO[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<ExtraDTO> {
    return this.http.get<ExtraDTO>(`${this.apiUrl}/${id}`);
  }

  obtenerPorTipo(tipo: string): Observable<ExtraDTO[]> {
    return this.http.get<ExtraDTO[]>(`${this.apiUrl}/tipo/${tipo}`);
  }

  crear(dto: ExtraDTO): Observable<ExtraDTO> {
    return this.http.post<ExtraDTO>(this.apiUrl, dto);
  }

  actualizar(id: number, dto: ExtraDTO): Observable<ExtraDTO> {
    return this.http.put<ExtraDTO>(`${this.apiUrl}/${id}`, dto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}