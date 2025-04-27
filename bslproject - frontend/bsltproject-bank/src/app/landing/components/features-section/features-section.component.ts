import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-features-section',
  standalone: true,
  imports: [MatIconModule, NgFor],
  templateUrl: './features-section.component.html',
  styleUrls: ['./features-section.component.scss']
})
export class FeaturesSectionComponent {
  features = [
    {
      icon: 'security',
      title: 'Transacciones seguras en tiempo real',
      description: 'Transfiere dinero instantáneamente a cualquier cuenta con la máxima seguridad. Nuestro sistema utiliza encriptación avanzada y autenticación de múltiples factores.'
    },
    {
      icon: 'insights',
      title: 'Análisis financiero inteligente',
      description: 'Visualiza y comprende tus finanzas con nuestras herramientas de análisis avanzado. Obtén insights personalizados y recomendaciones basadas en IA.'
    },
    {
      icon: 'devices',
      title: 'Acceso desde cualquier dispositivo',
      description: 'Gestiona tus cuentas en cualquier lugar. Nuestra plataforma es responsive para darte control completo estés donde estés.'
    }
  ];
}
