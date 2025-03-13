import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';

import { AuthService } from '../../core/services/seguridad/auth.service';
import { RegistroRequest } from '../../core/models/seguridad/usuario.model';
import { passwordMatchValidator } from '../../core/validators/password-match.validator';

/**
 * RegisterComponent handles user registration functionality
 * Uses standalone component architecture and modern Angular control flow
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
    MatFormFieldModule
  ]
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;
  hidePassword: boolean = true;
  hideConfirmPassword: boolean = true;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {
    this.registerForm = this.formBuilder.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: passwordMatchValidator
    });
  }

  /**
   * Toggle password visibility
   */
  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  /**
   * Toggle confirm password visibility
   */
  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }

  /**
   * Handle form submission
   * Sends registration request to API Gateway
   */
  onSubmit(): void {
    if (this.registerForm.invalid) {
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

    console.log('Registering user:', { ...userData, password: '[REDACTED]' });

    this.authService.register(userData).subscribe({
      next: () => {
        console.log('Registration successful');
        this.router.navigate(['/auth/login'], { 
          queryParams: { registered: 'true' } 
        });
      },
      error: (error) => {
        console.error('Registration error:', error);
        this.errorMessage = error.message || 'Error al registrar el usuario';
        this.isLoading = false;
      }
    });
  }
}
