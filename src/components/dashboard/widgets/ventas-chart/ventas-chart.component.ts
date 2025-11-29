import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { PuntoVenta } from '../../../../services/dashboard/dashboard.service';

@Component({
  selector: 'app-ventas-chart',
  standalone: true,
  imports: [CommonModule, MatCardModule, NgxChartsModule],
  templateUrl: './ventas-chart.component.html',
  styleUrls: ['./ventas-chart.component.css']
})
export class VentasChartComponent implements OnChanges {
  @Input() datos: PuntoVenta[] = [];
  @Input() titulo: string = 'Ventas';
  @Input() tipo: 'linea' | 'barras' = 'linea';

  chartData: any[] = [];

  // Opciones del gráfico
  view: [number, number] = [700, 300];
  showXAxis = true;
  showYAxis = true;
  gradient = true;
  showLegend = false;
  showXAxisLabel = true;
  showYAxisLabel = true;
  xAxisLabel = 'Período';
  yAxisLabel = 'Ventas (S/)';
  colorScheme: any = {
    domain: ['#667eea', '#764ba2', '#11998e', '#38ef7d', '#F2994A']
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['datos'] && this.datos) {
      this.transformarDatos();
    }
  }

  private transformarDatos(): void {
    if (this.tipo === 'linea') {
      this.chartData = [{
        name: 'Ventas',
        series: this.datos.map(d => ({
          name: d.etiqueta,
          value: d.monto
        }))
      }];
    } else {
      this.chartData = this.datos.map(d => ({
        name: d.etiqueta,
        value: d.monto
      }));
    }
  }
}