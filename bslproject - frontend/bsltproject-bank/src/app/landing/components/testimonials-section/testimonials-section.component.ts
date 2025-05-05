import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Testimonial {
  content: string;
  name: string;
  role: string;
  avatarColor: string;
}

@Component({
  selector: 'app-testimonials-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './testimonials-section.component.html',
  styleUrls: ['./testimonials-section.component.scss']
})
export class TestimonialsSectionComponent {
  testimonials: Testimonial[] = [
    {
      content: "Cambiarme a Banco Púrpura fue la mejor decisión financiera que he tomado. Sus tarifas transparentes y la atención personalizada han transformado mi experiencia bancaria.",
      name: "Carlos Ramírez",
      role: "Emprendedor",
      avatarColor: "#f5a46c"
    },
    {
      content: "La aplicación móvil es increíblemente intuitiva y me permite gestionar mis finanzas desde cualquier lugar. ¡Nunca había sido tan fácil controlar mis gastos!",
      name: "Sofía Martínez",
      role: "Diseñadora Gráfica",
      avatarColor: "#6cf5a4"
    },
    {
      content: "He probado varios bancos, pero ninguno ofrece el nivel de servicio al cliente que Banco Púrpura. Son rápidos en resolver cualquier problema y siempre están disponibles.",
      name: "Alejandro Torres",
      role: "Ingeniero de Software",
      avatarColor: "#a46cf5"
    }
  ];
}