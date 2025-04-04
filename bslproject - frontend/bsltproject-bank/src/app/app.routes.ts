import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./auth/register/register.component').then(m => m.RegisterComponent)
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'finanzas',
    canActivate: [authGuard],
    children: [
      {
        path: 'cuentas',
        loadComponent: () => import('./features/finanzas/cuentas/cuentas.component').then(m => m.CuentasComponent)
      },
      {
        path: 'transacciones',
        loadComponent: () => import('./features/finanzas/transacciones/transacciones.component').then(m => m.TransaccionesComponent)
      },
      {
        path: 'bolsillos',
        loadComponent: () => import('./features/finanzas/bolsillos/bolsillos.component').then(m => m.BolsillosComponent)
      }
    ]
  },
  {
    path: 'seguridad',
    canActivate: [authGuard],
    children: [
      {
        path: 'usuarios',
        loadComponent: () => import('./features/seguridad/usuarios/usuarios.component').then(m => m.UsuariosComponent)
      },
      {
        path: 'roles',
        loadComponent: () => import('./features/seguridad/roles/roles.component').then(m => m.RolesComponent)
      },
      {
        path: 'permisos',
        loadComponent: () => import('./features/seguridad/permisos/permisos.component').then(m => m.PermisosComponent)
      }
    ]
  },
  { path: '**', redirectTo: 'home' }
];