import { Component, ViewChild, AfterViewInit, OnInit, OnDestroy, HostListener, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { FooterComponent } from '../../components/footer/footer.component';
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
  styleUrls: ['./bank-home.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class BankHomeComponent implements OnInit, AfterViewInit, OnDestroy {
  isMobile = false;
  sidebarOpen = true;
  private resizeSubscription: Subscription | null = null;

  ngOnInit(): void {
    this.checkScreenSize();
    const savedState = localStorage.getItem('sidebarOpen');
    if (savedState !== null) {
      this.sidebarOpen = savedState === 'true';
    } else {
      this.sidebarOpen = !this.isMobile;
    }
  }


  ngAfterViewInit(): void {
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
  
  
  ngOnDestroy(): void {
    if (this.resizeSubscription) {
      this.resizeSubscription.unsubscribe();
    }
  }
}