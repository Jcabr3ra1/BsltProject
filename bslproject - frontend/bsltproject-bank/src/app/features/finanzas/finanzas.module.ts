import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';

import { TransaccionesComponent } from './transacciones/transacciones.component';
import { TransaccionFormComponent } from './transacciones/transaccion-form/transaccion-form.component';
import { TransaccionListComponent } from './transacciones/transaccion-list/transaccion-list.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: 'transacciones',
        component: TransaccionesComponent
      },
      {
        path: '',
        redirectTo: 'transacciones',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TransaccionesComponent,
    TransaccionFormComponent,
    TransaccionListComponent
  ],
  exports: [RouterModule]
})
export class FinanzasModule { }
