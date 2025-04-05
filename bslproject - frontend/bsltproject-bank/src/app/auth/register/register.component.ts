import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AuthService } from '@core/services/seguridad/auth.service';
import { RegistroRequest } from '@core/models/seguridad/usuario.model';
import { passwordMatchValidator } from '@core/validators/password-match.validator';
import { passwordStrengthValidator } from '@core/validators/password-strength.validator';
import { Subject, takeUntil } from 'rxjs';

/**
 * Componente de registro de usuarios
 * Maneja la creación de nuevas cuentas de usuario
 * Utiliza arquitectura de componentes standalone y control de flujo moderno de Angular
 */
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatSnackBarModule
  ]
})
export class RegisterComponent implements OnDestroy {
  /** Formulario de registro */
  registerForm!: FormGroup;
  
  /** Mensaje de error */
  errorMessage: string = '';
  
  /** Indicador de carga */
  isLoading: boolean = false;
  
  /** Control de visibilidad de la contraseña */
  hidePassword: boolean = true;
  
  /** Control de visibilidad de la confirmación de contraseña */
  hideConfirmPassword: boolean = true;
  
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
    this.initForm();
  }
  
  /**
   * Inicializa el formulario de registro con validaciones
   */
  private initForm(): void {
    this.registerForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      password: ['', [
        Validators.required, 
        Validators.minLength(8),
        passwordStrengthValidator()
      ]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: passwordMatchValidator
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
   * Alterna la visibilidad de la contraseña
   */
  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  /**
   * Alterna la visibilidad de la confirmación de contraseña
   */
  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }

  /**
   * Obtiene el mensaje de error para un control específico
   * @param controlName Nombre del control del formulario
   * @returns Mensaje de error o cadena vacía
   */
  getErrorMessage(controlName: string): string {
    const control = this.registerForm.get(controlName);
    
    if (!control || !control.errors || !control.touched) {
      return '';
    }
    
    if (control.hasError('required')) {
      return 'Este campo es obligatorio';
    }
    
    if (control.hasError('email')) {
      return 'Ingresa un email válido';
    }
    
    if (control.hasError('minlength')) {
      const minLength = control.getError('minlength').requiredLength;
      return `Debe tener al menos ${minLength} caracteres`;
    }
    
    if (control.hasError('maxlength')) {
      const maxLength = control.getError('maxlength').requiredLength;
      return `Excede el máximo de ${maxLength} caracteres permitidos`;
    }
    
    if (control.hasError('passwordStrength')) {
      return 'La contraseña debe incluir mayúsculas, minúsculas y números';
    }
    
    return '';
  }

  /**
   * Maneja el envío del formulario de registro
   * Envía la solicitud de registro al API Gateway
   */
  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.markFormGroupTouched(this.registerForm);
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { firstName, lastName, email, password } = this.registerForm.value;
    
    const userData: RegistroRequest = {
      nombre: firstName,
      apellido: lastName,
      email,
      password
    };

    this.authService.register(userData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.showSuccessMessage('Registro exitoso. Ahora puedes iniciar sesión.');
          this.router.navigate(['/auth/login'], { 
            queryParams: { registered: 'true' } 
          });
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message || 'Error al registrar el usuario';
          this.showErrorMessage(this.errorMessage);
        }
      });
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
   * Muestra un mensaje de éxito en un snackbar
   * @param message Mensaje a mostrar
   */
  private showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: ['success-snackbar']
    });
  }
  
  /**
   * Muestra un mensaje de error en un snackbar
   * @param message Mensaje a mostrar
   */
  private showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}
