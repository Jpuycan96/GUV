import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ServicioRanking } from '../../../../services/dashboard/dashboard.service';

@Component({
  selector: 'app-servicios-ranking',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatProgressBarModule, NgxChartsModule],
  templateUrl: './servicios-ranking.component.html',
  styleUrls: ['./servicios-ranking.component.css']
})
export class ServiciosRankingComponent {
  @Input() datos: ServicioRanking[] = [];
  @Input() titulo: string = 'Servicios más vendidos';
  @Input() mostrarGrafico: boolean = true;

  view: [number, number] = [400, 300];
  colorScheme: any = {
    domain: ['#667eea', '#764ba2', '#11998e', '#38ef7d', '#F2994A', '#F2C94C', '#eb3349', '#2193b0']
  };

  get chartData(): any[] {
    return this.datos.map(d => ({
      name: d.nombreServicio,
      value: d.cantidadVendida
    }));
  }
}