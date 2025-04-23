import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinanceRoutingModule } from './finance-routing.module';

import { AccountPageComponent } from './accounts/pages/account-page/account-page.component';
import { TransactionPageComponent } from './transactions/pages/transaction-page/transaction-page.component';
import { SpacePageComponent } from './spaces/pages/space-page/space-page.component';
import { TypeOfTransactionPageComponent } from './type-of-transactions/pages/type-of-transaction-page/type-of-transaction-page.component';
import { TypeOfMovementPageComponent } from './type-of-movements/pages/type-of-movement-page/type-of-movement-page.component';
import { CreditCardPageComponent } from './credit-cards/pages/credit-card-page/credit-card-page.component';
import { LoanPageComponent } from './loans/pages/loan-page/loan-page.component';

@NgModule({
  declarations: [
    AccountPageComponent,
    TransactionPageComponent,
    SpacePageComponent,
    TypeOfTransactionPageComponent,
    TypeOfMovementPageComponent,
    CreditCardPageComponent,
    LoanPageComponent,
  ],
  imports: [CommonModule, FinanceRoutingModule],
})
export class FinanceModule {}
