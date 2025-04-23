import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LandingRoutingModule } from './landing-routing.module';

import { HomePageComponent } from './pages/home-page/home-page.component';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [HomePageComponent],
  imports: [CommonModule, LandingRoutingModule, MatIconModule, MatButtonModule],
  exports: [],
})
export class LandingModule {}
