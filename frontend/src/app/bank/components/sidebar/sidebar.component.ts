import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { Usuario } from '../../../core/models/usuario.model';
import { Rol } from '../../../core/models/rol.model';
import { Permiso } from '../../../core/models/permiso.model';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
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
export class SidebarComponent implements OnInit, OnDestroy {
  expandedMenus: { [key: string]: boolean } = {
    seguridad: true,
    finanzas: true,
  };
  activePage: string = '';
  user: Usuario | null = null;
  rolActual: string = '';
  private routerSub!: Subscription;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.user =
      this.authService.getUser() ||
      JSON.parse(localStorage.getItem('user') || '{}');

    this.routerSub = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.setActivePage(event.urlAfterRedirects);
      });

    this.setActivePage(this.router.url);
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
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


  isAdmin(): boolean {
    return !!this.user?.roles?.some((r) => r.nombre === 'ADMIN');
  }

  isModerador(): boolean {
    return !!this.user?.roles?.some((r) => r.nombre === 'MODERADOR');
  }

  isUsuario(): boolean {
    return !!this.user?.roles?.some((r) => r.nombre === 'USER');
  }

  tienePermiso(nombrePermiso: string): boolean {
    return !!this.user?.roles?.some((r) =>
      r.permisos?.some((p) => p.nombre === nombrePermiso)
    );
  }
  
}
