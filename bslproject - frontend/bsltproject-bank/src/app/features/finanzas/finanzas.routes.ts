import { Routes } from '@angular/router';

export const FINANZAS_ROUTES: Routes = [
  {
    path: 'cuentas',
    loadComponent: () => import('./cuentas/cuentas.component').then(c => c.CuentasComponent)
  },
  {
    path: 'transacciones',
    loadComponent: () => import('./transacciones/transacciones.component').then(c => c.TransaccionesComponent)
  },
  {
    path: 'bolsillos',
    loadComponent: () => import('./bolsillos/bolsillos.component').then(c => c.BolsillosComponent)
  },
  {
    path: 'tipos-movimiento',
    loadComponent: () => import('./tipos-movimiento/tipos-movimiento.component').then(c => c.TiposMovimientoComponent)
  },
  {
    path: 'tipos-transaccion',
    loadComponent: () => import('./tipos-transaccion/tipos-transaccion.component').then(c => c.TiposTransaccionComponent)
  },
  {
    path: '',
    redirectTo: 'cuentas',
    pathMatch: 'full'
  }
];
