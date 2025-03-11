import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { AuthService, User } from '@core/services/seguridad/auth.service';
import { CommonModule, AsyncPipe } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { SidebarComponent } from '@shared/components/sidebar/sidebar.component';
import { FooterComponent } from '@shared/components/footer/footer.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    AsyncPipe,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatSidenavModule,
    MatListModule,
    SidebarComponent,
    FooterComponent
  ]
})
export class AppComponent implements OnInit {
  isAuthenticated$: Observable<boolean>;
  sidenavOpened = false;
  currentYear: number = new Date().getFullYear();
  currentUrl: string = '';
  currentUser: User | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
    
    // Suscribirse a los eventos de navegación para actualizar la URL actual
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentUrl = event.urlAfterRedirects;
    });
  }

  ngOnInit(): void {
    // Obtener el usuario actual al inicializar
    this.getCurrentUser();
    
    // Suscribirse a cambios en la autenticación para actualizar el usuario
    this.isAuthenticated$.subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.getCurrentUser();
      } else {
        this.currentUser = null;
      }
    });
  }

  getCurrentUser(): void {
    this.currentUser = this.authService.getCurrentUser();
    console.log('Current user:', this.currentUser);
  }

  toggleSidenav(): void {
    this.sidenavOpened = !this.sidenavOpened;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
  
  // Método para verificar si estamos en la landing page o páginas de autenticación
  isLandingPage(): boolean {
    // Verificar si estamos en landing page o en cualquier ruta de autenticación
    return this.currentUrl === '/landing' || 
           this.currentUrl === '/' || 
           this.currentUrl.startsWith('/auth') ||
           this.currentUrl === '/auth/login';
  }
  
  // Método para obtener el nombre completo del usuario
  getUserFullName(): string {
    if (this.currentUser) {
      return `${this.currentUser.nombre} ${this.currentUser.apellido}`;
    }
    return 'Usuario';
  }
  
  // Método para obtener el email del usuario
  getUserEmail(): string {
    if (this.currentUser) {
      return this.currentUser.email;
    }
    return 'usuario@example.com';
  }
}
