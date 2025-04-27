import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ])
    ])
  ]
})
export class SidebarComponent implements OnInit {
  isCollapsed = false;
  expandedMenus: { [key: string]: boolean } = {
    seguridad: true,
    finanzas: true
  };
  activePage: string = '';
  user: any;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
    console.log('Usuario:', this.user);
    console.log('Roles:', this.user?.roles);
    
    // Detectar la ruta activa
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects;
      this.setActivePage(url);
    });
    
    // Establecer la página activa inicial
    this.setActivePage(this.router.url);
  }
  
  setActivePage(url: string): void {
    const segments = url.split('/');
    this.activePage = segments[1] || 'dashboard';
    
    // Auto-expandir el menú correspondiente
    if (['usuarios', 'roles', 'estados', 'permisos'].includes(this.activePage)) {
      this.expandedMenus['seguridad'] = true;
    } else if (['cuentas', 'transacciones', 'bolsillos', 'tipo-transaccion', 
                'tipo-movimiento', 'tarjetas', 'prestamos'].includes(this.activePage)) {
      this.expandedMenus['finanzas'] = true;
    }
  }
  
  toggleMenu(menu: string): void {
    this.expandedMenus[menu] = !this.expandedMenus[menu];
  }

  expandSidebar(): void {
    this.isCollapsed = false;
  }

  isAdmin(): boolean {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return (
      user?.rol === 'ADMIN' ||
      user?.role === 'ADMIN' ||
      (Array.isArray(user?.roles) && user.roles.includes('ADMIN'))
    );
  }
  
  @HostListener('mouseenter')
  onMouseEnter(): void {
    if (this.isCollapsed) {
      this.expandSidebar();
    }
  }
}