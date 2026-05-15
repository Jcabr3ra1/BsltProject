import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Usuario } from '../../../core/models/usuario.model';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatTooltipModule
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  user: Usuario | null = null;
  @Input() isSidebarOpen = true;
  @Input() isMobile = false;
  @Output() menuToggle = new EventEmitter<boolean>();

  constructor(
    private authService: AuthService,
    private router: Router // Inyectar Router
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
    }

  toggleSidebarState() {
    this.isSidebarOpen = !this.isSidebarOpen;
    this.menuToggle.emit(this.isSidebarOpen);
    
    localStorage.setItem('sidebarOpen', this.isSidebarOpen.toString());
  }
  
  getMenuIcon(): string {
    return this.isSidebarOpen ? 'menu_open' : 'menu';
  }

  logout() {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
      this.authService.logout();
      
      this.router.navigate(['/']); // O la ruta específica de tu landing, por ejemplo '/landing'
    }
  }
}