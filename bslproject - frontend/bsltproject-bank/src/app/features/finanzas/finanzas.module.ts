import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

// Importaciones de componentes con rutas actualizadas
import { CuentaListComponent } from './cuentas/cuenta-list/cuenta-list.component';
import { TransaccionListComponent, TransaccionDialogComponent } from './transacciones';
import { BolsilloListComponent } from './bolsillos/bolsillo-list/bolsillo-list.component';
import { BolsilloDialogComponent } from './bolsillos/bolsillo-dialog/bolsillo-dialog.component';
import { BolsilloTransferDialogComponent } from './bolsillos/bolsillo-transfer-dialog/bolsillo-transfer-dialog.component';
import { TiposMovimientoComponent } from './tipos-movimiento/tipos-movimiento.component';
import { TipoMovimientoDialogComponent } from './tipos-movimiento/tipo-movimiento-dialog/tipo-movimiento-dialog.component';
import { TiposTransaccionComponent } from './tipos-transaccion/tipos-transaccion.component';
import { TipoTransaccionDialogComponent } from './tipos-transaccion/tipo-transaccion-dialog/tipo-transaccion-dialog.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

const routes: Routes = [
  { path: 'cuentas', component: CuentaListComponent },
  { path: 'transacciones', component: TransaccionListComponent },
  { path: 'bolsillos', component: BolsilloListComponent },
  { path: 'tipos-movimiento', component: TiposMovimientoComponent },
  { path: 'tipos-transaccion', component: TiposTransaccionComponent },
  { path: '', redirectTo: 'cuentas', pathMatch: 'full' }
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  exports: [
    RouterModule
  ]
})
export class FinanzasModule { }
