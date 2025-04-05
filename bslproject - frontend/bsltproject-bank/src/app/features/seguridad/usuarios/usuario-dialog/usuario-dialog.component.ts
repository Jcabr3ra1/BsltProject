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
import { Rol } from '../../../../core/models/seguridad/rol.model';
import { Estado } from '../../../../core/models/seguridad/estado.model';
import { UsuariosService } from '../../../../core/services/seguridad/usuarios.service';
import { RolService } from '../../../../core/services/seguridad/rol.service';

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
  
  roles: Rol[] = [];
  estados: Estado[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UsuarioDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private usuariosService: UsuariosService,
    private rolService: RolService,
    private snackBar: MatSnackBar
  ) {
    this.modo = data.modo;
    this.titulo = this.modo === 'crear' ? 'Crear Nuevo Usuario' : 'Editar Usuario';
  }

  ngOnInit(): void {
    this.cargarCatalogos();
    this.initForm();
  }

  cargarCatalogos(): void {
    this.cargarRoles();
    this.cargarEstados();
  }

  cargarRoles(): void {
    this.rolService.obtenerRoles().subscribe({
      next: (roles) => {
        console.log('Roles obtenidos del backend:', roles);
        this.roles = roles;
      },
      error: (error) => {
        console.error('Error al cargar roles:', error);
        this.snackBar.open('Error al cargar roles', 'Cerrar', { duration: 3000 });
      }
    });
  }
  
  cargarEstados(): void {
    this.usuariosService.getEstados().subscribe({
      next: (estados) => {
        console.log('Estados obtenidos del backend:', estados);
        this.estados = estados;
      },
      error: (error) => {
        console.error('Error al cargar estados:', error);
        this.snackBar.open('Error al cargar estados', 'Cerrar', { duration: 3000 });
      }
    });
  }
  
  initForm(): void {
    const usuario = this.data.usuario || {} as Usuario;
    this.inicializarFormulario(usuario);
  }

  inicializarFormulario(usuario: Usuario = {} as Usuario): void {  
    // Crear formulario con validaciones
    this.usuarioForm = this.fb.group({
      id: [usuario.id || usuario._id || null],
      nombre: [usuario.nombre || usuario.name || '', [Validators.required, Validators.minLength(2)]],
      apellido: [usuario.apellido || usuario.lastName || '', [Validators.required, Validators.minLength(2)]],
      email: [usuario.email || '', [Validators.required, Validators.email]],
      password: [this.modo === 'crear' ? '' : null, this.modo === 'crear' ? [Validators.required, Validators.minLength(6)] : []],
      role: [usuario.role || '', Validators.required],
      estado: [usuario.estado || usuario.state || '', Validators.required]
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
    const usuarioData = this.usuarioForm.value as Usuario;
    
    // Si estamos editando y no se cambió la contraseña, no la enviamos
    if (this.modo === 'editar' && !usuarioData.password) {
      delete usuarioData.password;
    }
    
    // Preparamos los datos para enviar al servicio
    // El modelo Usuario tiene propiedades tanto en español como en inglés para compatibilidad
    const usuarioParaEnviar: Partial<Usuario> = {
      id: usuarioData.id,
      nombre: usuarioData.nombre,
      apellido: usuarioData.apellido,
      email: usuarioData.email,
      password: usuarioData.password,
      
      // Propiedades en inglés para compatibilidad con el backend
      name: usuarioData.nombre,
      lastName: usuarioData.apellido,
      role: usuarioData.role,
      state: usuarioData.estado
    };
    
    const operacion = this.modo === 'crear' 
      ? this.usuariosService.crear(usuarioParaEnviar)
      : this.usuariosService.actualizar(usuarioParaEnviar.id!, usuarioParaEnviar);
    
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
