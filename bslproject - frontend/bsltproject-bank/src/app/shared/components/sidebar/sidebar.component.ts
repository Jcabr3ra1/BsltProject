import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
    RouterModule
  ]
})
export class SidebarComponent {
  // Estado de los menús expandidos
  expandedMenus: { [key: string]: boolean } = {
    seguridad: false,
    finanzas: false
  };

  // Método para alternar la expansión de un menú
  toggleMenu(menuName: string): void {
    this.expandedMenus[menuName] = !this.expandedMenus[menuName];
  }
}
