import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';

import { KpiCardComponent } from '../widgets/kpi-card/kpi-card.component';
import { VentasChartComponent } from '../widgets/ventas-chart/ventas-chart.component';
import { ServiciosRankingComponent } from '../widgets/servicios-ranking/servicios-ranking.component';
import { VendedoresRankingComponent } from '../widgets/vendedores-ranking/vendedores-ranking.component';

import { 
  DashboardService, 
  DashboardKPIs, 
  VentasPorPeriodo, 
  ServicioRanking, 
  VendedorRanking 
} from '../../../services/dashboard/dashboard.service';

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatGridListModule,
    MatButtonToggleModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatProgressSpinnerModule,
    KpiCardComponent,
    VentasChartComponent,
    ServiciosRankingComponent,
    VendedoresRankingComponent
  ],
  templateUrl: './analytics-dashboard.component.html',
  styleUrls: ['./analytics-dashboard.component.css']
})
export class AnalyticsDashboardComponent implements OnInit {

  // Estados de carga
  cargandoKPIs = true;
  cargandoVentas = true;
  cargandoServicios = true;
  cargandoVendedores = true;
  cargandoHoraPico = true;

  // Datos
  kpis: DashboardKPIs | null = null;
  ventasPorPeriodo: VentasPorPeriodo | null = null;
  serviciosTop: ServicioRanking[] = [];
  serviciosMenosVendidos: ServicioRanking[] = [];
  rankingVendedores: VendedorRanking[] = [];
  ventasPorHora: VentasPorPeriodo | null = null;

  // Filtros
  agrupacion: string = 'dia';
  fechaDesde: Date;
  fechaHasta: Date;

  constructor(private dashboardService: DashboardService) {
    // Por defecto: último mes
    this.fechaHasta = new Date();
    this.fechaDesde = new Date();
    this.fechaDesde.setMonth(this.fechaDesde.getMonth() - 1);
  }

  ngOnInit(): void {
    this.cargarTodo();
  }

  cargarTodo(): void {
    this.cargarKPIs();
    this.cargarVentasPorPeriodo();
    this.cargarServiciosTop();
    this.cargarServiciosMenosVendidos();
    this.cargarRankingVendedores();
    this.cargarVentasPorHora();
  }

  cargarKPIs(): void {
    this.cargandoKPIs = true;
    this.dashboardService.obtenerKPIs().subscribe({
      next: (data) => {
        this.kpis = data;
        this.cargandoKPIs = false;
      },
      error: (err) => {
        console.error('Error cargando KPIs:', err);
        this.cargandoKPIs = false;
      }
    });
  }

  cargarVentasPorPeriodo(): void {
    this.cargandoVentas = true;
    const desde = this.formatearFecha(this.fechaDesde);
    const hasta = this.formatearFecha(this.fechaHasta);

    this.dashboardService.obtenerVentasPorPeriodo(this.agrupacion, desde, hasta).subscribe({
      next: (data) => {
        this.ventasPorPeriodo = data;
        this.cargandoVentas = false;
      },
      error: (err) => {
        console.error('Error cargando ventas:', err);
        this.cargandoVentas = false;
      }
    });
  }

  cargarServiciosTop(): void {
    this.cargandoServicios = true;
    this.dashboardService.obtenerServiciosTop(5).subscribe({
      next: (data) => {
        this.serviciosTop = data;
        this.cargandoServicios = false;
      },
      error: (err) => {
        console.error('Error cargando servicios top:', err);
        this.cargandoServicios = false;
      }
    });
  }

  cargarServiciosMenosVendidos(): void {
    this.dashboardService.obtenerServiciosMenosVendidos(5).subscribe({
      next: (data) => {
        this.serviciosMenosVendidos = data;
      },
      error: (err) => {
        console.error('Error cargando servicios menos vendidos:', err);
      }
    });
  }

  cargarRankingVendedores(): void {
    this.cargandoVendedores = true;
    const desde = this.formatearFecha(this.fechaDesde);
    const hasta = this.formatearFecha(this.fechaHasta);

    this.dashboardService.obtenerRankingVendedores(desde, hasta).subscribe({
      next: (data) => {
        this.rankingVendedores = data;
        this.cargandoVendedores = false;
      },
      error: (err) => {
        console.error('Error cargando ranking vendedores:', err);
        this.cargandoVendedores = false;
      }
    });
  }

  cargarVentasPorHora(): void {
    this.cargandoHoraPico = true;
    this.dashboardService.obtenerVentasPorHora().subscribe({
      next: (data) => {
        this.ventasPorHora = data;
        this.cargandoHoraPico = false;
      },
      error: (err) => {
        console.error('Error cargando ventas por hora:', err);
        this.cargandoHoraPico = false;
      }
    });
  }

  onFiltroChange(): void {
    this.cargarVentasPorPeriodo();
    this.cargarRankingVendedores();
  }

  private formatearFecha(fecha: Date): string {
    return fecha.toISOString().split('T')[0];
  }

  // Getters para hora pico
  get horaPico(): string {
    if (!this.ventasPorHora?.datos?.length) return '--';
    const max = this.ventasPorHora.datos.reduce((a, b) => a.monto > b.monto ? a : b);
    return max.etiqueta;
  }

  get ventasHoraPico(): number {
    if (!this.ventasPorHora?.datos?.length) return 0;
    const max = this.ventasPorHora.datos.reduce((a, b) => a.monto > b.monto ? a : b);
    return max.monto;
  }
}