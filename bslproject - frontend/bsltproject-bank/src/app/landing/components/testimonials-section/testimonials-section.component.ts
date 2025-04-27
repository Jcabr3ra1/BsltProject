import { Component } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-testimonials-section',
  standalone: true,
  imports: [NgFor, NgIf, MatIconModule],
  templateUrl: './testimonials-section.component.html',
  styleUrls: ['./testimonials-section.component.scss']
})
export class TestimonialsSectionComponent {
  Math = Math; // ✅ para que el template lo pueda usar

  testimonials = [
    {
      name: 'María González',
      role: 'Emprendedora',
      rating: 5,
      message: 'BSLBank ha transformado completamente la manera en que manejo mis finanzas...'
    },
    {
      name: 'Carlos Rodríguez',
      role: 'Empresario',
      rating: 5,
      message: 'Como dueño de un pequeño negocio, BSLBank me ha permitido gestionar...'
    },
    {
      name: 'Ana Martínez',
      role: 'Profesional',
      rating: 4.5,
      message: 'La seguridad y rapidez de las transacciones es impresionante...'
    }
  ];
}
