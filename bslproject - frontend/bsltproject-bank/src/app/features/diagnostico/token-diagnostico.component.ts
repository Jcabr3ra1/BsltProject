import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '@environments/environment';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-token-diagnostico',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    HttpClientModule
  ],
  template: `
    <div class="container-fluid py-4">
      <div class="row">
        <div class="col-12">
          <mat-card class="mat-elevation-z4">
            <mat-card-header>
              <mat-card-title>Diagnóstico de Token</mat-card-title>
              <mat-card-subtitle>Herramienta para verificar el estado del token y la autenticación</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="my-3">
                <h3>Token en localStorage</h3>
                <pre class="token-display">{{ tokenInfo }}</pre>
              </div>
              
              <mat-divider></mat-divider>
              
              <div class="my-3">
                <h3>Contenido decodificado del token</h3>
                <pre class="token-display">{{ decodedToken }}</pre>
              </div>
              
              <mat-divider></mat-divider>
              
              <div class="my-3">
                <h3>Prueba de endpoints</h3>
                <div class="d-flex flex-wrap gap-2">
                  <button mat-raised-button color="primary" (click)="testEndpoint('/finanzas/tipos-movimiento')">
                    Probar /tipos-movimiento
                  </button>
                  <button mat-raised-button color="accent" (click)="testEndpoint('/finanzas/bolsillos')">
                    Probar /bolsillos
                  </button>
                  <button mat-raised-button color="warn" (click)="testEndpoint('/finanzas/cuentas')">
                    Probar /cuentas
                  </button>
                </div>
                
                <div class="mt-3" *ngIf="endpointResult">
                  <h4>Resultado:</h4>
                  <pre class="endpoint-result">{{ endpointResult }}</pre>
                </div>
              </div>
              
              <mat-divider></mat-divider>
              
              <div class="my-3">
                <h3>Acciones</h3>
                <div class="d-flex flex-wrap gap-2">
                  <button mat-raised-button color="primary" (click)="refreshTokenInfo()">
                    <mat-icon>refresh</mat-icon> Actualizar información
                  </button>
                  <button mat-raised-button color="warn" (click)="clearToken()">
                    <mat-icon>delete</mat-icon> Borrar token
                  </button>
                  <button mat-raised-button color="accent" (click)="fixToken()">
                    <mat-icon>build</mat-icon> Reparar formato del token
                  </button>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .token-display, .endpoint-result {
      background-color: #f5f5f5;
      padding: 10px;
      border-radius: 4px;
      max-height: 200px;
      overflow: auto;
      white-space: pre-wrap;
      word-break: break-all;
    }
    .gap-2 {
      gap: 0.5rem;
    }
  `]
})
export class TokenDiagnosticoComponent implements OnInit {
  tokenInfo: string = 'Cargando...';
  decodedToken: string = 'Cargando...';
  endpointResult: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.refreshTokenInfo();
  }

  refreshTokenInfo(): void {
    const token = localStorage.getItem('token');
    
    if (!token) {
      this.tokenInfo = 'No hay token almacenado en localStorage';
      this.decodedToken = 'No hay token para decodificar';
      return;
    }
    
    this.tokenInfo = `Token: ${token}`;
    
    try {
      // Extraer el token sin el prefijo Bearer si existe
      const tokenValue = token.startsWith('Bearer ') ? token.substring(7) : token;
      const tokenParts = tokenValue.split('.');
      
      if (tokenParts.length !== 3) {
        this.decodedToken = 'Formato de token inválido (no es un JWT válido)';
        return;
      }
      
      const payload = JSON.parse(atob(tokenParts[1]));
      this.decodedToken = JSON.stringify(payload, null, 2);
    } catch (e) {
      this.decodedToken = `Error al decodificar el token: ${e}`;
    }
  }

  testEndpoint(endpoint: string): void {
    this.endpointResult = 'Probando endpoint...';
    
    this.http.get(`${environment.apiGatewayUrl}${endpoint}`)
      .pipe(
        catchError(error => {
          console.error(`Error al probar endpoint ${endpoint}:`, error);
          return of({ error: error.message, status: error.status, statusText: error.statusText });
        })
      )
      .subscribe(result => {
        this.endpointResult = JSON.stringify(result, null, 2);
      });
  }

  clearToken(): void {
    localStorage.removeItem('token');
    this.refreshTokenInfo();
    this.endpointResult = 'Token eliminado de localStorage';
  }

  fixToken(): void {
    const token = localStorage.getItem('token');
    
    if (!token) {
      this.endpointResult = 'No hay token para reparar';
      return;
    }
    
    // Asegurarse de que el token tenga el formato correcto
    const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    localStorage.setItem('token', formattedToken);
    
    this.refreshTokenInfo();
    this.endpointResult = 'Token reparado y actualizado en localStorage';
  }
}
