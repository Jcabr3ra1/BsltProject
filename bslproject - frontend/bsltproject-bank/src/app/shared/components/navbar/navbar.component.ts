import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '@core/services/seguridad/auth.service';
import { Usuario } from '@core/models/seguridad/usuario.model';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { SidebarService } from '@core/services/sidebar.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    MatBadgeModule,
    MatTooltipModule
  ]
})
export class NavbarComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  userName = '';
  userEmail = '';
  userInitials = '';
  currentUser: Usuario | null = null;
  isAuthenticated$: Observable<boolean>;
  isSidebarCollapsed = false;
  notifications: { icon: string; text: string; time: string }[] = [
    { icon: 'account_balance', text: 'Nueva transacción recibida', time: 'Hace 5 minutos' },
    { icon: 'security', text: 'Inicio de sesión desde un nuevo dispositivo', time: 'Hace 2 horas' },
    { icon: 'credit_card', text: 'Su tarjeta ha sido activada', time: 'Ayer' }
  ];
  
  private subscriptions: Subscription = new Subscription();

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly sidebarService: SidebarService
  ) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
    
    // Suscribirse a cambios del estado del sidebar
    const sidebarSub = this.sidebarService.isCollapsed$.subscribe(isCollapsed => {
      this.isSidebarCollapsed = isCollapsed;
    });
    
    // Suscribirse a cambios del usuario actual
    const userSub = this.authService.currentUser.subscribe((user: Usuario | null) => {
      this.currentUser = user;
      this.isAuthenticated = !!user;
      if (user) {
        this.userName = user.nombre || 'Usuario';
        this.userEmail = user.email || '';
        this.userInitials = this.userName.charAt(0).toUpperCase();
      } else {
        this.userName = 'Usuario';
        this.userEmail = '';
        this.userInitials = 'U';
      }
    });
    
    this.subscriptions.add(userSub);
    this.subscriptions.add(sidebarSub);
  }

  ngOnInit(): void {
    // Verificar y reparar el formato del token al iniciar el componente
    this.authService.verifyAndFixTokenFormat();
  }
  
  ngOnDestroy(): void {
    // Limpiar todas las suscripciones al destruir el componente
    this.subscriptions.unsubscribe();
  }

  logout() {
    const logoutSub = this.authService.logout().subscribe({
      next: () => {
        console.log('Logout exitoso');
        this.router.navigate(['/landing']);
      },
      error: (error: Error) => {
        console.error('Error en logout:', error);
        // En caso de error, igualmente redirigimos al landing
        this.router.navigate(['/landing']);
      }
    });
    
    this.subscriptions.add(logoutSub);
  }
  
  // Obtener el nombre completo del usuario
  getUserFullName(): string {
    if (this.currentUser) {
      return `${this.currentUser.nombre || ''} ${this.currentUser.apellido || ''}`.trim() || 'Usuario';
    }
    return 'Usuario';
  }
  
  // Navegar al perfil del usuario
  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }
  
  // Navegar a la configuración
  navigateToSettings(): void {
    this.router.navigate(['/settings']);
  }
  
  // Alternar el estado del sidebar
  toggleSidebar(): void {
    this.sidebarService.toggleSidebar();
  }
}
