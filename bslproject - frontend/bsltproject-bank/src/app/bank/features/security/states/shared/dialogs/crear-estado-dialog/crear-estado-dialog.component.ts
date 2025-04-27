import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Estado } from '../../../../../../../core/models/estado.model';

@Component({
  selector: 'app-crear-estado-dialog',
  standalone: true,
  templateUrl: './crear-estado-dialog.component.html',
  styleUrls: ['./crear-estado-dialog.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ]
})
export class CrearEstadoDialogComponent {
  form: FormGroup;
  modoEdicion = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CrearEstadoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { estado?: Estado }
  ) {
    this.modoEdicion = !!data.estado;
    this.form = this.fb.group({
      nombre: [data.estado?.nombre || '', [Validators.required, Validators.minLength(3)]]
    });
  }

  guardar(): void {
    if (this.form.valid) {
      const estado: Estado = {
        ...this.data.estado,
        nombre: this.form.value.nombre
      };
      this.dialogRef.close(estado);
    }
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
