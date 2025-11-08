import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { OrdenPagoService, OrdenPagoDTO } from '../../../../services/ordenes/orden-pago/orden-pago.service';
import { TipoPagoService, TipoPagoDTO } from '../../../../services/ordenes/tipo-pago/tipo-pago.service';
import { AuthService } from '../../../../services/AuthService';

@Component({
  selector: 'app-orden-pago-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './orden-pago-modal.component.html',
  styleUrl: './orden-pago-modal.component.css'
})
export class OrdenPagoModalComponent implements OnInit {
  pagoForm: FormGroup;
  tiposPago: TipoPagoDTO[] = [];
  guardando = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<OrdenPagoModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { idOrden: number; saldoPendiente: number; idUsuario: number },
    private pagoService: OrdenPagoService,
    private tipoPagoService: TipoPagoService,
    private authService: AuthService
  ) {
    this.pagoForm = this.fb.group({
      monto: [data.saldoPendiente, [Validators.required, Validators.min(0.01), Validators.max(data.saldoPendiente)]],
      idTipoPago: ['', Validators.required],
      numeroOperacion: [''],
      observaciones: ['']
    });
  }

  ngOnInit(): void {
    this.cargarTiposPago();
  }

  cargarTiposPago(): void {
    this.tipoPagoService.obtenerActivos().subscribe({
      next: (tipos) => {
        this.tiposPago = tipos;
      },
      error: (err) => {
        console.error('Error al cargar tipos de pago:', err);
        this.error = 'Error al cargar tipos de pago';
      }
    });
  }

  onTipoPagoChange(): void {
    const idTipoPago = this.pagoForm.get('idTipoPago')?.value;
    const tipoPago = this.tiposPago.find(t => t.idTipoPago === idTipoPago);
    
    const numeroOperacionControl = this.pagoForm.get('numeroOperacion');
    
    if (tipoPago?.requiereOperacion) {
      numeroOperacionControl?.setValidators([Validators.required]);
    } else {
      numeroOperacionControl?.clearValidators();
    }
    
    numeroOperacionControl?.updateValueAndValidity();
  }

  registrarPago(): void {
    if (this.pagoForm.invalid) return;

    this.guardando = true;
    this.error = '';

    const usuario = this.authService.getUsuarioActual();
    
    const dto: OrdenPagoDTO = {
      idOrden: this.data.idOrden,
      idUsuario: usuario?.idUsuario || 0,
      ...this.pagoForm.value
    };

    console.log('💰 [Modal] Registrando pago...');
    console.log('👤 Usuario del pago:', dto.idUsuario);

    this.pagoService.registrarPago(dto).subscribe({
      next: (pago) => {
        console.log('✅ [Modal] Pago registrado exitosamente');
        this.dialogRef.close({ success: true, pago: pago });
      },
      error: (err) => {
        console.error('❌ [Modal] Error al registrar pago:', err);
        this.error = 'Error al registrar el pago';
        this.guardando = false;
      }
    });
  }
    // ✅ AGREGAR ESTE MÉTODO
  cerrar(): void {
    this.dialogRef.close(null);
  }
}
