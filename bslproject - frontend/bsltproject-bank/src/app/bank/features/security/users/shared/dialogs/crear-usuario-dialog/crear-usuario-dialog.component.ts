import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { UsuariosService } from '../../../services/usuarios.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-crear-usuario-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './crear-usuario-dialog.component.html',
  styleUrls: ['./crear-usuario-dialog.component.scss']
})
export class CrearUsuarioDialogComponent implements OnInit {
  form!: FormGroup;
  roles: any[] = [];
  estados: any[] = [];
  hidePassword: boolean = true;
  isLoading: boolean = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CrearUsuarioDialogComponent>,
    private usuariosService: UsuariosService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    // Aseguramos que el diálogo tenga el estilo correcto
    this.dialogRef.addPanelClass(['custom-dialog', 'custom-dark-dialog']);
    
    // Si hay roles y estados en los datos pasados
    if (data && data.roles) {
      this.roles = data.roles;
    }
    if (data && data.estados) {
      this.estados = data.estados;
    }
  }

  ngOnInit(): void {
    this.initForm();
    if (this.roles.length === 0 || this.estados.length === 0) {
      this.loadInitialData();
    } else {
      this.setDefaultValues();
    }
  }

  private initForm(): void {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(50)]],
      apellido: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rol_id: ['', Validators.required],
      estado_id: ['', Validators.required]
    });
  }
  
  private setDefaultValues(): void {
    // Preseleccionar el rol ADMIN o el primero disponible
    if (this.roles.length > 0) {
      const adminRole = this.roles.find((rol: any) => rol.nombre === 'ADMIN');
      if (adminRole) {
        this.form.get('rol_id')?.setValue(adminRole.id);
      } else {
        this.form.get('rol_id')?.setValue(this.roles[0].id);
      }
    }
    
    // Preseleccionar el estado Activo o el primero disponible
    if (this.estados.length > 0) {
      const activoEstado = this.estados.find((estado: any) => estado.nombre === 'Activo');
      if (activoEstado) {
        this.form.get('estado_id')?.setValue(activoEstado.id);
      } else {
        this.form.get('estado_id')?.setValue(this.estados[0].id);
      }
    }
  }

  private loadInitialData(): void {
    this.isLoading = true;
    
    // Cargar roles
    this.usuariosService.getRoles()
      .pipe(
        catchError(error => {
          console.error('Error al cargar roles:', error);
          this.errorMessage = 'No se pudieron cargar los roles';
          return of([]);
        })
      )
      .subscribe(data => {
        this.roles = data;
        // Preseleccionar el primer rol si existe
        if (data.length > 0) {
          const adminRole = data.find((rol: any) => rol.nombre === 'ADMIN');
          if (adminRole) {
            this.form.get('rol_id')?.setValue(adminRole.id);
          } else {
            this.form.get('rol_id')?.setValue(data[0].id);
          }
        }
      });
    
    // Cargar estados
    this.usuariosService.getEstados()
      .pipe(
        catchError(error => {
          console.error('Error al cargar estados:', error);
          this.errorMessage = 'No se pudieron cargar los estados';
          return of([]);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe(data => {
        this.estados = data;
        // Preseleccionar el estado "Activo" si existe
        const activoEstado = data.find((estado: any) => estado.nombre === 'Activo');
        if (activoEstado) {
          this.form.get('estado_id')?.setValue(activoEstado.id);
        } else if (data.length > 0) {
          this.form.get('estado_id')?.setValue(data[0].id);
        }
      });
  }

  guardar(): void {
    if (this.form.invalid) {
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        control?.markAsTouched();
      });
      return;
    }
  
    this.errorMessage = null; // Reset previo
    this.isLoading = true;
    const userData = this.prepareUserData();
  
    this.usuariosService.crearUsuario(userData)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error al crear usuario:', error);
          
          // Obtener mensaje de error para diferentes estructuras
          let mensajeError = this.extractErrorMessage(error);
          
          // Detectar si es un error de correo duplicado
          if (this.isEmailDuplicateError(error, mensajeError)) {
            const errorMsg = 'El correo electrónico ya está registrado en el sistema';
            // Cerrar el diálogo con información de error
            this.dialogRef.close({ error: errorMsg });
          } else {
            const errorMsg = mensajeError || 'No se pudo crear el usuario. Inténtalo nuevamente.';
            this.dialogRef.close({ error: errorMsg });
          }
          
          return of(null);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe(result => {
        if (result !== null) {
          // Éxito - cerrar con true
          this.dialogRef.close(true);
        }
        // Si hay error, ya se manejó en el catchError
      });
  }
  
  // Extraer mensaje de error de diferentes estructuras de respuesta
  private extractErrorMessage(error: HttpErrorResponse): string {
    if (typeof error.error === 'string') {
      return error.error;
    } else if (error.error?.message) {
      return error.error.message;
    } else if (error.error?.error?.message) {
      return error.error.error.message;
    } else if (error.error?.errors && Array.isArray(error.error.errors)) {
      return error.error.errors.map((e: any) => e.message).join(', ');
    } else if (error.message) {
      return error.message;
    }
    return 'Error desconocido';
  }
  
  // Verificar si el error es por correo duplicado
  private isEmailDuplicateError(error: HttpErrorResponse, mensaje: string): boolean {
    // Verificar por código de estado
    if (error.status === 409) {
      return true;
    }
    
    // Verificar por palabras clave en el mensaje
    const keywordsEspanol = ['correo', 'email', 'ya existe', 'ya está registrado', 'duplicado'];
    const keywordsIngles = ['email', 'already exists', 'duplicate', 'in use'];
    
    // Convertir a minúsculas para comparación
    const mensajeLower = mensaje.toLowerCase();
    
    // Verificar si alguna palabra clave está en el mensaje
    return [...keywordsEspanol, ...keywordsIngles].some(keyword => 
      mensajeLower.includes(keyword.toLowerCase())
    );
  }
  
  // Preparar datos del usuario para enviar al servicio
  private prepareUserData(): any {
    const formValue = this.form.value;
    return {
      nombre: formValue.nombre,
      apellido: formValue.apellido,
      email: formValue.email,
      password: formValue.password,
      roles: [{ id: formValue.rol_id }],
      estado: { id: formValue.estado_id }
    };
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}