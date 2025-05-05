import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './hero-section.component.html',
  styleUrls: ['./hero-section.component.scss']
})
export class HeroSectionComponent {
  onOpenAccountClick(): void {
    // Implementación para el botón de abrir cuenta
    console.log('Open account button clicked');
  }
  
  onLearnMoreClick(): void {
    // Implementación para el botón de conocer más
    console.log('Learn more button clicked');
  }
}