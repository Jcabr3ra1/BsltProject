import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { TransaccionesComponent } from './transacciones/transacciones.component';
import { TransaccionFormComponent } from './transacciones/transaccion-form/transaccion-form.component';
import { TransaccionListComponent } from './transacciones/transaccion-list/transaccion-list.component';
import { EstadosTransaccionComponent } from './estados-transaccion/estados-transaccion.component';

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
        path: 'estados-transaccion',
        component: EstadosTransaccionComponent
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
    FormsModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    RouterModule.forChild(routes),
    EstadosTransaccionComponent,
    TransaccionesComponent,
    TransaccionFormComponent,
    TransaccionListComponent
  ],
  exports: [RouterModule]
})
export class FinanzasModule { }
