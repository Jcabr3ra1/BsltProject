import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Permiso } from '../../../../../../../core/models/permiso.model';

@Component({
  selector: 'app-editar-permiso-dialog',
  standalone: true,
  templateUrl: './editar-permiso-dialog.component.html',
  styleUrls: ['./editar-permiso-dialog.component.scss'],
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
export class EditarPermisoDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditarPermisoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { permiso: Permiso }
  ) {
    this.form = this.fb.group({
      nombre: [data.permiso.nombre, [Validators.required, Validators.minLength(3)]],
      descripcion: [data.permiso.descripcion, [Validators.required, Validators.minLength(5)]]
    });
  }

  guardar(): void {
    if (this.form.valid) {
      const permisoActualizado: Permiso = {
        ...this.data.permiso,
        nombre: this.form.value.nombre,
        descripcion: this.form.value.descripcion
      };
      this.dialogRef.close(permisoActualizado);
    }
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
