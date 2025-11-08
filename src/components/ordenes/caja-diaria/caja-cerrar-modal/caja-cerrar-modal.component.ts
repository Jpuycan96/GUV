import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

// Material
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';

// Services
import { CajaDiariaService, CajaDiariaDTO } from '../../../../services/ordenes/caja-diaria/caja-diaria.service';

@Component({
  selector: 'app-caja-cerrar-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  templateUrl: './caja-cerrar-modal.component.html',
  styleUrl: './caja-cerrar-modal.component.css'
})
export class CajaCerrarModalComponent implements OnInit {

  form: FormGroup;
  guardando = false;
  error = '';
  
  // Datos de la caja
  caja: CajaDiariaDTO;
  
  // Diferencia calculada
  diferencia: number = 0;

  // Exponer Math al template
  Math = Math;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CajaCerrarModalComponent>,
    private cajaService: CajaDiariaService,
    @Inject(MAT_DIALOG_DATA) public data: { caja: CajaDiariaDTO }
  ) {
    this.caja = data.caja;
    
    this.form = this.fb.group({
      montoReal: [
        this.caja.totalEfectivo || 0, 
        [Validators.required, Validators.min(0)]
      ],
      observaciones: ['']
    });
  }

  ngOnInit(): void {
    // Calcular diferencia cuando cambia el monto real
    this.form.get('montoReal')?.valueChanges.subscribe(montoReal => {
      this.calcularDiferencia(montoReal);
    });

    // Calcular diferencia inicial
    this.calcularDiferencia(this.form.get('montoReal')?.value || 0);
  }

  // ========== CALCULAR DIFERENCIA ==========
  calcularDiferencia(montoReal: number): void {
    const montoEsperado = this.caja.totalEfectivo || 0;
    this.diferencia = montoReal - montoEsperado;
  }

  // ========== CERRAR CAJA ==========
  cerrarCaja(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // Confirmación si hay diferencia
    if (Math.abs(this.diferencia) > 0) {
      const mensaje = this.diferencia > 0 
        ? `Hay un SOBRANTE de S/ ${this.diferencia.toFixed(2)}. ¿Desea continuar?`
        : `Hay un FALTANTE de S/ ${Math.abs(this.diferencia).toFixed(2)}. ¿Desea continuar?`;
      
      if (!confirm(mensaje)) {
        return;
      }
    }

    this.guardando = true;
    this.error = '';

    const request = {
      montoReal: this.form.value.montoReal,
      observaciones: this.form.value.observaciones || null
    };

    this.cajaService.cerrarCaja(this.caja.idCaja!, request).subscribe({
      next: (cajaCerrada) => {
        console.log('✅ Caja cerrada:', cajaCerrada);
        this.dialogRef.close(cajaCerrada); // Cerrar modal y devolver la caja cerrada
      },
      error: (err) => {
        console.error('❌ Error al cerrar caja:', err);
        
        if (err.error?.message) {
          this.error = err.error.message;
        } else {
          this.error = 'Error al cerrar la caja. Intente nuevamente.';
        }
        
        this.guardando = false;
      }
    });
  }

  // ========== CANCELAR ==========
  cancelar(): void {
    if (confirm('¿Está seguro de cancelar el cierre de caja?')) {
      this.dialogRef.close(null);
    }
  }

  // ========== HELPERS ==========
  getDiferenciaClass(): string {
    if (this.diferencia > 0) return 'diferencia-positiva';
    if (this.diferencia < 0) return 'diferencia-negativa';
    return 'diferencia-neutra';
  }

  getTotalDigital(): number {
    return (this.caja.totalYape || 0) + 
           (this.caja.totalPlin || 0) + 
           (this.caja.totalTransferencia || 0);
  }
}