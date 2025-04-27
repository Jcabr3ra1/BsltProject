import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-crear-tipo-transaccion-dialog',
  standalone: true,
  templateUrl: './crear-tipo-transaccion-dialog.component.html',
  styleUrls: ['./crear-tipo-transaccion-dialog.component.scss'],
  imports: [
    CommonModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ]
})
export class CrearTipoTransaccionDialogComponent {
  form: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<CrearTipoTransaccionDialogComponent>,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      descripcion: ['', Validators.required]
    });
  }

  guardar(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
