import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AccountPageComponent } from './accounts/pages/account-page/account-page.component';
import { TransactionPageComponent } from './transactions/pages/transaction-page/transaction-page.component';
import { SpacePageComponent } from './spaces/pages/space-page/space-page.component';
import { TypeOfTransactionPageComponent } from './type-of-transactions/pages/type-of-transaction-page/type-of-transaction-page.component';
import { TypeOfMovementPageComponent } from './type-of-movements/pages/type-of-movement-page/type-of-movement-page.component';
import { CreditCardPageComponent } from './credit-cards/pages/credit-card-page/credit-card-page.component';
import { LoanPageComponent } from './loans/pages/loan-page/loan-page.component';

const routes: Routes = [
  { path: 'cuentas', component: AccountPageComponent },
  { path: 'transacciones', component: TransactionPageComponent },
  { path: 'bolsillos', component: SpacePageComponent },
  { path: 'tipo-transaccion', component: TypeOfTransactionPageComponent },
  { path: 'tipo-movimientos', component: TypeOfMovementPageComponent },
  { path: 'tarjetas', component: CreditCardPageComponent },
  { path: 'prestamos', component: LoanPageComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FinanceRoutingModule {}
