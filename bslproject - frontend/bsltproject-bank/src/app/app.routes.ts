import { Routes } from '@angular/router';
import { HomeComponent } from '@features/home/home.component';
import { LoginComponent } from './auth';
import { RegisterComponent } from './auth';
import { DashboardComponent } from '@features/dashboard/dashboard.component';
import { authGuard } from '@core/guards/auth.guard';
import { LandingPageComponent } from '@features/landing-page/landing-page.component';
// Importar directamente las rutas para evitar problemas de carga perezosa
import { SEGURIDAD_ROUTES } from '@features/seguridad/seguridad.routes';
import { FINANZAS_ROUTES } from '@features/finanzas/finanzas.routes';
import { TokenDiagnosticoComponent } from '@features/diagnostico/token-diagnostico.component';

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
    canActivate: [authGuard] 
  },
  
  // Módulos de características - carga perezosa
  {
    path: 'seguridad',
    children: SEGURIDAD_ROUTES,
    canActivate: [authGuard]
  },
  {
    path: 'finanzas',
    children: FINANZAS_ROUTES,
    canActivate: [authGuard]
  },
  
  // Ruta de diagnóstico - accesible sin autenticación para facilitar la depuración
  { path: 'diagnostico', component: TokenDiagnosticoComponent },
  
  // Ruta de fallback
  { path: '**', redirectTo: '/landing' }
];
