import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { TurnoService, TurnoDTO } from '../../../../services/ordenes/turno/turno.service';
import { TurnoModalComponent } from '../turno-modal/turno-modal.component';

@Component({
  selector: 'app-turno-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDialogModule,
    MatTableModule,
    MatChipsModule
  ],
  templateUrl: './turno-list.component.html',
  styleUrl: './turno-list.component.css'
})
export class TurnoListComponent implements OnInit {
  // lista de turnos obtenida del backend
  turnos: TurnoDTO[] = [];
  
  // columnas a mostrar en la tabla
  displayedColumns: string[] = ['nombre', 'horaInicio', 'horaFin', 'montoInicial', 'estado', 'acciones'];
  
  // bandera para mostrar/ocultar loading spinner
  cargando: boolean = false;
  
  // mensaje de error si la petición falla
  error: string = '';

  constructor(
    private turnoService: TurnoService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.cargarTurnos();
  }

  // cargarTurnos - obtiene la lista de turnos del backend
  cargarTurnos(): void {
    this.cargando = true;
    this.error = '';
    
    this.turnoService.obtenerTodos().subscribe({
      next: (data) => {
        this.turnos = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar turnos:', err);
        this.error = 'Error al cargar los turnos';
        this.cargando = false;
      }
    });
  }

  // abrirModalCrear - abre modal para crear nuevo turno
  abrirModalCrear(): void {
    const dialogRef = this.dialog.open(TurnoModalComponent, {
      width: '600px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado) {
        this.cargarTurnos();
      }
    });
  }

  // abrirModalEditar - abre modal para editar turno
  abrirModalEditar(turno: TurnoDTO): void {
    const dialogRef = this.dialog.open(TurnoModalComponent, {
      width: '600px',
      disableClose: true,
      data: { turno }
    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado) {
        this.cargarTurnos();
      }
    });
  }

  // eliminarTurno - elimina un turno y recarga la lista
  eliminarTurno(id: number | undefined): void {
    if (!id) return;
    
    if (confirm('¿Estás seguro de que deseas eliminar este turno?')) {
      this.turnoService.eliminar(id).subscribe({
        next: () => {
          this.cargarTurnos();
        },
        error: (err) => {
          console.error('Error al eliminar turno:', err);
          this.error = 'Error al eliminar el turno';
        }
      });
    }
  }

  // recargar - recarga la lista de turnos
  recargar(): void {
    this.cargarTurnos();
  }
}