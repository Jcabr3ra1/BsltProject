import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [RouterLink]
})
export class HomeComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    // Inicializar el carrusel de Bootstrap
    this.initBootstrap();
  }

  private initBootstrap(): void {
    // Asegurarse de que el DOM esté cargado
    document.addEventListener('DOMContentLoaded', () => {
      // Importar dinámicamente Bootstrap para inicializar el carrusel
      import('bootstrap').then(bootstrap => {
        // Inicializar todos los carruseles
        const carouselElements = document.querySelectorAll('.carousel');
        carouselElements.forEach(carouselEl => {
          new bootstrap.Carousel(carouselEl, {
            interval: 5000,
            wrap: true
          });
        });
      }).catch(err => console.error('Error al cargar Bootstrap:', err));
    });
  }
}
