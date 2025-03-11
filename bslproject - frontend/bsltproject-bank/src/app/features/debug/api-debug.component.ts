import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/seguridad/auth.service';
import { API_CONFIG } from '../../core/config/api.config';

@Component({
  selector: 'app-api-debug',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mt-4">
      <h2>API Gateway Debug Tool</h2>
      
      <div class="card mb-4">
        <div class="card-header bg-primary text-white">
          <h5 class="mb-0">Authentication Status</h5>
        </div>
        <div class="card-body">
          @if (isAuthenticated) {
            <div class="alert alert-success">
              <strong>Authenticated</strong>
            </div>
            <div class="mb-3">
              <strong>Token:</strong> 
              <code class="d-block mt-2 p-2 bg-light">{{ tokenPreview }}</code>
            </div>
            <div class="mb-3">
              <strong>User:</strong>
              <pre class="mt-2 p-2 bg-light">{{ userJson }}</pre>
            </div>
          } @else {
            <div class="alert alert-warning">
              <strong>Not Authenticated</strong>
            </div>
          }
        </div>
      </div>

      <div class="card mb-4">
        <div class="card-header bg-primary text-white">
          <h5 class="mb-0">Login Test</h5>
        </div>
        <div class="card-body">
          <div class="mb-3">
            <label for="email" class="form-label">Email:</label>
            <input type="email" [(ngModel)]="loginEmail" class="form-control" id="email" placeholder="email@example.com">
          </div>
          <div class="mb-3">
            <label for="password" class="form-label">Password:</label>
            <input type="password" [(ngModel)]="loginPassword" class="form-control" id="password" placeholder="Password">
          </div>
          <button (click)="testLogin()" class="btn btn-primary" [disabled]="isLoading">
            Test Login
          </button>
        </div>
      </div>

      <div class="card mb-4">
        <div class="card-header bg-primary text-white">
          <h5 class="mb-0">Test API Endpoints</h5>
        </div>
        <div class="card-body">
          <div class="mb-3">
            <label for="endpoint" class="form-label">Endpoint:</label>
            <select [(ngModel)]="selectedEndpoint" class="form-select" id="endpoint">
              <option value="/seguridad/usuarios">Security - Get Users</option>
              <option value="/finanzas/cuentas">Finance - Get Accounts</option>
              <option value="/finanzas/transacciones">Finance - Get Transactions</option>
              <option value="/finanzas/bolsillos">Finance - Get Pockets</option>
            </select>
          </div>
          
          <div class="mb-3">
            <label for="customEndpoint" class="form-label">Custom Endpoint:</label>
            <div class="input-group">
              <span class="input-group-text">http://localhost:7777</span>
              <input type="text" [(ngModel)]="customEndpoint" class="form-control" id="customEndpoint" placeholder="/custom/endpoint">
            </div>
          </div>
          
          <div class="d-flex gap-2">
            <button (click)="testSelectedEndpoint()" class="btn btn-primary">
              Test Selected Endpoint
            </button>
            <button (click)="testCustomEndpoint()" class="btn btn-outline-primary" [disabled]="!customEndpoint">
              Test Custom Endpoint
            </button>
          </div>
        </div>
      </div>

      <div class="card mb-4">
        <div class="card-header bg-primary text-white">
          <h5 class="mb-0">Direct Service Test</h5>
        </div>
        <div class="card-body">
          <div class="mb-3">
            <label for="directService" class="form-label">Service:</label>
            <select [(ngModel)]="selectedService" class="form-select" id="directService">
              <option value="security">Security Service (8080)</option>
              <option value="finance">Finance Service (9999)</option>
            </select>
          </div>
          
          <div class="mb-3">
            <label for="directEndpoint" class="form-label">Endpoint:</label>
            <div class="input-group">
              <span class="input-group-text">
                {{ selectedService === 'security' ? 'http://localhost:8080' : 'http://localhost:9999' }}
              </span>
              <input type="text" [(ngModel)]="directEndpoint" class="form-control" id="directEndpoint" placeholder="/endpoint">
            </div>
          </div>
          
          <button (click)="testDirectService()" class="btn btn-warning" [disabled]="!directEndpoint">
            Test Direct Service
          </button>
        </div>
      </div>

      @if (isLoading) {
        <div class="d-flex justify-content-center my-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      }

      @if (response) {
        <div class="card">
          <div class="card-header bg-success text-white">
            <h5 class="mb-0">Response</h5>
          </div>
          <div class="card-body">
            <pre class="bg-light p-3 rounded">{{ response }}</pre>
          </div>
        </div>
      }

      @if (error) {
        <div class="card">
          <div class="card-header bg-danger text-white">
            <h5 class="mb-0">Error</h5>
          </div>
          <div class="card-body">
            <pre class="bg-light p-3 rounded">{{ error }}</pre>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    pre {
      white-space: pre-wrap;
      word-break: break-all;
    }
    .card {
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
  `]
})
export class ApiDebugComponent implements OnInit {
  isAuthenticated = false;
  tokenPreview = '';
  userJson = '';
  selectedEndpoint = '/seguridad/usuarios';
  customEndpoint = '';
  response: string | null = null;
  error: string | null = null;
  isLoading = false;

  // Login test
  loginEmail = 'admin@example.com';
  loginPassword = 'password';

  // Direct service test
  selectedService = 'security';
  directEndpoint = '/usuarios/login';

  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.checkAuthStatus();
  }

  checkAuthStatus(): void {
    const token = this.authService.getToken();
    const user = this.authService.getCurrentUser();
    
    this.isAuthenticated = !!token;
    
    if (token) {
      this.tokenPreview = token.substring(0, 20) + '...' + token.substring(token.length - 10);
    }
    
    if (user) {
      this.userJson = JSON.stringify(user, null, 2);
    }
  }

  testLogin(): void {
    this.isLoading = true;
    this.response = null;
    this.error = null;
    
    console.log(`Testing login with email: ${this.loginEmail}`);
    
    this.authService.login(this.loginEmail, this.loginPassword).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.response = JSON.stringify(response, null, 2);
        console.log('Login response:', response);
        this.checkAuthStatus(); // Actualizar estado de autenticación
      },
      error: (err) => {
        this.isLoading = false;
        this.error = JSON.stringify(err, null, 2);
        console.error('Login error:', err);
      }
    });
  }

  testSelectedEndpoint(): void {
    this.testEndpoint(this.selectedEndpoint);
  }

  testCustomEndpoint(): void {
    if (this.customEndpoint) {
      this.testEndpoint(this.customEndpoint);
    }
  }

  testEndpoint(endpoint: string): void {
    this.isLoading = true;
    this.response = null;
    this.error = null;
    
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
    
    const url = `${API_CONFIG.API_GATEWAY_URL}${endpoint}`;
    console.log('Testing endpoint:', url);
    console.log('Headers:', headers);
    
    this.http.get(url, { headers }).subscribe({
      next: (data) => {
        this.isLoading = false;
        this.response = JSON.stringify(data, null, 2);
        console.log('Response:', data);
      },
      error: (err) => {
        this.isLoading = false;
        this.error = JSON.stringify(err, null, 2);
        console.error('Error:', err);
      }
    });
  }

  testDirectService(): void {
    this.isLoading = true;
    this.response = null;
    this.error = null;
    
    const baseUrl = this.selectedService === 'security' 
      ? 'http://localhost:8080' 
      : 'http://localhost:9999';
    
    const url = `${baseUrl}${this.directEndpoint}`;
    console.log('Testing direct service:', url);
    
    // Si es el endpoint de login, hacer una solicitud POST
    if (this.directEndpoint.includes('login')) {
      const body = {
        email: this.loginEmail,
        password: this.loginPassword
      };
      
      this.http.post(url, body).subscribe({
        next: (data) => {
          this.isLoading = false;
          this.response = JSON.stringify(data, null, 2);
          console.log('Response:', data);
        },
        error: (err) => {
          this.isLoading = false;
          this.error = JSON.stringify(err, null, 2);
          console.error('Error:', err);
        }
      });
    } else {
      // Para otros endpoints, hacer una solicitud GET
      const token = this.authService.getToken();
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      });
      
      this.http.get(url, { headers }).subscribe({
        next: (data) => {
          this.isLoading = false;
          this.response = JSON.stringify(data, null, 2);
          console.log('Response:', data);
        },
        error: (err) => {
          this.isLoading = false;
          this.error = JSON.stringify(err, null, 2);
          console.error('Error:', err);
        }
      });
    }
  }
}
