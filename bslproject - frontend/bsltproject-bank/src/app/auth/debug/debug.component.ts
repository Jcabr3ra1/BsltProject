import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { API_CONFIG } from '../../core/config/api.config';
import { AuthService } from '../../core/services/seguridad/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-debug',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatListModule
  ],
  templateUrl: './debug.component.html',
  styleUrls: ['./debug.component.scss']
})
export class DebugComponent implements OnInit {
  token: string | null = null;
  user: any = null;
  tokenInfo: any = null;
  apiResponses: { endpoint: string, status: string, data?: any, error?: any }[] = [];
  
  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadAuthInfo();
  }

  loadAuthInfo(): void {
    this.token = this.authService.getToken();
    this.user = this.authService.getCurrentUser();
    
    if (this.token) {
      try {
        // Decodificar el token JWT (solo la parte de payload)
        const tokenParts = this.token.split('.');
        if (tokenParts.length === 3) {
          const payload = tokenParts[1];
          const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          
          this.tokenInfo = JSON.parse(jsonPayload);
        }
      } catch (e) {
        console.error('Error al decodificar el token:', e);
      }
    }
  }

  testEndpoint(endpoint: string): void {
    const url = endpoint.startsWith('http') ? endpoint : `${API_CONFIG.API_GATEWAY_URL}${endpoint}`;
    console.log(`Probando endpoint: ${url}`);
    
    // Asegurarse de que el token no tenga el prefijo "Bearer" duplicado
    const tokenValue = this.token || '';
    const authHeader = tokenValue.startsWith('Bearer ') ? tokenValue : `Bearer ${tokenValue}`;
    
    const headers = new HttpHeaders({
      'Authorization': authHeader,
      'Content-Type': 'application/json'
    });
    
    console.log('Headers de la solicitud:', {
      'Authorization': authHeader ? 'Bearer [TOKEN]' : '',
      'Content-Type': 'application/json'
    });
    
    this.http.get(url, { headers }).subscribe({
      next: (response) => {
        console.log(`Respuesta de ${endpoint}:`, response);
        this.apiResponses.unshift({
          endpoint,
          status: 'Éxito',
          data: response
        });
      },
      error: (error) => {
        console.error(`Error en ${endpoint}:`, error);
        this.apiResponses.unshift({
          endpoint,
          status: `Error ${error.status}: ${error.statusText}`,
          error: error.error
        });
      }
    });
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.loadAuthInfo(); // Actualizar la información de autenticación
    });
  }

  login(): void {
    this.router.navigate(['/auth/login']);
  }

  clearResponses(): void {
    this.apiResponses = [];
  }

  // Función para el trackBy en el ngFor
  trackResponse(index: number, item: any): string {
    return item.endpoint;
  }
}
