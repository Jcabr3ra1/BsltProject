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
    console.log('LoginComponent - onSubmit called');
    console.log('LoginComponent - Form value:', this.loginForm.value);
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      console.log('Attempting login with:', this.loginForm.value);
      
      const { email, password } = this.loginForm.value;
      
      this.authService.login(email, password).subscribe({
        next: (response) => {
          console.log('Login successful:', response);
          this.isLoading = false;
          
          // Verify authentication state before navigation
          console.log('Checking authentication state...');
          const isAuthenticated = this.authService.isAuthenticated();
          console.log('Authentication state:', isAuthenticated);
          
          if (isAuthenticated) {
            console.log('Navigating to dashboard');
            this.router.navigate(['/dashboard'])
              .then(success => {
                if (!success) {
                  console.error('Navigation failed');
                  this.errorMessage = 'Error al redireccionar. Intente nuevamente.';
                }
              })
              .catch(err => {
                console.error('Navigation error:', err);
                this.errorMessage = 'Error al redireccionar. Intente nuevamente.';
              });
          } else {
            console.error('Authentication state not updated');
            this.errorMessage = 'Error en la autenticación. Intente nuevamente.';
          }
        },
        error: (error) => {
          console.error('Login error:', error);
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Error al iniciar sesión. Intente nuevamente.';
        }
      });
    } else {
      console.log('Form is invalid');
      Object.keys(this.loginForm.controls).forEach(key => {
        const control = this.loginForm.get(key);
        control?.markAsTouched();
      });
    }
  }
}
