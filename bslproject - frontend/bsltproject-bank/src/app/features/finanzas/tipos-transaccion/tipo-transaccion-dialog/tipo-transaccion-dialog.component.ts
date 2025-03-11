import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TipoTransaccion } from '@core/models/finanzas/transaccion.model';

@Component({
  selector: 'app-tipo-transaccion-dialog',
  templateUrl: './tipo-transaccion-dialog.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule
  ]
})
export class TipoTransaccionDialogComponent implements OnInit {
  tipoTransaccionForm: FormGroup;
  titulo: string;
  tipoTransaccion: TipoTransaccion | null = null;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<TipoTransaccionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.titulo = data.titulo || 'Tipo de Transacción';
    this.tipoTransaccion = data.tipoTransaccion || null;
    
    this.tipoTransaccionForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: ['', Validators.maxLength(255)],
      requiereDestino: [true]
    });
  }

  ngOnInit(): void {
    if (this.tipoTransaccion) {
      this.tipoTransaccionForm.patchValue({
        nombre: this.tipoTransaccion.nombre,
        descripcion: this.tipoTransaccion.descripcion,
        requiereDestino: this.tipoTransaccion.requiereDestino
      });
    }
  }

  onSubmit(): void {
    if (this.tipoTransaccionForm.valid) {
      const tipoTransaccion: TipoTransaccion = {
        ...this.tipoTransaccion,
        ...this.tipoTransaccionForm.value
      };
      this.dialogRef.close(tipoTransaccion);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
