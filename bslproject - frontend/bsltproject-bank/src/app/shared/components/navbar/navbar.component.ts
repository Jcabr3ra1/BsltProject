import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { AuthService } from '../../../core/services/seguridad/auth.service';

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
    MatBadgeModule
  ]
})
export class NavbarComponent {
  isAuthenticated = false;
  userName = '';
  userInitials = '';

  constructor(private authService: AuthService) {
    this.authService.currentUser.subscribe(user => {
      this.isAuthenticated = !!user;
      if (user) {
        this.userName = user.nombre;
        this.userInitials = user.nombre.charAt(0).toUpperCase();
      }
    });
  }

  logout() {
    this.authService.logout();
  }
}
