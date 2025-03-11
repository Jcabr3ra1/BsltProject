import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { API_CONFIG } from '../../core/config/api.config';

@Component({
  selector: 'app-login-debug',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    HttpClientModule
  ],
  template: `
    <div class="container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Depuración de Autenticación</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="login()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" type="email">
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Contraseña</mat-label>
              <input matInput formControlName="password" type="password">
            </mat-form-field>
            
            <button mat-raised-button color="primary" type="submit" [disabled]="loginForm.invalid">
              Iniciar Sesión
            </button>
          </form>
          
          <div *ngIf="token" class="token-section">
            <h3>Token obtenido:</h3>
            <div class="token-display">{{ token }}</div>
            
            <h3>Acciones de prueba:</h3>
            <button mat-raised-button color="accent" (click)="testCuentas()">
              Probar /finanzas/cuentas
            </button>
            <button mat-raised-button color="accent" (click)="testUsuarios()">
              Probar /seguridad/usuarios
            </button>
            
            <div *ngIf="responseData" class="response-section">
              <h3>Respuesta:</h3>
              <pre>{{ responseData | json }}</pre>
            </div>
            
            <div *ngIf="errorData" class="error-section">
              <h3>Error:</h3>
              <pre>{{ errorData | json }}</pre>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .container {
      max-width: 800px;
      margin: 20px auto;
      padding: 20px;
    }
    .full-width {
      width: 100%;
      margin-bottom: 15px;
    }
    .token-section {
      margin-top: 30px;
      padding: 15px;
      background-color: #f5f5f5;
      border-radius: 4px;
    }
    .token-display {
      word-break: break-all;
      background-color: #e0e0e0;
      padding: 10px;
      border-radius: 4px;
      margin-bottom: 20px;
      font-family: monospace;
    }
    .response-section, .error-section {
      margin-top: 20px;
      padding: 15px;
      border-radius: 4px;
    }
    .response-section {
      background-color: #e8f5e9;
    }
    .error-section {
      background-color: #ffebee;
    }
    button {
      margin-right: 10px;
      margin-bottom: 10px;
    }
    pre {
      white-space: pre-wrap;
      word-wrap: break-word;
      background-color: #f8f8f8;
      padding: 10px;
      border-radius: 4px;
      max-height: 300px;
      overflow: auto;
    }
  `]
})
export class LoginDebugComponent {
  loginForm: FormGroup;
  token: string | null = null;
  responseData: any = null;
  errorData: any = null;
  
  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.loginForm = this.fb.group({
      email: ['admin@example.com', [Validators.required, Validators.email]],
      password: ['admin123', Validators.required]
    });
    
    // Verificar si ya hay un token almacenado
    this.token = localStorage.getItem('token');
    console.log('Token almacenado:', this.token);
  }
  
  login() {
    if (this.loginForm.valid) {
      const credentials = this.loginForm.value;
      const loginUrl = `${API_CONFIG.SECURITY_API.BASE_URL}${API_CONFIG.SECURITY_API.AUTH.LOGIN}`;
      
      console.log('Intentando login en:', loginUrl);
      console.log('Con credenciales:', credentials);
      
      this.http.post(loginUrl, credentials).subscribe({
        next: (response: any) => {
          console.log('Respuesta de login:', response);
          this.token = response.token;
          
          // Guardar token en localStorage
          localStorage.setItem('token', response.token);
          localStorage.setItem('refreshToken', response.refreshToken || '');
          localStorage.setItem('user', JSON.stringify(response.user));
          
          this.responseData = response;
          this.errorData = null;
        },
        error: (error) => {
          console.error('Error en login:', error);
          this.errorData = error;
          this.responseData = null;
        }
      });
    }
  }
  
  testCuentas() {
    this.makeAuthenticatedRequest(`${API_CONFIG.FINANCE_API.BASE_URL}${API_CONFIG.FINANCE_API.ACCOUNTS.BASE}`);
  }
  
  testUsuarios() {
    this.makeAuthenticatedRequest(`${API_CONFIG.SECURITY_API.BASE_URL}/seguridad/usuarios`);
  }
  
  private makeAuthenticatedRequest(url: string) {
    console.log('Realizando solicitud autenticada a:', url);
    console.log('Token utilizado:', this.token);
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`
    });
    
    console.log('Headers:', headers);
    
    this.http.get(url, { headers }).subscribe({
      next: (response) => {
        console.log('Respuesta exitosa:', response);
        this.responseData = response;
        this.errorData = null;
      },
      error: (error) => {
        console.error('Error en solicitud:', error);
        this.errorData = error;
        this.responseData = null;
      }
    });
  }
}
