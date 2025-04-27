import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-crear-cuenta-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  templateUrl: './crear-cuenta-dialog.component.html',
  styleUrls: ['./crear-cuenta-dialog.component.scss']
})
export class CrearCuentaDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CrearCuentaDialogComponent>
  ) {
    this.form = this.fb.group({
      tipo: ['', Validators.required],
      numero_cuenta: ['', Validators.required],
      saldo: [0, [Validators.required, Validators.min(0)]],
      meta_ahorro: [0, [Validators.required, Validators.min(0)]],
      color: ['#607d8b', Validators.required]
    });
    
  }

  guardar(): void {
    if (this.form.valid) {
      const cuenta = this.form.value;
      this.dialogRef.close(cuenta);
    }
  }
  
  cancelar() {
    this.dialogRef.close(null);
  }
}
