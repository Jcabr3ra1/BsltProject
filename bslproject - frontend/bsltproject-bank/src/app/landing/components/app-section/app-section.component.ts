import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-app-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app-section.component.html',
  styleUrls: ['./app-section.component.css']
})
export class AppSectionComponent {
  appFeatures = [
    'Transferencias instantáneas 24/7',
    'Control de gastos y presupuestos',
    'Notificaciones en tiempo real',
    'Pago de servicios sin comisiones'
  ];
}