import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  // BehaviorSubject para mantener el estado de colapso del sidebar
  private isCollapsedSubject = new BehaviorSubject<boolean>(false);
  
  // Observable público para que los componentes se suscriban
  isCollapsed$: Observable<boolean> = this.isCollapsedSubject.asObservable();
  
  constructor() {
    // Intentar recuperar el estado guardado en localStorage
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState) {
      this.isCollapsedSubject.next(savedState === 'true');
    }
  }
  
  // Método para alternar el estado del sidebar
  toggleSidebar(): void {
    const newState = !this.isCollapsedSubject.value;
    this.isCollapsedSubject.next(newState);
    
    // Guardar el estado en localStorage para persistencia
    localStorage.setItem('sidebarCollapsed', String(newState));
  }
  
  // Método para colapsar el sidebar
  collapseSidebar(): void {
    this.isCollapsedSubject.next(true);
    localStorage.setItem('sidebarCollapsed', 'true');
  }
  
  // Método para expandir el sidebar
  expandSidebar(): void {
    this.isCollapsedSubject.next(false);
    localStorage.setItem('sidebarCollapsed', 'false');
  }
  
  // Método para obtener el estado actual
  get isCollapsed(): boolean {
    return this.isCollapsedSubject.value;
  }
}
