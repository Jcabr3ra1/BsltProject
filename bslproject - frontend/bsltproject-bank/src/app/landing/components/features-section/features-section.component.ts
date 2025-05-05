import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-features-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './features-section.component.html',
  styleUrls: ['./features-section.component.scss']
})
export class FeaturesSectionComponent {
  features: Feature[] = [
    {
      icon: '🔒',
      title: 'Seguridad Avanzada',
      description: 'Protegemos tus finanzas con la tecnología de seguridad más avanzada del mercado, garantizando tranquilidad en cada transacción.'
    },
    {
      icon: '💸',
      title: 'Sin Comisiones',
      description: 'Olvídate de las comisiones ocultas. En Banco Púrpura, ofrecemos transparencia total en todos nuestros servicios bancarios.'
    },
    {
      icon: '📱',
      title: 'Banca Móvil',
      description: 'Gestiona tus finanzas desde cualquier lugar con nuestra aplicación móvil intuitiva y fácil de usar.'
    },
    {
      icon: '🚀',
      title: 'Transferencias Rápidas',
      description: 'Envía y recibe dinero en segundos, sin esperas ni complicaciones, a cualquier banco nacional e internacional.'
    },
    {
      icon: '💰',
      title: 'Inversiones Rentables',
      description: 'Aprovecha nuestras soluciones de inversión personalizadas para hacer crecer tu patrimonio de manera segura.'
    },
    {
      icon: '🤝',
      title: 'Soporte 24/7',
      description: 'Nuestro equipo de atención al cliente está disponible las 24 horas para ayudarte con cualquier consulta o problema.'
    }
  ];
}