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
import { ComprobanteService, ComprobanteDTO } from '../../../../services/ordenes/comprobante/comprobante.service';
@Component({
  selector: 'app-comprobante-modal',
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
  templateUrl: './comprobante-modal.component.html',
  styleUrl: './comprobante-modal.component.css'
})
export class ComprobanteModalComponent implements OnInit {
  comprobanteForm: FormGroup;
  guardando = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ComprobanteModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { 
      idOrden: number; 
      total: number; 
      idUsuario: number;
      clienteRuc?: string;
      clienteRazon?: string;
      clienteDireccion?: string;
    },
    private comprobanteService: ComprobanteService
  ) {
    this.comprobanteForm = this.fb.group({
      tipoComprobante: ['BOLETA', Validators.required],
      serie: ['B001', Validators.required],
      ruc: [data.clienteRuc || ''],
      razonSocialFiscal: [data.clienteRazon || ''],
      direccionFiscal: [data.clienteDireccion || '']
    });
  }

  ngOnInit(): void {
    this.onTipoComprobanteChange();
  }

  onTipoComprobanteChange(): void {
    const tipo = this.comprobanteForm.get('tipoComprobante')?.value;
    const rucControl = this.comprobanteForm.get('ruc');
    const razonControl = this.comprobanteForm.get('razonSocialFiscal');
    const direccionControl = this.comprobanteForm.get('direccionFiscal');

    if (tipo === 'FACTURA') {
      this.comprobanteForm.patchValue({ serie: 'F001' });
      rucControl?.setValidators([Validators.required, Validators.pattern(/^\d{11}$/)]);
      razonControl?.setValidators([Validators.required]);
      direccionControl?.setValidators([Validators.required]);
    } else {
      this.comprobanteForm.patchValue({ serie: 'B001' });
      rucControl?.clearValidators();
      razonControl?.clearValidators();
      direccionControl?.clearValidators();
    }

    rucControl?.updateValueAndValidity();
    razonControl?.updateValueAndValidity();
    direccionControl?.updateValueAndValidity();
  }

  emitirComprobante(): void {
    if (this.comprobanteForm.invalid) return;

    this.guardando = true;
    this.error = '';

    const subtotal = this.data.total / 1.18;
    const igv = this.data.total - subtotal;

    const dto: ComprobanteDTO = {
      idOrden: this.data.idOrden,
      idUsuario: this.data.idUsuario,
      subtotal: subtotal,
      igv: igv,
      total: this.data.total,
      ...this.comprobanteForm.value
    };

    this.comprobanteService.emitirComprobante(dto).subscribe({
      next: (comprobante) => {
        this.dialogRef.close(comprobante);
      },
      error: (err) => {
        console.error('Error al emitir comprobante:', err);
        this.error = 'Error al emitir el comprobante';
        this.guardando = false;
      }
    });
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}