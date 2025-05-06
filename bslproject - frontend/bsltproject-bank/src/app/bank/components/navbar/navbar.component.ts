import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Output, EventEmitter, Input } from '@angular/core';
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
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  user: any;
  @Input() isSidebarOpen = true;
  @Output() menuToggle = new EventEmitter<boolean>();

  constructor(
    private authService: AuthService,
    private router: Router // Inyectar Router
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
    console.log('Usuario en Navbar:', this.user);
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
    this.menuToggle.emit(this.isSidebarOpen);
    
    // Guardar preferencia del usuario
    localStorage.setItem('sidebarOpen', this.isSidebarOpen.toString());
  }

  logout() {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
      console.log('Cerrando sesión...');
      this.authService.logout();
      
      // Añadir redirección al landing page
      this.router.navigate(['/']); // O la ruta específica de tu landing, por ejemplo '/landing'
    }
  }
}