import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// ========== DTOs ==========

export interface OrdenTrabajoDTO {
  idOrden?: number;
  numeroOrden?: string;
  
  // IDs relacionados
  idCliente: number;
  idVendedor: number;
  
  // ✅ NUEVO: ID de la caja diaria (para filtrar órdenes por caja)
  idCajaDiaria?: number;
  
  // Nombres para mostrar
  nombreCliente?: string;
  nombreVendedor?: string;
  
  // ✅ LAS 3 FECHAS IMPORTANTES
  fRecepcion?: string;          // Fecha de registro (automática en backend)
  fEntregaAcordada?: string;     // Fecha acordada con el cliente
  fEntregaReal?: string;         // Fecha real cuando vino el cliente
  
  // Precios
  subtotal: number;
  totalExtras?: number;
  subtotalBruto: number;
  
  // Descuentos
  descuento?: number;
  porcentajeDescuento?: number;
  motivoDescuento?: string;
  idUsuarioDescuento?: number;
  nombreUsuarioDescuento?: string;
  
  // Total
  totalFinal: number;
  
  // Pagos
  montoPagado?: number;
  saldoPendiente?: number;
  
  // Estado
  estado?: string;
  
  // Cotización
  esCotizacion?: boolean;
  idOrdenOrigen?: number;
  
  // Datos del cliente (copia)
  razonSocial?: string;
  contacto?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  
  // Observaciones
  observaciones?: string;
  
  // Auditoría
  fCreacion?: string;
  fModificacion?: string;
}

export interface OrdenDetalleDTO {
  idOrdenDetalle?: number;
  idOrden: number;
  
  // Servicio
  idServicio: number;
  nombreServicio?: string;
  
  idMaterial: number;
  nombreMaterial?: string;
  
  idModelo?: number;
  nombreModelo?: string;
  
  // Cantidad y dimensiones
  cantidad: number;
  unidadMedida: string;
  ancho?: number;
  alto?: number;
  areaTotal?: number;
  
  // Precios
  precioUnitario: number;
  subtotal: number;
  
  descripcion?: string;
  
  // Diseño
  tipoDiseno?: string;
  idDisenador?: number;
  nombreDisenador?: string;
  fInicioDiseno?: string;
  fFinDiseno?: string;
  duracionDisenoMinutos?: number;
  observacionesDiseno?: string;
  
  // Estado
  estadoActual?: string;
  progresoPorcentaje?: number;
  
  ordenVisualizacion?: number;
  fCreacion?: string;
}

export interface CrearOrdenRequest {
  // Datos básicos de la orden
  idCliente: number;
  idVendedor: number;
  
  // ✅ SOLO fecha de entrega acordada
  // fRecepcion se genera automáticamente en el backend
  fEntregaAcordada?: string;
  
  // Descuento
  idUsuarioDescuento?: number;
  motivoDescuento?: string;
  porcentajeDescuento?: number; // ✅ AGREGADO
  
  // Datos del cliente
  razonSocial?: string;
  contacto?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  
  observaciones?: string;
  esCotizacion?: boolean;
  
  // Detalles de servicios
  detalles: DetalleServicioRequest[];
}

export interface DetalleServicioRequest {
  idServicio: number;
  idMaterial: number;
  idModelo?: number;
  cantidad: number;
  ancho?: number;
  alto?: number;
  descripcion?: string;
  tipoDiseno?: string;
  extras?: ExtraServicioRequest[];
}

export interface ExtraServicioRequest {
  idExtra: number;
  idExtraDetalle?: number;
  cantidad?: number;
  descripcion?: string;
}

// TRACKING: INTERFACES PARA ÓRDENES CON PROCESOS

export interface OrdenConProcesosDTO {
  idOrden: number;
  numeroOrden: string;
  nombreCliente: string;
  nombreVendedor: string;
  fRecepcion?: string;
  fEntregaAcordada?: string;
  totalFinal: number;
  saldoPendiente: number;
  estado: string;
  esCotizacion: boolean;
  detalles: DetalleConProcesosDTO[];
}

export interface DetalleConProcesosDTO {
  idOrdenDetalle: number;
  nombreServicio: string;
  nombreMaterial: string;
  nombreModelo?: string;
  cantidad: number;
  unidadMedida: string;
  descripcion?: string;
  estadoActual: string;
  progresoPorcentaje: number;
  procesos: ProcesoSimpleDTO[];
}

export interface ProcesoSimpleDTO {
  idOrdenProceso: number;
  nombreProceso: string;
  estado: string;
  orden: number;
  bloqueado: boolean;
  motivoBloqueo?: string;
  fInicio?: string;
  fFin?: string;
  observaciones?: string;
}

