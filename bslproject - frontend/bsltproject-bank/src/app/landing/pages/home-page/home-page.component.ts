import { Component } from '@angular/core';
import { HeroSectionComponent } from '../../components/hero-section/hero-section.component';
import { FeaturesSectionComponent } from '../../components/features-section/features-section.component';
import { TestimonialsSectionComponent } from '../../components/testimonials-section/testimonials-section.component';
import { CtaSectionComponent } from '../../components/cta-section/cta-section.component';
import { FooterComponent } from '../../components/footer/footer.component';




@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [HeroSectionComponent,FeaturesSectionComponent, TestimonialsSectionComponent, CtaSectionComponent, FooterComponent],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent {}
