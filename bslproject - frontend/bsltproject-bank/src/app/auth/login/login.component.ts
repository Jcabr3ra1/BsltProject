import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/seguridad/auth.service';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatCardModule
  ]
})
export class LoginComponent {
  loginForm: FormGroup;
  hidePassword = true;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.validateForm();
      return;
    }

    const { email, password } = this.loginForm.value;
    this.isLoading = true;
    this.errorMessage = '';

    // Asegurémonos de que email y password están definidos
    if (!email || !password) {
      this.errorMessage = 'Email y contraseña son requeridos';
      this.isLoading = false;
      return;
    }

    console.log('Intentando login con:', { email });

    this.authService.login(email, password)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response) => {
          console.log('Login exitoso');
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('Error de login:', error);
          
          // Mensaje de error más específico basado en el código de error
          if (error.status === 403 || (error.error && error.error.detail && error.error.detail.includes('403'))) {
            this.errorMessage = 'Acceso denegado. Verifica tus credenciales o permisos.';
          } else if (error.status === 500) {
            this.errorMessage = 'Error en el servidor. Por favor, intenta más tarde.';
          } else {
            this.errorMessage = 'Error al iniciar sesión. Por favor, verifica tus credenciales.';
          }
        }
      });
  }

  private validateForm(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      if (control?.errors) {
        if (key === 'email') {
          if (control.errors['required']) {
            this.errorMessage = 'El email es requerido';
          } else if (control.errors['email']) {
            this.errorMessage = 'Ingresa un email válido';
          }
        } else if (key === 'password' && control.errors['required']) {
          this.errorMessage = 'La contraseña es requerida';
        }
      }
    });
  }
}
