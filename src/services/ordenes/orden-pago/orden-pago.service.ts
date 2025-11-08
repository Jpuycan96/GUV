import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// ========== DTOs ==========

export interface OrdenPagoDTO {
  idPago?: number;
  idOrden: number;
  monto: number;
  idTipoPago: number;
  nombreTipoPago?: string;
  numeroOperacion?: string;
  
  // Turno y caja
  idTurno?: number;
  nombreTurno?: string;
  idCaja?: number;
  
  // Usuario (Cajero)
  idUsuario: number;
  nombreUsuario?: string;
  fPago?: string;  // ✅ Fecha del pago
  observaciones?: string;
  
  // Anulación
  anulado?: boolean;
  motivoAnulacion?: string;
  fAnulacion?: string;
  idUsuarioAnulacion?: number;
  nombreUsuarioAnulacion?: string;
}

// ========== SERVICE ==========

@Injectable({
  providedIn: 'root'
})
export class OrdenPagoService {
  private apiUrl = `${environment.apiUrl}/ordenes`;

  constructor(private http: HttpClient) { }

  // registrarPago - registra un nuevo pago
  registrarPago(dto: OrdenPagoDTO): Observable<OrdenPagoDTO> {
    return this.http.post<OrdenPagoDTO>(`${this.apiUrl}/pagos`, dto);
  }

  // obtenerPagosPorOrden - obtiene pagos de una orden
  obtenerPagosPorOrden(idOrden: number): Observable<OrdenPagoDTO[]> {
    return this.http.get<OrdenPagoDTO[]>(`${this.apiUrl}/${idOrden}/pagos`);
  }

  // obtenerPorId - obtiene un pago por ID
  obtenerPorId(id: number): Observable<OrdenPagoDTO> {
    return this.http.get<OrdenPagoDTO>(`${this.apiUrl}/pagos/${id}`);
  }

  // anularPago - anula un pago
  anularPago(idPago: number, idUsuarioAnulacion: number, motivo: string): Observable<OrdenPagoDTO> {
    const params = new HttpParams()
      .set('idUsuarioAnulacion', idUsuarioAnulacion.toString())
      .set('motivo', motivo);
    
    return this.http.patch<OrdenPagoDTO>(`${this.apiUrl}/pagos/${idPago}/anular`, {}, { params });
  }
}