import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { Rol } from '../../../../../../../core/models/rol.model';
import { RolesService } from '../../../services/roles.service';

@Component({
  selector: 'app-crear-rol-dialog',
  standalone: true,
  templateUrl: './crear-rol-dialog.component.html',
  styleUrls: ['./crear-rol-dialog.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatIconModule,
    MatSnackBarModule
  ]
})
export class CrearRolDialogComponent {
  form: FormGroup;
  modoEdicion = false;

  constructor(
    private fb: FormBuilder,
    private rolesService: RolesService,
    private dialogRef: MatDialogRef<CrearRolDialogComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { rol?: Rol }
  ) {
    this.modoEdicion = !!data.rol;
    this.form = this.fb.group({
      nombre: [data.rol?.nombre || '', [Validators.required, Validators.minLength(3)]]
    });
    
    this.dialogRef.addPanelClass(['custom-dialog', 'custom-dark-dialog']);
  }

  guardar(): void {
    if (this.form.invalid) {
      return;
    }
  
    const nuevoRol = {
      nombre: this.form.value.nombre
    };
  
    if (this.modoEdicion && this.data?.rol) {
      const id = this.data.rol._id ?? this.data.rol.id;
      if (!id) {
        this.snackBar.open('Error: No se puede actualizar el rol sin un ID válido.', 'Cerrar', { duration: 3000 });
        return;
      }
      
      this.rolesService.actualizarRol(id, nuevoRol).subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: (error: HttpErrorResponse) => {
          this.snackBar.open('Error actualizando el rol.', 'Cerrar', { duration: 3000 });
        }
      });
    } else {
      this.rolesService.crearRol(nuevoRol).subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: (error: HttpErrorResponse) => {
          this.snackBar.open('Error creando el rol.', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
