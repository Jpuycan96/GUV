import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

// Material
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Services
import { CajaDiariaService } from '../../../../services/ordenes/caja-diaria/caja-diaria.service';
import { TurnoService, TurnoDTO } from '../../../../services/ordenes/turno/turno.service';
import { AuthService } from '../../../../services/AuthService';

@Component({
  selector: 'app-caja-abrir-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './caja-abrir-modal.component.html',
  styleUrl: './caja-abrir-modal.component.css'
})
export class CajaAbrirModalComponent implements OnInit {

  form: FormGroup;
  turnos: TurnoDTO[] = [];
  cargandoTurnos = false;
  guardando = false;
  error = '';
  
  // Info del cajero actual
  nombreCajero = '';
  idCajero: number | undefined;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CajaAbrirModalComponent>,
    private cajaService: CajaDiariaService,
    private turnoService: TurnoService,
    private authService: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.fb.group({
      idTurno: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.obtenerCajeroActual();
    this.cargarTurnos();
  }

  // ========== OBTENER CAJERO ACTUAL ==========
  obtenerCajeroActual(): void {
    const usuario = this.authService.getUsuarioActual();
    
    if (usuario) {
      this.nombreCajero = usuario.username || usuario.username;
      this.idCajero = usuario.idUsuario;
    } else {
      this.error = 'No se pudo obtener información del usuario actual';
    }
  }

  // ========== CARGAR TURNOS ACTIVOS ==========
  cargarTurnos(): void {
    this.cargandoTurnos = true;
    this.error = '';

    this.turnoService.obtenerActivos().subscribe({
      next: (data) => {
        this.turnos = data;
        this.cargandoTurnos = false;

        // Si solo hay 1 turno, seleccionarlo automáticamente
        if (this.turnos.length === 1) {
          this.form.patchValue({ idTurno: this.turnos[0].idTurno });
        }
      },
      error: (err) => {
        console.error('Error al cargar turnos:', err);
        this.error = 'Error al cargar los turnos disponibles';
        this.cargandoTurnos = false;
      }
    });
  }

  // ========== ABRIR CAJA ==========
  abrirCaja(): void {
    if (this.form.invalid || !this.idCajero) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando = true;
    this.error = '';

    const request = {
      idTurno: this.form.value.idTurno,
      idCajero: this.idCajero
    };

    this.cajaService.abrirCaja(request).subscribe({
      next: (caja) => {
        console.log('✅ Caja abierta:', caja);
        this.dialogRef.close(caja); // Cerrar modal y devolver la caja creada
      },
      error: (err) => {
        console.error('❌ Error al abrir caja:', err);
        
        // Mostrar mensaje de error apropiado
        if (err.error?.message) {
          this.error = err.error.message;
        } else if (err.status === 400) {
          this.error = 'Ya existe una caja abierta para este turno o cajero';
        } else {
          this.error = 'Error al abrir la caja. Intente nuevamente.';
        }
        
        this.guardando = false;
      }
    });
  }

  // ========== CANCELAR ==========
  cancelar(): void {
    this.dialogRef.close(null);
  }

  // ========== HELPERS ==========
  getTurnoNombre(turno: TurnoDTO): string {
    return `${turno.nombre} (${turno.horaInicio} - ${turno.horaFin})`;
  }
}