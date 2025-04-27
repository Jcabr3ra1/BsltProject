import { Component, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { FooterComponent } from '../../components/footer/footer.component';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'app-bank-home',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    NavbarComponent, 
    SidebarComponent, 
    MatSidenavModule, 
    FooterComponent
  ],
  templateUrl: './bank-home.component.html',
  styleUrls: ['./bank-home.component.scss']
})
export class BankHomeComponent implements OnInit, AfterViewInit {
  @ViewChild('drawer') drawer!: MatSidenav;
  
  // Detectar tamaño de pantalla para decidir si el sidebar debe estar abierto por defecto
  isMobile: boolean = false;
  sidebarOpen: boolean = true;

  constructor() {
    // Comprobar el tamaño de la pantalla
    this.checkScreenSize();
    
    // Recuperar preferencia del usuario
    const savedState = localStorage.getItem('sidebarOpen');
    if (savedState !== null) {
      this.sidebarOpen = savedState === 'true';
    }
  }

  ngOnInit(): void {
    // Escuchar cambios en el tamaño de la ventana
    window.addEventListener('resize', this.checkScreenSize.bind(this));
  }

  ngAfterViewInit(): void {
    // En dispositivos móviles, el sidebar comienza cerrado
    if (this.isMobile) {
      setTimeout(() => {
        this.sidebarOpen = false;
        if (this.drawer) {
          this.drawer.close();
        }
      }, 0);
    }
  }

  checkScreenSize(): void {
    const prevIsMobile = this.isMobile;
    this.isMobile = window.innerWidth < 768;
    
    // Si cambia de escritorio a móvil, cerrar el sidebar
    if (!prevIsMobile && this.isMobile) {
      this.sidebarOpen = false;
    }
  }
  
  toggleSidebar(isOpen?: boolean): void {
    if (isOpen !== undefined) {
      this.sidebarOpen = isOpen;
    } else {
      this.sidebarOpen = !this.sidebarOpen;
    }
    
    if (this.drawer) {
      if (this.sidebarOpen) {
        this.drawer.open();
      } else {
        this.drawer.close();
      }
    }
    
    // Guardar preferencia del usuario
    localStorage.setItem('sidebarOpen', this.sidebarOpen.toString());
  }
}