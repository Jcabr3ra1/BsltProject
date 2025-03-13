import { Routes } from '@angular/router';
import { HomeComponent } from '@app/features/home/home.component';
import { LoginComponent } from '@app/auth/login/login.component';
import { RegisterComponent } from '@app/auth/register/register.component';
import { DashboardComponent } from '@app/features/dashboard/dashboard.component';
import { AuthGuard } from '@core/guards/auth.guard';
import { LandingPageComponent } from '@app/features/landing-page/landing-page.component';
// Importar directamente las rutas para evitar problemas de carga perezosa
import { SEGURIDAD_ROUTES } from '@app/features/seguridad/seguridad.routes';
import { FINANZAS_ROUTES } from '@app/features/finanzas/finanzas.routes';

export const routes: Routes = [
  // Rutas públicas
  { path: '', component: LandingPageComponent },
  { path: 'landing', component: LandingPageComponent },
  { path: 'home', component: HomeComponent },
  
  // Rutas de autenticación
  { 
    path: 'auth', 
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },
  
  // Rutas protegidas - requieren autenticación
  { 
    path: 'dashboard', 
    component: DashboardComponent, 
    canActivate: [AuthGuard] 
  },
  
  // Módulos de características - carga perezosa
  {
    path: 'seguridad',
    children: SEGURIDAD_ROUTES,
    canActivate: [AuthGuard]
  },
  {
    path: 'finanzas',
    children: FINANZAS_ROUTES,
    canActivate: [AuthGuard]
  },
  
  // Ruta de fallback
  { path: '**', redirectTo: '/landing' }
];
