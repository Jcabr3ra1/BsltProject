import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgFor } from '@angular/common';
import { MatIconModule } from '@angular/material/icon'; // ✅ Agrega esto

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterModule, NgFor, MatIconModule], // ✅ Agrega MatIconModule aquí
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  links = [
    {
      title: 'Producto',
      items: ['Características', 'Planes', 'Seguridad', 'Empresas']
    },
    {
      title: 'Compañía',
      items: ['Sobre nosotros', 'Carreras', 'Blog', 'Prensa']
    },
    {
      title: 'Soporte',
      items: ['Centro de ayuda', 'Contacto', 'Comunidad', 'Estado del sistema']
    },
    {
      title: 'Legal',
      items: ['Privacidad', 'Términos', 'Cookies', 'Licencias']
    }
  ];
}
