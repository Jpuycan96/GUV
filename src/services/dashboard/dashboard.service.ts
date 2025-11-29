import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// ========== DTOs ==========

export interface DashboardKPIs {
  ventasHoy: number;
  ventasSemana: number;
  ventasMes: number;
  ventasAnio: number;
  variacionVsSemanaAnterior: number;
  variacionVsMesAnterior: number;
  ordenesHoy: number;
  ordenesSemana: number;
  ordenesMes: number;
  ordenesEnProceso: number;
  ordenesPendientesPago: number;
  ticketPromedio: number;
  tasaCompletado: number;
}

export interface PuntoVenta {
  etiqueta: string;
  monto: number;
  cantidadOrdenes: number;
}

export interface VentasPorPeriodo {
  datos: PuntoVenta[];
  totalPeriodo: number;
  totalOrdenes: number;
}

export interface ServicioRanking {
  idServicio: number;
  nombreServicio: string;
  cantidadVendida: number;
  montoTotal: number;
  porcentajeDelTotal: number;
}

export interface VendedorRanking {
  idVendedor: number;
  nombreVendedor: string;
  cantidadOrdenes: number;
  montoTotalVendido: number;
  ticketPromedio: number;
  porcentajeDelTotal: number;
}

// ========== SERVICE ==========

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  
  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) { }

  obtenerKPIs(): Observable<DashboardKPIs> {
    return this.http.get<DashboardKPIs>(`${this.apiUrl}/kpis`);
  }

  obtenerVentasPorPeriodo(agrupacion: string, desde: string, hasta: string): Observable<VentasPorPeriodo> {
    const params = new HttpParams()
      .set('agrupacion', agrupacion)
      .set('desde', desde)
      .set('hasta', hasta);
    return this.http.get<VentasPorPeriodo>(`${this.apiUrl}/ventas-por-periodo`, { params });
  }

  obtenerServiciosTop(limite: number = 10): Observable<ServicioRanking[]> {
    const params = new HttpParams().set('limite', limite.toString());
    return this.http.get<ServicioRanking[]>(`${this.apiUrl}/servicios-top`, { params });
  }

  obtenerServiciosMenosVendidos(limite: number = 5): Observable<ServicioRanking[]> {
    const params = new HttpParams().set('limite', limite.toString());
    return this.http.get<ServicioRanking[]>(`${this.apiUrl}/servicios-menos-vendidos`, { params });
  }

  obtenerRankingVendedores(desde: string, hasta: string): Observable<VendedorRanking[]> {
    const params = new HttpParams()
      .set('desde', desde)
      .set('hasta', hasta);
    return this.http.get<VendedorRanking[]>(`${this.apiUrl}/vendedores-ranking`, { params });
  }

  obtenerVentasPorHora(): Observable<VentasPorPeriodo> {
    return this.http.get<VentasPorPeriodo>(`${this.apiUrl}/ventas-por-hora`);
  }
}