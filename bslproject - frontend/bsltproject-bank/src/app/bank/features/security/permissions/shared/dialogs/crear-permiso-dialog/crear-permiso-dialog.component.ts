import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Permiso } from '../../../../../../../core/models/permiso.model';

@Component({
  selector: 'app-crear-permiso-dialog',
  standalone: true,
  templateUrl: './crear-permiso-dialog.component.html',
  styleUrls: ['./crear-permiso-dialog.component.scss'],
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
export class CrearPermisoDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CrearPermisoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { permiso?: Permiso }
  ) {
    this.form = this.fb.group({
      nombre: [data.permiso?.nombre || '', [Validators.required, Validators.minLength(3)]],
      descripcion: [data.permiso?.descripcion || '', [Validators.required, Validators.minLength(5)]]
    });
  }

  guardar(): void {
    if (this.form.valid) {
      const permiso: Permiso = {
        ...this.data.permiso,
        nombre: this.form.value.nombre,
        descripcion: this.form.value.descripcion
      };
      this.dialogRef.close(permiso);
    }
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
