import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-cta-section',
  standalone: true,
  imports: [RouterModule, MatButtonModule],
  templateUrl: './cta-section.component.html',
  styleUrls: ['./cta-section.component.scss']
})
export class CtaSectionComponent {
  trackCtaClick(): void {
    console.log('CTA button clicked');
    // Aquí puedes agregar lógica para seguimiento de eventos o analíticas
  }
}