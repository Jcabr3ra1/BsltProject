import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
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
  currentUser: Usuario | null = null;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
    
    // Subscribe to navigation events to update current URL
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentUrl = event.urlAfterRedirects;
    });
  }

  ngOnInit(): void {
    // Get current user on initialization
    this.getCurrentUser();
    
    // Subscribe to authentication changes to update user
    this.isAuthenticated$.subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.getCurrentUser();
      } else {
        this.currentUser = null;
      }
    });
  }

  getCurrentUser(): void {
    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
      console.log('Current user:', this.currentUser);
    });
  }

  toggleSidenav(): void {
    this.sidenavOpened = !this.sidenavOpened;
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/auth/login']);
    });
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
      return `${this.currentUser.nombre} ${this.currentUser.apellido}`;
    }
    return 'Usuario';
  }
  
  // Get user's email
  getUserEmail(): string {
    if (this.currentUser) {
      return this.currentUser.email;
    }
    return '';
  }
}
