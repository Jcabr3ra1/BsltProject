import { Component, OnInit } from '@angular/core';
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
        animate(
          '300ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
      transition(':leave', [
        animate(
          '200ms ease-in',
          style({ opacity: 0, transform: 'translateY(-10px)' })
        ),
      ]),
    ]),
  ],
})
export class SidebarComponent implements OnInit {
  expandedMenus: { [key: string]: boolean } = {
    seguridad: true,
    finanzas: true,
  };
  activePage: string = '';
  user: any;
  rolActual: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.user =
      this.authService.getUser() ||
      JSON.parse(localStorage.getItem('user') || '{}');

    console.log('👤 Usuario cargado:', this.user);
    console.log('🔐 Roles:', this.user?.roles);

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const url = event.urlAfterRedirects;
        this.setActivePage(url);
      });

    this.setActivePage(this.router.url);
  }

  setActivePage(url: string): void {
    const segments = url.split('/');
    this.activePage = segments[1] || 'dashboard';

    if (
      ['usuarios', 'roles', 'estados', 'permisos'].includes(this.activePage)
    ) {
      this.expandedMenus['seguridad'] = true;
    } else if (
      [
        'cuentas',
        'transacciones',
        'bolsillos',
        'tipo-transaccion',
        'tipo-movimiento',
      ].includes(this.activePage)
    ) {
      this.expandedMenus['finanzas'] = true;
    }
  }

  toggleMenu(menu: string): void {
    this.expandedMenus[menu] = !this.expandedMenus[menu];
  }
  
  navigateTo(route: string): void {
    this.router.navigate([route]);
    this.activePage = route;
  }

  // Método eliminado: expandSidebar

  isAdmin(): boolean {
    return (
      Array.isArray(this.user?.roles) &&
      this.user.roles.some((r: any) => r === 'ADMIN' || r?.nombre === 'ADMIN')
    );
  }

  isModerador(): boolean {
    return (
      Array.isArray(this.user?.roles) &&
      this.user.roles.some(
        (r: any) => r === 'MODERADOR' || r?.nombre === 'MODERADOR'
      )
    );
  }

  isUsuario(): boolean {
    return (
      Array.isArray(this.user?.roles) &&
      this.user.roles.some((r: any) => r === 'USER' || r?.nombre === 'USER')
    );
  }

  tienePermiso(nombrePermiso: string): boolean {
    return this.user?.roles?.some((r: any) =>
      r.permisos?.some((p: any) => p.nombre === nombrePermiso)
    );
  }
  
  // Método eliminado: onMouseEnter
}
