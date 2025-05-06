import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Rol } from '../../../../../../../core/models/rol.model';
import { RolesService } from '../../../services/roles.service';

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
    MatIconModule
  ]
})
export class CrearRolDialogComponent {
  form: FormGroup;
  modoEdicion = false;

  constructor(
    private fb: FormBuilder,
    private rolesService: RolesService,
    private dialogRef: MatDialogRef<CrearRolDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { rol?: Rol }
  ) {
    this.modoEdicion = !!data.rol;
    this.form = this.fb.group({
      nombre: [data.rol?.nombre || '', [Validators.required, Validators.minLength(3)]]
    });
    
    // Aplicar clases para el estilo oscuro
    this.dialogRef.addPanelClass(['custom-dialog', 'custom-dark-dialog']);
  }

  guardar(): void {
    if (this.form.invalid) {
      console.error('Formulario inválido', this.form.value);
      return;
    }
  
    const nuevoRol = {
      nombre: this.form.value.nombre
    };
  
    if (this.modoEdicion && this.data?.rol) {
      // 👉 Corregido para soportar id o _id
      const id = this.data.rol._id ?? this.data.rol.id;
      if (!id) {
        console.error('No se encontró un ID válido para actualizar el rol');
        alert('Error: No se puede actualizar el rol sin un ID válido.');
        return;
      }
      
      this.rolesService.actualizarRol(id, nuevoRol).subscribe({
        next: () => {
          console.log('Rol actualizado correctamente');
          this.dialogRef.close(true);
        },
        error: (error: any) => {
          console.error('Error actualizando rol:', error);
          alert('Error actualizando el rol.');
        }
      });
    } else {
      this.rolesService.crearRol(nuevoRol).subscribe({
        next: () => {
          console.log('Rol creado correctamente');
          this.dialogRef.close(true);
        },
        error: (error: any) => {
          console.error('Error creando rol:', error);
          alert('Error creando el rol.');
        }
      });
    }
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
