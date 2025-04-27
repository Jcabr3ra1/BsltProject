import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Estado } from '../../../../../../../core/models/estado.model';

@Component({
  selector: 'app-editar-estado-dialog',
  standalone: true,
  templateUrl: './editar-estado-dialog.component.html',
  styleUrls: ['./editar-estado-dialog.component.scss'],
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
export class EditarEstadoDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditarEstadoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { estado: Estado }
  ) {
    this.form = this.fb.group({
      nombre: [data.estado.nombre, [Validators.required, Validators.minLength(3)]]
    });
  }

  guardar(): void {
    if (this.form.valid) {
      const estadoActualizado: Estado = {
        ...this.data.estado,
        nombre: this.form.value.nombre
      };
      this.dialogRef.close(estadoActualizado);
    }
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
