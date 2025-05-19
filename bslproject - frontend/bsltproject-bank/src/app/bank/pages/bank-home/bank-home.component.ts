import { Component, ViewChild, AfterViewInit, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { FooterComponent } from '../../components/footer/footer.component';
import { MatSidenav } from '@angular/material/sidenav';
import { Subscription } from 'rxjs';

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
export class BankHomeComponent implements OnInit, AfterViewInit, OnDestroy {
  // No longer need ViewChild for MatSidenav since we're using a simpler structure
  isMobile = false;
  sidebarOpen = true;
  private resizeSubscription: Subscription | null = null;

  constructor() { }

  ngOnInit(): void {
    this.checkScreenSize();
    // Cargar estado del sidebar desde localStorage
    const savedState = localStorage.getItem('sidebarOpen');
    if (savedState !== null) {
      this.sidebarOpen = savedState === 'true';
    } else {
      // Si no hay estado guardado, el sidebar estará abierto por defecto en desktop y cerrado en mobile
      this.sidebarOpen = !this.isMobile;
    }
  }

  // This is intentionally left empty as ngOnDestroy is implemented below

  ngAfterViewInit(): void {
    // En dispositivos móviles, el sidebar comienza cerrado
    if (this.isMobile) {
      setTimeout(() => {
        this.sidebarOpen = false;
        localStorage.setItem('sidebarOpen', 'false');
      }, 0);
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkScreenSize();
  }

  checkScreenSize(): void {
    const prevIsMobile = this.isMobile;
    this.isMobile = window.innerWidth < 768;
    if (this.isMobile && this.sidebarOpen) {
      this.sidebarOpen = false;
      localStorage.setItem('sidebarOpen', 'false');
    }
  }

  toggleSidebar(isOpen?: boolean): void {
    if (isOpen !== undefined) {
      this.sidebarOpen = isOpen;
    } else {
      this.sidebarOpen = !this.sidebarOpen;
    }
    localStorage.setItem('sidebarOpen', this.sidebarOpen.toString());
  }
  
  // Método eliminado: toggleSidebarCollapse
  
  ngOnDestroy(): void {
    // Limpiar suscripciones para evitar memory leaks
    if (this.resizeSubscription) {
      this.resizeSubscription.unsubscribe();
    }
  }
}