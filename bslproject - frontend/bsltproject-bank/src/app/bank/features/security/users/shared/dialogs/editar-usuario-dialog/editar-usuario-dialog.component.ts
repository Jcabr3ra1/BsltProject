import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { UsuariosService } from '../../../services/usuarios.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-editar-usuario-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './editar-usuario-dialog.component.html',
  styleUrls: ['./editar-usuario-dialog.component.scss']
})
export class EditarUsuarioDialogComponent implements OnInit {
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditarUsuarioDialogComponent>,
    private usuariosService: UsuariosService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      nombre: [this.data.nombre, Validators.required],
      apellido: [this.data.apellido, Validators.required],
      email: [this.data.email, [Validators.required, Validators.email]]
    });
  }

  guardar() {
    if (this.form.valid) {
      const usuarioPayload = {
        nombre: this.form.value.nombre,
        apellido: this.form.value.apellido,
        email: this.form.value.email,
        // Mantener los roles y estado actuales
        roles: this.data.roles,
        estado: this.data.estado 
      };
  
      this.usuariosService.actualizarUsuario(this.data.id, usuarioPayload).subscribe({
        next: () => this.dialogRef.close(true),
        error: (error) => console.error('Error al actualizar usuario:', error)
      });
    }
  }

  cancelar() {
    this.dialogRef.close(false);
  }
}