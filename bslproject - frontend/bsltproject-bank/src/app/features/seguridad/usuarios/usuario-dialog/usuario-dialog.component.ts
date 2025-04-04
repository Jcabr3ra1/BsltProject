import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Usuario } from '../../../../core/models/seguridad/usuario.model';
import { UsuariosService } from '../../../../core/services/seguridad/usuarios.service';

@Component({
  selector: 'app-usuario-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './usuario-dialog.component.html',
  styleUrls: ['./usuario-dialog.component.scss']
})
export class UsuarioDialogComponent implements OnInit {
  usuarioForm!: FormGroup;
  loading = false;
  modo: 'crear' | 'editar';
  titulo: string;
  
  roles = [
    { id: 'ADMIN', name: 'Administrador' },
    { id: 'CLIENTE', name: 'Cliente' },
    { id: 'EMPLEADO', name: 'Empleado' }
  ];
  
  estados = [
    { id: 'ACTIVO', name: 'Activo' },
    { id: 'INACTIVO', name: 'Inactivo' },
    { id: 'PENDIENTE', name: 'Pendiente' },
    { id: 'BLOQUEADO', name: 'Bloqueado' }
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UsuarioDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { usuario: Usuario, modo: 'crear' | 'editar' },
    private usuariosService: UsuariosService,
    private snackBar: MatSnackBar
  ) {
    this.modo = data.modo;
    this.titulo = this.modo === 'crear' ? 'Crear Nuevo Usuario' : 'Editar Usuario';
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    const usuario = this.data.usuario;
    
    // Crear formulario con validaciones
    this.usuarioForm = this.fb.group({
      id: [usuario.id || null],
      nombre: [usuario.nombre || '', [Validators.required, Validators.minLength(2)]],
      apellido: [usuario.apellido || '', [Validators.required, Validators.minLength(2)]],
      email: [usuario.email || '', [Validators.required, Validators.email]],
      password: [this.modo === 'crear' ? '' : null, this.modo === 'crear' ? [Validators.required, Validators.minLength(6)] : []],
      rol: [usuario.rol || 'CLIENTE', Validators.required],
      estado: [usuario.estado || 'PENDIENTE', Validators.required]
    });
    
    // Si estamos editando, el password es opcional
    if (this.modo === 'editar') {
      this.usuarioForm.get('password')?.setValidators(null);
      this.usuarioForm.get('password')?.updateValueAndValidity();
    }
  }

  onSubmit(): void {
    if (this.usuarioForm.invalid) {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.usuarioForm.controls).forEach(key => {
        const control = this.usuarioForm.get(key);
        control?.markAsTouched();
      });
      return;
    }
    
    this.loading = true;
    const usuarioData = this.usuarioForm.value;
    
    // Si estamos editando y no se cambió la contraseña, no la enviamos
    if (this.modo === 'editar' && !usuarioData.password) {
      delete usuarioData.password;
    }
    
    const operacion = this.modo === 'crear' 
      ? this.usuariosService.crearUsuario(usuarioData)
      : this.usuariosService.actualizarUsuario(usuarioData.id, usuarioData);
    
    operacion.subscribe({
      next: (response) => {
        this.loading = false;
        this.snackBar.open(
          `Usuario ${this.modo === 'crear' ? 'creado' : 'actualizado'} correctamente`, 
          'Cerrar', 
          { duration: 3000, panelClass: 'success-snackbar' }
        );
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.loading = false;
        console.error(`Error al ${this.modo} usuario:`, error);
        this.snackBar.open(
          `Error al ${this.modo === 'crear' ? 'crear' : 'actualizar'} usuario: ${error.message || 'Error desconocido'}`, 
          'Cerrar', 
          { duration: 5000, panelClass: 'error-snackbar' }
        );
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  // Helpers para validación
  getErrorMessage(controlName: string): string {
    const control = this.usuarioForm.get(controlName);
    
    if (!control) return '';
    
    if (control.hasError('required')) {
      return 'Este campo es obligatorio';
    }
    
    if (control.hasError('email')) {
      return 'Debe ingresar un email válido';
    }
    
    if (control.hasError('minlength')) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `Debe tener al menos ${minLength} caracteres`;
    }
    
    return '';
  }
}