// ========== SERVICE ==========

@Injectable({
  providedIn: 'root'
})
export class OrdenTrabajoService {
  private apiUrl = `${environment.apiUrl}/ordenes`;

  constructor(private http: HttpClient) { }

  // crear - crea una nueva orden completa
  crear(request: CrearOrdenRequest): Observable<OrdenTrabajoDTO> {
    return this.http.post<OrdenTrabajoDTO>(this.apiUrl, request);
  }

  // obtenerTodas - obtiene todas las órdenes
  obtenerTodas(): Observable<OrdenTrabajoDTO[]> {
    return this.http.get<OrdenTrabajoDTO[]>(this.apiUrl);
  }

  // obtenerPorId - obtiene una orden por ID
  obtenerPorId(id: number): Observable<OrdenTrabajoDTO> {
    return this.http.get<OrdenTrabajoDTO>(`${this.apiUrl}/${id}`);
  }

  // obtenerPorVendedor - obtiene órdenes por vendedor
  obtenerPorVendedor(idVendedor: number): Observable<OrdenTrabajoDTO[]> {
    return this.http.get<OrdenTrabajoDTO[]>(`${this.apiUrl}/vendedor/${idVendedor}`);
  }

  // obtenerPorCliente - obtiene órdenes por cliente
  obtenerPorCliente(idCliente: number): Observable<OrdenTrabajoDTO[]> {
    return this.http.get<OrdenTrabajoDTO[]>(`${this.apiUrl}/cliente/${idCliente}`);
  }

  // obtenerPorEstado - obtiene órdenes por estado
  obtenerPorEstado(estado: string): Observable<OrdenTrabajoDTO[]> {
    return this.http.get<OrdenTrabajoDTO[]>(`${this.apiUrl}/estado/${estado}`);
  }

  // obtenerCotizaciones - obtiene solo cotizaciones
  obtenerCotizaciones(): Observable<OrdenTrabajoDTO[]> {
    return this.http.get<OrdenTrabajoDTO[]>(`${this.apiUrl}/cotizaciones`);
  }

  // obtenerOrdenes - obtiene solo órdenes (no cotizaciones)
  obtenerOrdenes(): Observable<OrdenTrabajoDTO[]> {
    return this.http.get<OrdenTrabajoDTO[]>(`${this.apiUrl}/solo-ordenes`);
  }

  // obtenerPendientesPago - obtiene órdenes con saldo pendiente
  obtenerPendientesPago(): Observable<OrdenTrabajoDTO[]> {
    return this.http.get<OrdenTrabajoDTO[]>(`${this.apiUrl}/pendientes-pago`);
  }

  // convertirCotizacionAOrden - convierte una cotización en orden
  convertirCotizacionAOrden(idCotizacion: number): Observable<OrdenTrabajoDTO> {
    return this.http.post<OrdenTrabajoDTO>(`${this.apiUrl}/${idCotizacion}/convertir`, {});
  }

  // actualizarEstado - actualiza el estado de una orden
  actualizarEstado(id: number, nuevoEstado: string): Observable<OrdenTrabajoDTO> {
    const params = new HttpParams().set('nuevoEstado', nuevoEstado);
    return this.http.patch<OrdenTrabajoDTO>(`${this.apiUrl}/${id}/estado`, {}, { params });
  }

  // ✅ registrarEntregaReal - registra cuando el cliente realmente vino a recoger
  registrarEntregaReal(id: number, fechaEntrega: string): Observable<OrdenTrabajoDTO> {
    const params = new HttpParams().set('fechaEntrega', fechaEntrega);
    return this.http.patch<OrdenTrabajoDTO>(`${this.apiUrl}/${id}/entrega-real`, {}, { params });
  }

  // eliminar - elimina una orden
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // obtenerDetalles - obtiene los detalles de una orden
  obtenerDetalles(idOrden: number): Observable<OrdenDetalleDTO[]> {
    return this.http.get<OrdenDetalleDTO[]>(`${this.apiUrl}/detalles/orden/${idOrden}`);
  }

  // Interpreta texto libre usando IA para auto-completar orden
  interpretarTextoConIA(request: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/interpretar`, request);
  }
  // MÉTODO PARA TRACKING 

// obtenerOrdenesConProcesos - obtiene órdenes con detalles y procesos anidados
obtenerOrdenesConProcesos(): Observable<OrdenConProcesosDTO[]> {
  return this.http.get<OrdenConProcesosDTO[]>(`${this.apiUrl}/tracking`);
}
}