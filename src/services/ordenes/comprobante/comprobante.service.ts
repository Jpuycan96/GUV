import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// ========== DTOs ==========

export interface ComprobanteDTO {
  idComprobante?: number;
  idOrden: number;
  tipoComprobante: string; // BOLETA o FACTURA
  serie: string;
  numero?: number;
  
  // Datos fiscales
  ruc?: string;
  razonSocialFiscal?: string;
  direccionFiscal?: string;
  
  // Montos
  subtotal: number;
  igv: number;
  total: number;
  
  // SUNAT
  estadoSunat?: string;
  cdrSunat?: string;
  hashSunat?: string;
  fEnvioSunat?: string;
  
  // Usuario
  idUsuario: number;
  nombreUsuario?: string;
  fEmision?: string;
  
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
export class ComprobanteService {
  private apiUrl = `${environment.apiUrl}/ordenes`;

  constructor(private http: HttpClient) { }

  // emitirComprobante - emite un nuevo comprobante
  emitirComprobante(dto: ComprobanteDTO): Observable<ComprobanteDTO> {
    return this.http.post<ComprobanteDTO>(`${this.apiUrl}/comprobantes`, dto);
  }

  // obtenerComprobantesPorOrden - obtiene comprobantes de una orden
  obtenerComprobantesPorOrden(idOrden: number): Observable<ComprobanteDTO[]> {
    return this.http.get<ComprobanteDTO[]>(`${this.apiUrl}/${idOrden}/comprobantes`);
  }

  // obtenerPorId - obtiene un comprobante por ID
  obtenerPorId(id: number): Observable<ComprobanteDTO> {
    return this.http.get<ComprobanteDTO>(`${this.apiUrl}/comprobantes/${id}`);
  }

  // buscarComprobante - busca comprobante por tipo, serie y número
  buscarComprobante(tipoComprobante: string, serie: string, numero: number): Observable<ComprobanteDTO> {
    const params = new HttpParams()
      .set('tipoComprobante', tipoComprobante)
      .set('serie', serie)
      .set('numero', numero.toString());
    
    return this.http.get<ComprobanteDTO>(`${this.apiUrl}/comprobantes/buscar`, { params });
  }

  // obtenerPorTipo - obtiene comprobantes por tipo
  obtenerPorTipo(tipo: string): Observable<ComprobanteDTO[]> {
    return this.http.get<ComprobanteDTO[]>(`${this.apiUrl}/comprobantes/tipo/${tipo}`);
  }

  // obtenerPorRuc - obtiene comprobantes por RUC
  obtenerPorRuc(ruc: string): Observable<ComprobanteDTO[]> {
    return this.http.get<ComprobanteDTO[]>(`${this.apiUrl}/comprobantes/ruc/${ruc}`);
  }

  // obtenerPendientesSunat - obtiene comprobantes pendientes de envío a SUNAT
  obtenerPendientesSunat(): Observable<ComprobanteDTO[]> {
    return this.http.get<ComprobanteDTO[]>(`${this.apiUrl}/comprobantes/pendientes-sunat`);
  }

  // anularComprobante - anula un comprobante
  anularComprobante(idComprobante: number, idUsuarioAnulacion: number, motivo: string): Observable<ComprobanteDTO> {
    const params = new HttpParams()
      .set('idUsuarioAnulacion', idUsuarioAnulacion.toString())
      .set('motivo', motivo);
    
    return this.http.patch<ComprobanteDTO>(`${this.apiUrl}/comprobantes/${idComprobante}/anular`, {}, { params });
  }

  // actualizarEstadoSunat - actualiza estado SUNAT de un comprobante
  actualizarEstadoSunat(
    idComprobante: number, 
    nuevoEstado: string, 
    cdr?: string, 
    hash?: string, 
    xml?: string
  ): Observable<ComprobanteDTO> {
    let params = new HttpParams().set('nuevoEstado', nuevoEstado);
    
    if (cdr) params = params.set('cdr', cdr);
    if (hash) params = params.set('hash', hash);
    if (xml) params = params.set('xml', xml);
    
    return this.http.patch<ComprobanteDTO>(`${this.apiUrl}/comprobantes/${idComprobante}/estado-sunat`, {}, { params });
  }
}