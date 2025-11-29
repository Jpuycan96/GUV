import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { VendedorRanking } from '../../../../services/dashboard/dashboard.service';

@Component({
  selector: 'app-vendedores-ranking',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatProgressBarModule, MatIconModule],
  templateUrl: './vendedores-ranking.component.html',
  styleUrls: ['./vendedores-ranking.component.css']
})
export class VendedoresRankingComponent {
  @Input() datos: VendedorRanking[] = [];
  @Input() titulo: string = 'Ranking de Vendedores';

  getMedalla(posicion: number): string {
    switch(posicion) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return '';
    }
  }
}