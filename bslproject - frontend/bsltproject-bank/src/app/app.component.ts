import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '@core/services/seguridad/auth.service';
import { Usuario } from '@core/models/seguridad/usuario.model';
import { CommonModule, AsyncPipe } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { SidebarComponent } from '@shared/components/sidebar/sidebar.component';
import { FooterComponent } from '@shared/components/footer/footer.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
    MatBadgeModule,
    FooterComponent,
    SidebarComponent
  ]
})
export class AppComponent implements OnInit, OnDestroy {
  isAuthenticated$: Observable<boolean>;
  sidenavOpened = true;
  currentYear: number = new Date().getFullYear();
  currentUrl: string = '';
  currentUser: Usuario | null = null;
  private subscriptions: Subscription = new Subscription();
  userMenuItems = [
    { icon: 'person', text: 'Mi Perfil', action: () => this.navigateToProfile() },
    { icon: 'settings', text: 'Configuración', action: () => this.navigateToSettings() },
    { icon: 'exit_to_app', text: 'Cerrar Sesión', action: () => this.logout() }
  ];
  notifications = [
    { icon: 'account_balance', text: 'Nueva transacción recibida', time: 'Hace 5 minutos' },
    { icon: 'security', text: 'Inicio de sesión desde un nuevo dispositivo', time: 'Hace 2 horas' },
    { icon: 'credit_card', text: 'Su tarjeta ha sido activada', time: 'Ayer' }
  ];

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
    
    // Si estamos en login/register, limpiamos tokens para evitar redirecciones automáticas
    if (window.location.href.includes('/auth/login') || window.location.href.includes('/auth/register')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    
    // Subscribe to navigation events to update current URL
    const routerSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentUrl = event.urlAfterRedirects;
    });
    
    this.subscriptions.add(routerSub);
  }

  ngOnInit(): void {
    // Suscribirse a cambios del usuario actual
    const userSub = this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
    });
    
    this.subscriptions.add(userSub);
    
    // Solo verificar token si no estamos en login/register
    if (!this.isLandingPage()) {
      this.checkInitialAuth();
    }
  }
  
  ngOnDestroy(): void {
    // Limpiar todas las suscripciones al destruir el componente
    this.subscriptions.unsubscribe();
  }

  /**
   * Verifica la autenticación inicial una sola vez
   */
  private checkInitialAuth(): void {
    const token = localStorage.getItem('token');
    if (token) {
      console.log('Token encontrado en localStorage, verificando...');
      
      const authSub = this.authService.verifyToken().subscribe({
        next: (isValid) => {
          console.log('Resultado de verificación de token:', isValid);
          if (!isValid && !this.isLandingPage()) {
            console.log('Token inválido, redirigiendo a login');
            this.router.navigate(['/auth/login']);
          }
        },
        error: (error) => {
          console.error('Error al verificar token inicial:', error);
          if (!this.isLandingPage()) {
            this.router.navigate(['/auth/login']);
          }
        }
      });
      
      this.subscriptions.add(authSub);
    } else if (!this.isLandingPage()) {
      console.log('No hay token, redirigiendo a login');
      this.router.navigate(['/auth/login']);
    }
  }

  toggleSidenav(): void {
    this.sidenavOpened = !this.sidenavOpened;
  }

  logout(): void {
    const logoutSub = this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/landing']);
      },
      error: (error) => {
        console.error('Error al cerrar sesión:', error);
        // En caso de error, igualmente redirigimos al landing
        this.router.navigate(['/landing']);
      }
    });
    
    this.subscriptions.add(logoutSub);
  }
  
  // Check if we're on the landing page or auth pages
  isLandingPage(): boolean {
    return this.currentUrl === '/landing' || 
           this.currentUrl === '/' || 
           this.currentUrl.startsWith('/auth');
  }
  
  // Get user's full name
  getUserFullName(): string {
    if (this.currentUser) {
      return this.currentUser.nombre || 'Usuario';
    }
    return 'Usuario';
  }
  
  // Get user's email
  getUserEmail(): string {
    if (this.currentUser) {
      return this.currentUser.email || '';
    }
    return '';
  }

  navigateToProfile() {
    this.router.navigate(['/profile']);
  }

  navigateToSettings() {
    this.router.navigate(['/settings']);
  }
}