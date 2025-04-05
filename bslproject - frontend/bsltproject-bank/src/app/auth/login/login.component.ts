import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AuthService } from '@core/services/seguridad/auth.service';
import { LoginRequest } from '@core/models/seguridad/usuario.model';
import { Subject, takeUntil } from 'rxjs';

/**
 * Componente de inicio de sesión
 * Maneja la autenticación de usuarios mediante formulario
 */
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ]
})
export class LoginComponent implements OnInit, OnDestroy {
  /** Formulario de inicio de sesión */
  loginForm: FormGroup;
  
  /** Indicador de carga */
  loading = false;
  
  /** Control de visibilidad de la contraseña */
  hidePassword = true;
  
  /** Mensaje de error */
  errorMessage: string | null = null;
  
  /** Subject para gestionar la cancelación de suscripciones */
  private destroy$ = new Subject<void>();

  /**
   * Constructor del componente
   */
  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly snackBar: MatSnackBar
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  /**
   * Inicialización del componente
   * Verifica si ya existe una sesión activa
   */
  ngOnInit(): void {
    // Verificar si ya hay una sesión activa
    this.authService.verifyToken()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (isValid) => {
          if (isValid) {
            this.router.navigate(['/dashboard']);
          }
        },
        error: () => {
          // Token inválido o no existe, el usuario debe iniciar sesión
          this.authService.logout();
        }
      });
  }
  
  /**
   * Limpieza al destruir el componente
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Maneja el envío del formulario de inicio de sesión
   */
  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      this.errorMessage = null;

      const credentials: LoginRequest = {
        email: this.loginForm.get('email')?.value,
        password: this.loginForm.get('password')?.value
      };

      this.authService.login(credentials)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loading = false;
            this.router.navigate(['/dashboard']);
          },
          error: (error) => {
            this.loading = false;
            this.showErrorMessage('Error al iniciar sesión: ' + error.message);
          }
        });
    } else {
      this.markFormGroupTouched(this.loginForm);
    }
  }

  /**
   * Obtiene el mensaje de error para un control específico
   * @param controlName Nombre del control del formulario
   * @returns Mensaje de error o cadena vacía
   */
  getErrorMessage(controlName: string): string {
    const control = this.loginForm.get(controlName);
    
    if (!control || !control.errors || !control.touched) {
      return '';
    }
    
    if (control.hasError('required')) {
      return 'Este campo es obligatorio';
    }
    
    if (controlName === 'email' && control.hasError('email')) {
      return 'Por favor ingrese un correo electrónico válido';
    }
    
    if (controlName === 'password' && control.hasError('minlength')) {
      const minLength = control.getError('minlength').requiredLength;
      return `La contraseña debe tener al menos ${minLength} caracteres`;
    }
    
    return '';
  }

  /**
   * Marca todos los controles del formulario como tocados para mostrar validaciones
   * @param formGroup Grupo de formulario a marcar
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  /**
   * Muestra un mensaje de error en un snackbar
   * @param message Mensaje a mostrar
   */
  private showErrorMessage(message: string): void {
    this.errorMessage = message;
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}
