import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from './features/dashboard/dashboard.component';

const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  {
    path: 'seguridad',
    loadChildren: () =>
      import('./features/security/security.module').then(
        (m) => m.SecurityModule
      ),
  },
  {
    path: 'finanzas',
    loadChildren: () =>
      import('./features/finance/finance.module').then((m) => m.FinanceModule),
  },
  {
    path: '',
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BankRoutingModule {}
