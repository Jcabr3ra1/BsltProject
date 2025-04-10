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
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { SidebarService } from './core/services/sidebar.service';

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
    SidebarComponent,
    NavbarComponent
  ]
})
export class AppComponent implements OnInit, OnDestroy {
  isAuthenticated$: Observable<boolean>;
  sidenavOpened = true;
  isSidebarCollapsed = false;
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
  initialNavigation = true;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly sidebarService: SidebarService
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
      
      // Solo verificar token después de la navegación inicial y si no estamos en páginas públicas
      if (!this.initialNavigation && !this.isPublicPage()) {
        this.checkAuth();
      }
      
      this.initialNavigation = false;
    });
    
    this.subscriptions.add(routerSub);
  }

  ngOnInit(): void {
    // Verificar y reparar el formato del token al iniciar la aplicación
    this.authService.verifyAndFixTokenFormat();
    
    // Suscribirse a cambios del usuario actual
    const userSub = this.authService.currentUser.subscribe((user: Usuario | null) => {
      this.currentUser = user;
    });
    
    // Suscribirse a cambios en el estado del sidebar
    const sidebarSub = this.sidebarService.isCollapsed$.subscribe((isCollapsed: boolean) => {
      this.isSidebarCollapsed = isCollapsed;
      this.sidenavOpened = !isCollapsed; // Actualizar sidenavOpened para mantener consistencia
    });
    
    this.subscriptions.add(userSub);
    this.subscriptions.add(sidebarSub);
    
    // Inicializamos currentUrl con la URL actual
    this.currentUrl = window.location.pathname;
    
    // No hacemos verificación de token en la inicialización para permitir que se muestre la landing page
  }
  
  ngOnDestroy(): void {
    // Limpiar todas las suscripciones al destruir el componente
    this.subscriptions.unsubscribe();
  }

  /**
   * Verifica la autenticación
   */
  private checkAuth(): void {
    const token = localStorage.getItem('token');
    if (token) {
      console.log('Token encontrado en localStorage, verificando...');
      
      const authSub = this.authService.verifyToken().subscribe({
        next: (isValid: boolean) => {
          console.log('Resultado de verificación de token:', isValid);
          if (!isValid && !this.isPublicPage()) {
            console.log('Token inválido, redirigiendo a login');
            this.router.navigate(['/auth/login']);
          }
        },
        error: (error: Error) => {
          console.error('Error al verificar token:', error);
          if (!this.isPublicPage()) {
            this.router.navigate(['/auth/login']);
          }
        }
      });
      
      this.subscriptions.add(authSub);
    } else if (!this.isPublicPage()) {
      console.log('No hay token, redirigiendo a login');
      this.router.navigate(['/auth/login']);
    }
  }

  toggleSidenav(): void {
    this.sidebarService.toggleSidebar();
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
  
  // Check if we're on a public page (landing or auth pages)
  isPublicPage(): boolean {
    // Considerar todas las rutas públicas
    return this.currentUrl === '/landing' || 
           this.currentUrl === '/' || 
           this.currentUrl.startsWith('/auth') ||
           this.currentUrl === '/home' ||
           this.currentUrl === '/diagnostico';
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