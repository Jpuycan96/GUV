import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MisTareasDTO } from '../../../../services/ordenes/orden-proceso/orden-proceso.service';

@Component({
  selector: 'app-tarea-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './tarea-card.component.html',
  styleUrls: ['./tarea-card.component.css']
})
export class TareaCardComponent {
  @Input() tarea!: MisTareasDTO;
  @Output() completar = new EventEmitter<MisTareasDTO>();

  onCompletar(): void {
    if (!this.tarea.bloqueado) {
      this.completar.emit(this.tarea);
    }
  }

  getPrioridadColor(): string {
    switch (this.tarea.prioridad) {
      case 'ALTA': return 'warn';
      case 'MEDIA': return 'accent';
      case 'BAJA': return 'primary';
      default: return 'primary';
    }
  }

  getPrioridadIcon(): string {
    switch (this.tarea.prioridad) {
      case 'ALTA': return 'warning';
      case 'MEDIA': return 'schedule';
      case 'BAJA': return 'check_circle';
      default: return 'info';
    }
  }
}