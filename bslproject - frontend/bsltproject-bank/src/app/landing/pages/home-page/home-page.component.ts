import { Component, OnInit, OnDestroy, ViewEncapsulation, AfterViewInit, ElementRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { HeroSectionComponent } from '../../components/hero-section/hero-section.component';
import { FeaturesSectionComponent } from '../../components/features-section/features-section.component';
import { TestimonialsSectionComponent } from '../../components/testimonials-section/testimonials-section.component';
import { AppSectionComponent } from '../../components/app-section/app-section.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NavbarComponent,
    HeroSectionComponent,
    FeaturesSectionComponent,
    TestimonialsSectionComponent,
    AppSectionComponent,
    FooterComponent
  ],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss', './landing-styles.scss'],
  // Importante: usar ViewEncapsulation.None para asegurar que los estilos se apliquen correctamente
  encapsulation: ViewEncapsulation.None
})
export class HomePageComponent implements OnInit, OnDestroy, AfterViewInit {
  
  constructor(private elementRef: ElementRef) { }
  
  ngOnInit(): void {
    // Asegúrate de que el scroll empiece desde arriba cuando se carga la página
    window.scrollTo(0, 0);
    
    // Aplicar la clase landing-page-body al elemento body para que los estilos del landing se apliquen correctamente
    document.body.classList.add('landing-page-body');
    
    // Asegurar que el overflow esté habilitado
    document.documentElement.style.overflow = 'auto';
    document.body.style.overflow = 'auto';
    
    // Asegurarse de que el body y html tengan altura automática
    document.body.style.height = 'auto';
    document.documentElement.style.height = 'auto';
    
    // Eliminar cualquier margen que pueda estar causando espacios
    document.body.style.margin = '0';
    document.documentElement.style.margin = '0';
    document.body.style.padding = '0';
    document.documentElement.style.padding = '0';
  }
  
  ngAfterViewInit(): void {
    // Aplicar estilos directamente al contenedor del componente para eliminar espacios no deseados
    const hostElement = this.elementRef.nativeElement;
    hostElement.style.display = 'block';
    hostElement.style.margin = '0';
    hostElement.style.padding = '0';
    
    // Forzar un recálculo del layout
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
  }
  
  ngOnDestroy(): void {
    // Limpiar la clase cuando el componente se destruye
    document.body.classList.remove('landing-page-body');
    
    // Restaurar cualquier configuración de estilo que hayamos cambiado
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    document.body.style.height = '';
    document.documentElement.style.height = '';
    document.body.style.margin = '';
    document.documentElement.style.margin = '';
    document.body.style.padding = '';
    document.documentElement.style.padding = '';
  }
}