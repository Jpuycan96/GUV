import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// ========== INTERFACES (MODELOS) ==========

export interface OrdenProcesoDTO {
  idOrdenProceso: number;
  idOrdenDetalle: number;
  idProceso: number;
  nombreProceso: string;
  idResponsable?: number;
  nombreResponsable?: string;
  fInicio?: string;
  fFin?: string;
  duracionMinutos?: number;
  estado: 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADO' | 'OMITIDO';
  orden: number;
  observaciones?: string;
  fCreacion: string;
}

export interface MisTareasDTO {
  // Datos del proceso
  idOrdenProceso: number;
  nombreProceso: string;
  estado: string;
  orden: number;
  observaciones?: string;
  bloqueado: boolean;
  motivoBloqueo?: string;
  
  // Datos de la orden
  idOrden: number;
  numeroOrden: string;
  nombreCliente: string;
  fEntregaAcordada?: string;
  estadoOrden: string;
  
  // Datos del servicio
  idOrdenDetalle: number;
  nombreServicio: string;
  descripcionServicio?: string;
  
  // Prioridad calculada
  prioridad: 'ALTA' | 'MEDIA' | 'BAJA';
}

export interface CompletarProcesoRequest {
  observaciones?: string;
}

// ========== SERVICE ==========

@Injectable({
  providedIn: 'root'
})
export class OrdenProcesoService {
  private apiUrl = `${environment.apiUrl}/ordenes/procesos`;

  constructor(private http: HttpClient) {}

  // Obtener todas las tareas pendientes
  obtenerMisTareas(): Observable<MisTareasDTO[]> {
    return this.http.get<MisTareasDTO[]>(`${this.apiUrl}/mis-tareas`);
  }

  // Obtener tareas de un área específica
  obtenerTareasPorArea(nombreProceso: string): Observable<MisTareasDTO[]> {
    return this.http.get<MisTareasDTO[]>(`${this.apiUrl}/mis-tareas/area/${nombreProceso}`);
  }

  // Completar proceso
  completarProceso(idProceso: number, observaciones?: string): Observable<OrdenProcesoDTO> {
    const body: CompletarProcesoRequest = observaciones ? { observaciones } : {};
    return this.http.post<OrdenProcesoDTO>(`${this.apiUrl}/${idProceso}/completar`, body);
  }

  // Obtener procesos de un detalle
  obtenerPorDetalle(idDetalle: number): Observable<OrdenProcesoDTO[]> {
    return this.http.get<OrdenProcesoDTO[]>(`${this.apiUrl}/detalle/${idDetalle}`);
  }

  // Obtener proceso por ID
  obtenerPorId(id: number): Observable<OrdenProcesoDTO> {
    return this.http.get<OrdenProcesoDTO>(`${this.apiUrl}/${id}`);
  }
}