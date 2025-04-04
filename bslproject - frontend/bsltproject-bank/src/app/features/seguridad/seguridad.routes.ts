import { Routes } from '@angular/router';

export const SEGURIDAD_ROUTES: Routes = [
  {
    path: 'usuarios',
    loadComponent: () => import('./usuarios/usuarios.component').then(c => c.UsuariosComponent)
  },
  {
    path: 'roles',
    loadComponent: () => import('./rol/rol.component').then(c => c.RolComponent)
  },
  {
    path: 'estados',
    loadComponent: () => import('./estado/estado.component').then(c => c.EstadoComponent)
  },
  {
    path: 'permisos',
    loadComponent: () => import('./permiso/permiso.component').then(c => c.PermisoComponent)
  },
  {
    path: '',
    redirectTo: 'usuarios',
    pathMatch: 'full'
  }
];
