import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule],
  templateUrl: './hero-section.component.html',
  styleUrls: ['./hero-section.component.scss']
})
export class HeroSectionComponent implements OnInit, OnDestroy {
  images = [
    'src/assets/images/hero-bg-1.png',
    '/assets/images/hero-bg-2.jpg',
    '/assets/images/hero-bg-3.jpg'
  ];

  currentImage = this.images[0];
  private intervalId: any;

  ngOnInit(): void {
    let index = 0;
    this.intervalId = setInterval(() => {
      index = (index + 1) % this.images.length;
      this.currentImage = this.images[index];
    }, 5000);
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }
}
