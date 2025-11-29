import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './kpi-card.component.html',
  styleUrls: ['./kpi-card.component.css']
})
export class KpiCardComponent {
  @Input() titulo: string = '';
  @Input() valor: number = 0;
  @Input() icono: string = 'trending_up';
  @Input() color: string = 'primary';
  @Input() variacion?: number;
  @Input() formato: 'moneda' | 'numero' | 'porcentaje' = 'numero';
  @Input() subtitulo?: string;
}