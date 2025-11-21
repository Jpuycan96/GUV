import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MisTareasDTO } from '../../../../services/ordenes/orden-proceso/orden-proceso.service';

@Component({
  selector: 'app-completar-proceso-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  templateUrl: './completar-proceso-modal.component.html',
  styleUrls: ['./completar-proceso-modal.component.css']
})
export class CompletarProcesoModalComponent {
  form: FormGroup;
  tarea: MisTareasDTO;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CompletarProcesoModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { tarea: MisTareasDTO }
  ) {
    this.tarea = data.tarea;
    
    this.form = this.fb.group({
      observaciones: ['']
    });
  }

  onConfirmar(): void {
    const observaciones = this.form.value.observaciones?.trim() || undefined;
    this.dialogRef.close({ observaciones });
  }

  onCancelar(): void {
    this.dialogRef.close();
  }
}