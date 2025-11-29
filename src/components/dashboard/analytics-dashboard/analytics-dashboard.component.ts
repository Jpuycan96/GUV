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
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
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

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
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
  exportandoPDF = false;

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

  // ========== EXPORTAR PDF ==========

  exportarPDF(): void {
    if (!this.kpis) return;

    this.exportandoPDF = true;

    const doc = new jsPDF();
    const fechaReporte = new Date().toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Header
    doc.setFillColor(102, 126, 234);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Gigantografías UV', 14, 20);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Reporte de Dashboard Analítico', 14, 30);
    
    doc.setFontSize(10);
    doc.text(fechaReporte, 196, 30, { align: 'right' });

    // Reset color
    doc.setTextColor(0, 0, 0);
    let yPos = 50;

    // Sección KPIs
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Indicadores Principales', 14, yPos);
    yPos += 10;

    const kpisData = [
      ['Ventas Hoy', `S/ ${this.kpis.ventasHoy.toFixed(2)}`],
      ['Ventas Semana', `S/ ${this.kpis.ventasSemana.toFixed(2)}`],
      ['Ventas Mes', `S/ ${this.kpis.ventasMes.toFixed(2)}`],
      ['Ventas Año', `S/ ${this.kpis.ventasAnio.toFixed(2)}`],
      ['Ticket Promedio', `S/ ${this.kpis.ticketPromedio.toFixed(2)}`],
      ['Órdenes en Proceso', this.kpis.ordenesEnProceso.toString()],
      ['Pendientes de Pago', this.kpis.ordenesPendientesPago.toString()],
      ['Tasa de Completado', `${this.kpis.tasaCompletado.toFixed(1)}%`]
    ];

    autoTable(doc, {
      startY: yPos,
      head: [['Indicador', 'Valor']],
      body: kpisData,
      theme: 'striped',
      headStyles: { fillColor: [102, 126, 234] },
      margin: { left: 14, right: 14 }
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    // Sección Servicios Top
    if (this.serviciosTop.length > 0) {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Servicios Más Vendidos', 14, yPos);
      yPos += 10;

      const serviciosData = this.serviciosTop.map((s, i) => [
        (i + 1).toString(),
        s.nombreServicio,
        s.cantidadVendida.toString(),
        `S/ ${s.montoTotal.toFixed(2)}`,
        `${s.porcentajeDelTotal.toFixed(1)}%`
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['#', 'Servicio', 'Cantidad', 'Monto Total', '% del Total']],
        body: serviciosData,
        theme: 'striped',
        headStyles: { fillColor: [102, 126, 234] },
        margin: { left: 14, right: 14 }
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;
    }

    // Nueva página si es necesario
    if (yPos > 230) {
      doc.addPage();
      yPos = 20;
    }

    // Sección Ranking Vendedores
    if (this.rankingVendedores.length > 0) {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Ranking de Vendedores', 14, yPos);
      yPos += 10;

      const vendedoresData = this.rankingVendedores.map((v, i) => [
        (i + 1).toString(),
        v.nombreVendedor,
        v.cantidadOrdenes.toString(),
        `S/ ${v.montoTotalVendido.toFixed(2)}`,
        `S/ ${v.ticketPromedio.toFixed(2)}`,
        `${v.porcentajeDelTotal.toFixed(1)}%`
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['#', 'Vendedor', 'Órdenes', 'Total Vendido', 'Ticket Prom.', '% del Total']],
        body: vendedoresData,
        theme: 'striped',
        headStyles: { fillColor: [102, 126, 234] },
        margin: { left: 14, right: 14 }
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;
    }

    // Nueva página si es necesario
    if (yPos > 230) {
      doc.addPage();
      yPos = 20;
    }

    // Sección Ventas por Hora
    if (this.ventasPorHora?.datos?.length) {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Ventas por Hora del Día', 14, yPos);
      yPos += 10;

      const horasData = this.ventasPorHora.datos.map(h => [
        h.etiqueta,
        h.cantidadOrdenes.toString(),
        `S/ ${h.monto.toFixed(2)}`
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Hora', 'Órdenes', 'Monto']],
        body: horasData,
        theme: 'striped',
        headStyles: { fillColor: [102, 126, 234] },
        margin: { left: 14, right: 14 }
      });
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Página ${i} de ${pageCount} - Generado por Gigantografías UV`,
        105,
        290,
        { align: 'center' }
      );
    }

    // Descargar
    const nombreArchivo = `reporte-dashboard-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(nombreArchivo);

    this.exportandoPDF = false;
  }
}