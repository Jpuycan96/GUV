import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ServicioProcesoDTO {
  idServicioProceso?: number;
  idServicio: number;
  idProceso: number;
  nombreProceso?: string;
  descripcionProceso?: string;
  orden?: number;
  obligatorio?: boolean;
  tiempoEstimadoMinutos?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ServicioProcesoService {
  private apiUrl = `${environment.apiUrl}/servicio-procesos`;

  constructor(private http: HttpClient) { }

  obtenerPorServicio(idServicio: number): Observable<ServicioProcesoDTO[]> {
    return this.http.get<ServicioProcesoDTO[]>(`${this.apiUrl}/servicio/${idServicio}`);
  }

  agregar(dto: ServicioProcesoDTO): Observable<ServicioProcesoDTO> {
    return this.http.post<ServicioProcesoDTO>(this.apiUrl, dto);
  }

  actualizar(id: number, dto: ServicioProcesoDTO): Observable<ServicioProcesoDTO> {
    return this.http.put<ServicioProcesoDTO>(`${this.apiUrl}/${id}`, dto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}