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
  
  // ========== NUEVOS CAMPOS ==========
  idMaterial?: number;  // NULL = aplica a todos los materiales
  nombreMaterial?: string;
  puedeParalelo?: boolean;
  grupoParalelo?: number;
  idDependenciaProceso?: number;
  nombreDependenciaProceso?: string;
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

  // ========== NUEVOS MÉTODOS ==========
  
  // Obtener procesos filtrados por material
  obtenerPorServicioYMaterial(idServicio: number, idMaterial: number): Observable<ServicioProcesoDTO[]> {
    return this.http.get<ServicioProcesoDTO[]>(`${this.apiUrl}/servicio/${idServicio}/material/${idMaterial}`);
  }
  
  // Obtener materiales que tienen procesos configurados
  obtenerMaterialesConProcesos(idServicio: number): Observable<number[]> {
    return this.http.get<number[]>(`${this.apiUrl}/servicio/${idServicio}/materiales`);
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