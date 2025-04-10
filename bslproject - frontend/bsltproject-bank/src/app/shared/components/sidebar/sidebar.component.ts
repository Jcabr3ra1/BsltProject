import { Component, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { filter } from 'rxjs/operators';
import { SidebarService } from '../../../core/services/sidebar.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
    RouterModule,
    MatExpansionModule,
    MatButtonModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SidebarComponent implements OnInit, OnDestroy {
  // Estado de los menús expandidos
  expandedMenus: { [key: string]: boolean } = {
    seguridad: false,
    finanzas: false
  };
  
  // URL actual para resaltar el elemento activo
  currentUrl: string = '';
  
  // Estado de colapso del sidebar
  isCollapsed = false;
  
  private subscription: Subscription = new Subscription();
  
  constructor(
    private router: Router,
    private sidebarService: SidebarService
  ) {}
  
  ngOnInit(): void {
    // Suscribirse a los eventos de navegación para actualizar la URL actual
    const routerSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentUrl = event.urlAfterRedirects;
      
      // Expandir automáticamente los menús según la URL actual
      if (this.currentUrl.includes('/seguridad/')) {
        this.expandedMenus['seguridad'] = true;
      }
      
      if (this.currentUrl.includes('/finanzas/')) {
        this.expandedMenus['finanzas'] = true;
      }
    });
    
    // Suscribirse al servicio de sidebar para manejar el estado de colapso
    const sidebarSub = this.sidebarService.isCollapsed$.subscribe((isCollapsed: boolean) => {
      this.isCollapsed = isCollapsed;
    });
    
    // Añadir las suscripciones para limpiarlas después
    this.subscription.add(routerSub);
    this.subscription.add(sidebarSub);
    
    // Inicializar con la URL actual
    this.currentUrl = this.router.url;
  }
  
  ngOnDestroy(): void {
    // Limpiar todas las suscripciones
    this.subscription.unsubscribe();
  }
  
  // Método para alternar la expansión de un menú
  toggleMenu(menuName: string): void {
    this.expandedMenus[menuName] = !this.expandedMenus[menuName];
  }
  
  // Método para verificar si una ruta está activa
  isActive(route: string): boolean {
    return this.currentUrl === route;
  }
  
  // Método para alternar el estado de colapso del sidebar
  toggleCollapse(): void {
    this.sidebarService.toggleSidebar();
  }
  
  // Método para expandir el sidebar
  expandSidebar(): void {
    this.sidebarService.expandSidebar();
  }
  
  // Método para expandir el sidebar si está colapsado
  expandIfCollapsed(event: MouseEvent): void {
    // Solo expandir si está colapsado
    if (this.isCollapsed) {
      // Simplificamos la lógica para que cualquier clic en el sidebar lo expanda
      // excepto si es un clic en un enlace o botón
      const target = event.target as HTMLElement;
      
      // Si el clic fue directamente en un enlace o botón, no hacemos nada
      // para permitir que esos elementos funcionen normalmente
      if (target instanceof HTMLAnchorElement || target instanceof HTMLButtonElement) {
        return;
      }
      
      // Para cualquier otro clic en el sidebar, lo expandimos
      console.log('Expandiendo sidebar desde clic');
      event.preventDefault();
      event.stopPropagation();
      this.sidebarService.expandSidebar();
    }
  }
}
