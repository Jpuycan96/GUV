import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// ========== INTERFACES ==========
export interface CajaDiariaDTO {
  idCaja?: number;
  idTurno: number;
  nombreTurno?: string;
  idCajero: number;
  nombreCajero?: string;
  fecha: string; // LocalDate como string ISO
  
  // Montos
  montoInicial: number;
  totalOrdenes?: number;
  
  ventaBruta: number;
  totalDescuentos: number;
  ventaNeta: number;
  
  // Desglose por tipo de pago
  totalEfectivo: number;
  totalYape: number;
  totalPlin: number;
  totalTransferencia: number;
  totalPendiente: number;
  
  // Cierre
  montoFinal?: number;
  diferencia?: number;
  
  // Estado
  estado: 'ABIERTA' | 'CERRADA';
  fApertura?: string; // LocalDateTime como string ISO
  fCierre?: string;
  observaciones?: string;
}

export interface ResumenCajaDTO {
  idCaja?: number;
  fecha: string;
  nombreTurno?: string;
  nombreCajero?: string;
  
  montoInicial: number;
  ventaBruta: number;
  totalDescuentos: number;
  ventaNeta: number;
  
  totalEfectivo: number;
  totalYape: number;
  totalPlin: number;
  totalTransferencia: number;
  totalCobrado: number;
  totalPendiente: number;
  
  montoEsperado: number;
  montoFinal?: number;
  diferencia?: number;
  
  totalOrdenes?: number;
  ordenesCompletadas?: number;
  ordenesPendientes?: number;
  
  ordenes?: OrdenResumenDTO[];
}

export interface OrdenResumenDTO {
  idOrden: number;
  numeroOrden: string;
  nombreCliente: string;
  total: number;
  pagado: number;
  pendiente: number;
  estado: string;
}

export interface AperturaCajaRequest {
  idTurno: number;
  idCajero: number;
}

export interface CierreCajaRequest {
  montoReal: number;
  observaciones?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CajaDiariaService {
  private apiUrl = `${environment.apiUrl}/cajas`;

  constructor(private http: HttpClient) { }

  // ========== APERTURA DE CAJA ==========
  abrirCaja(request: AperturaCajaRequest): Observable<CajaDiariaDTO> {
    return this.http.post<CajaDiariaDTO>(`${this.apiUrl}/apertura`, request);
  }

  // ========== OBTENER TODAS LAS CAJAS (CON FILTROS) ==========
  obtenerTodas(filtros?: {
    fechaDesde?: string;
    fechaHasta?: string;
    estado?: string;
    idCajero?: number;
  }): Observable<CajaDiariaDTO[]> {
    let params = new HttpParams();
    
    if (filtros?.fechaDesde) {
      params = params.set('fechaDesde', filtros.fechaDesde);
    }
    if (filtros?.fechaHasta) {
      params = params.set('fechaHasta', filtros.fechaHasta);
    }
    if (filtros?.estado) {
      params = params.set('estado', filtros.estado);
    }
    if (filtros?.idCajero) {
      params = params.set('idCajero', filtros.idCajero.toString());
    }
    
    return this.http.get<CajaDiariaDTO[]>(this.apiUrl, { params });
  }

  // ========== OBTENER CAJA POR ID ==========
  obtenerPorId(id: number, timestamp?: number): Observable<CajaDiariaDTO> {
    const url = timestamp 
      ? `${this.apiUrl}/${id}?_t=${timestamp}` 
      : `${this.apiUrl}/${id}`;
    
    return this.http.get<CajaDiariaDTO>(url);
  }

  // ========== OBTENER CAJA ACTIVA DEL CAJERO ==========
  obtenerCajaActiva(idCajero: number): Observable<CajaDiariaDTO> {
    const params = new HttpParams().set('idCajero', idCajero.toString());
    return this.http.get<CajaDiariaDTO>(`${this.apiUrl}/activa`, { params });
  }

  // ========== CERRAR CAJA ==========
  cerrarCaja(idCaja: number, request: CierreCajaRequest): Observable<CajaDiariaDTO> {
    return this.http.put<CajaDiariaDTO>(`${this.apiUrl}/${idCaja}/cierre`, request);
  }

  // ========== OBTENER RESUMEN DEL DÍA ==========
  obtenerResumenDia(fecha: string): Observable<ResumenCajaDTO> {
    const params = new HttpParams().set('fecha', fecha);
    return this.http.get<ResumenCajaDTO>(`${this.apiUrl}/resumen-dia`, { params });
  }

  // ========== OBTENER RESUMEN DEL MES ==========
  obtenerResumenMes(anio: number, mes: number): Observable<ResumenCajaDTO> {
    const params = new HttpParams()
      .set('anio', anio.toString())
      .set('mes', mes.toString());
    return this.http.get<ResumenCajaDTO>(`${this.apiUrl}/resumen-mes`, { params });
  }

  // ========== RECALCULAR TOTALES ==========
  recalcularTotales(idCaja: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${idCaja}/recalcular`, {});
  }
}