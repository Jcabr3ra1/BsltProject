import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.scss']
})
export class RegisterFormComponent {
  registerForm: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;
  isLoading = false;
  errorMessage: string | null = null;
  
  // Beneficios mostrados en el formulario
  benefits = [
    'Sin comisiones ocultas',
    'Atención 24/7',
    'Transferencias gratuitas'
  ];

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.registerForm = this.fb.group(
      {
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [
          Validators.required, 
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-zA-Z])(?=.*[0-9])/)
        ]],
        confirmPassword: ['', Validators.required]
      },
      {
        validators: this.passwordsMatch
      }
    );
  }

  passwordsMatch(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  getErrorMessage(field: string): string {
    const control = this.registerForm.get(field);
    if (control?.hasError('required')) return 'Este campo es obligatorio';
    if (control?.hasError('email')) return 'Correo inválido';
    if (control?.hasError('minlength')) return 'Mínimo 8 caracteres';
    if (control?.hasError('pattern')) return 'Debe incluir letras y números';
    return '';
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPasswordVisibility() {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }

  onSubmit(): void {
    this.errorMessage = null;
  
    if (this.registerForm.valid) {
      this.isLoading = true;
  
      const { firstName, lastName, email, password } = this.registerForm.value;
  
      this.authService.register({
        nombre: firstName,
        apellido: lastName,
        email,
        password
      }).subscribe({
        next: () => {
          this.isLoading = false;
          this.registerForm.reset();
  
          // Redirige automáticamente al login después del registro
          this.router.navigate(['/auth/login']);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err?.error?.detail || 'Error al registrar usuario';
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}