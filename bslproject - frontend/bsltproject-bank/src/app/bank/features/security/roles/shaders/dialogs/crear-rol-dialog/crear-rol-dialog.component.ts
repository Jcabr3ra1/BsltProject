import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Rol } from '../../../../../../../core/models/rol.model';

@Component({
  selector: 'app-crear-rol-dialog',
  standalone: true,
  templateUrl: './crear-rol-dialog.component.html',
  styleUrls: ['./crear-rol-dialog.component.scss'],
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
export class CrearRolDialogComponent {
  form: FormGroup;
  modoEdicion = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CrearRolDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { rol?: Rol }
  ) {
    this.modoEdicion = !!data.rol;
    this.form = this.fb.group({
      nombre: [data.rol?.nombre || '', [Validators.required, Validators.minLength(3)]]
    });
  }

  guardar(): void {
    if (this.form.valid) {
      const rol: Rol = {
        ...this.data.rol,
        nombre: this.form.value.nombre
      };
      this.dialogRef.close(rol);
    }
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
