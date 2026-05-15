import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
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
import { of, Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Rol } from '../../../../../../../core/models/rol.model';
import { Estado } from '../../../../../../../core/models/estado.model';

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
  styleUrls: ['./crear-usuario-dialog.component.css']
})
export class CrearUsuarioDialogComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  roles: Rol[] = [];
  estados: Estado[] = [];
  hidePassword: boolean = true;
  isLoading: boolean = false;
  errorMessage: string | null = null;
  passwordStrength: number = 0;
  private passwordSub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CrearUsuarioDialogComponent>,
    private usuariosService: UsuariosService,
    @Inject(MAT_DIALOG_DATA) public data: { roles: Rol[]; estados: Estado[] }
  ) {
    this.dialogRef.addPanelClass(['custom-dialog', 'custom-dark-dialog']);
    
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

  ngOnDestroy(): void {
    this.passwordSub?.unsubscribe();
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

    this.passwordSub = this.form.get('password')?.valueChanges.subscribe(value => {
      this.updatePasswordStrength(value);
    });
  }
  
  private setDefaultValues(): void {
    if (this.roles.length > 0) {
      const adminRole = this.roles.find((rol: Rol) => rol.nombre === 'ADMIN');
      if (adminRole) {
        this.form.get('rol_id')?.setValue(adminRole.id);
      } else {
        this.form.get('rol_id')?.setValue(this.roles[0].id);
      }
    }
    
    if (this.estados.length > 0) {
      const activoEstado = this.estados.find((estado: Estado) => estado.nombre === 'Activo');
      if (activoEstado) {
        this.form.get('estado_id')?.setValue(activoEstado.id);
      } else {
        this.form.get('estado_id')?.setValue(this.estados[0].id);
      }
    }
  }

  
  updatePasswordStrength(password: string): void {
    if (!password) {
      this.passwordStrength = 0;
      return;
    }
    
    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;
    
    let score = 0;
    if (hasLowerCase && hasUpperCase) score++;
    if (hasNumber) score++;
    if (hasSpecialChar) score++;
    if (isLongEnough) score++;
    
    if (score >= 3) {
      this.passwordStrength = 3; // Fuerte
    } else if (score >= 2) {
      this.passwordStrength = 2; // Medio
    } else {
      this.passwordStrength = 1; // Débil
    }
  }
  
  
  getPasswordStrengthText(): string {
    switch (this.passwordStrength) {
      case 1: return 'Débil';
      case 2: return 'Media';
      case 3: return 'Fuerte';
      default: return '';
    }
  }

  private loadInitialData(): void {
    this.isLoading = true;
    
    this.usuariosService.getRoles()
      .pipe(
        catchError(error => {
          this.errorMessage = 'No se pudieron cargar los roles';
          return of([]);
        })
      )
      .subscribe(data => {
        this.roles = data;
        if (data.length > 0) {
          const adminRole = data.find((rol: Rol) => rol.nombre === 'ADMIN');
          if (adminRole) {
            this.form.get('rol_id')?.setValue(adminRole.id);
          } else {
            this.form.get('rol_id')?.setValue(data[0].id);
          }
        }
      });
    
    this.usuariosService.getEstados()
      .pipe(
        catchError(error => {
          this.errorMessage = 'No se pudieron cargar los estados';
          return of([]);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe(data => {
        this.estados = data;
        const activoEstado = data.find((estado: Estado) => estado.nombre === 'Activo');
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
          let mensajeError = this.extractErrorMessage(error);
          if (this.isEmailDuplicateError(error, mensajeError)) {
            const errorMsg = 'El correo electrónico ya está registrado en el sistema';
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
          this.dialogRef.close(true);
        }
      });
  }
  
  private extractErrorMessage(error: HttpErrorResponse): string {
    if (typeof error.error === 'string') {
      return error.error;
    } else if (error.error?.message) {
      return error.error.message;
    } else if (error.error?.error?.message) {
      return error.error.error.message;
    } else if (error.error?.errors && Array.isArray(error.error.errors)) {
      return error.error.errors.map((e: { message: string }) => e.message).join(', ');
    } else if (error.message) {
      return error.message;
    }
    return 'Error desconocido';
  }
  
  private isEmailDuplicateError(error: HttpErrorResponse, mensaje: string): boolean {
    if (error.status === 409 || error.status === 400) {
      return true;
    }
    
    const keywordsEspanol = ['correo', 'email', 'ya existe', 'ya está registrado', 'duplicado'];
    const keywordsIngles = ['email', 'already exists', 'duplicate', 'in use'];
    
    const mensajeLower = mensaje.toLowerCase();
    
    const found = [...keywordsEspanol, ...keywordsIngles].some(keyword => 
      mensajeLower.includes(keyword.toLowerCase())
    );
    
    return found;
  }
  
  private prepareUserData(): { nombre: string; apellido: string; email: string; password: string; roles: {id: string}[]; estado: {id: string} } {
    const formValue = this.form.value;
    return {
      nombre: formValue.nombre.trim(),
      apellido: formValue.apellido.trim(),
      email: formValue.email.trim().toLowerCase(),
      password: formValue.password,
      roles: [{ id: formValue.rol_id }],
      estado: { id: formValue.estado_id }
    };
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}