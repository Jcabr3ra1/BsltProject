import { Routes } from '@angular/router';
import { provideRouter } from '@angular/router';

import { HomePageComponent } from './landing/pages/home-page/home-page.component';
import { LoginFormComponent } from './landing/components/login-form/login-form.component';
import { RegisterFormComponent } from './landing/components/register-form/register-form.component';

import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

import { BankHomeComponent } from './bank/pages/bank-home/bank-home.component';

export const routes: Routes = [
  {
    path: '',
    component: HomePageComponent
  },
  {
    path: 'auth/login',
    component: LoginFormComponent
  },
  {
    path: 'auth/register',
    component: RegisterFormComponent
  },
  {
    path: '',
    component: BankHomeComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./bank/features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },

      {
        path: 'usuarios',
        canActivate: [roleGuard('ADMIN')],
        loadComponent: () =>
          import('./bank/features/security/users/pages/user-page/user-page.component').then(
            m => m.UserPageComponent
          )
      },
      {
        path: 'cuentas',
        loadComponent: () =>
          import('./bank/features/finance/accounts/pages/account-page/account-page.component').then(
            m => m.AccountPageComponent
          )
      },
      {
        path: 'bolsillos',
        loadComponent: () =>
          import('./bank/features/finance/pockets/pages/pocket-page/pocket-page.component').then(
            m => m.PocketPageComponent
          )
      },
      {
        path: 'tipo-movimiento',
        loadComponent: () =>
          import('./bank/features/finance/type-of-movements/pages/type-of-movement-page/type-of-movement-page.component')
            .then(m => m.TypeOfMovementPageComponent)
      },
      {
        path: 'tipo-transaccion',
        loadComponent: () =>
          import('./bank/features/finance/type-of-transactions/pages/type-of-transaction-page/type-of-transaction-page.component')
            .then(m => m.TypeOfTransactionPageComponent)
      },
      {
        path: 'transacciones',
        loadComponent: () =>
          import('./bank/features/finance/transactions/pages/transaction-page/transaction-page.component').then(
            m => m.TransactionPageComponent
          )
      },
      {
        path: 'roles',
        canActivate: [roleGuard('ADMIN')],
        loadComponent: () =>
          import('./bank/features/security/roles/pages/role-page/role-page.component').then(
            m => m.RolePageComponent
          )
      },
      {
        path: 'estados',
        canActivate: [roleGuard('ADMIN')],
        loadComponent: () =>
          import('./bank/features/security/states/pages/state-page/state-page.component').then(
            m => m.EstadoPageComponent
          )
      },
      {
        path: 'permisos',
        canActivate: [roleGuard('ADMIN')],
        loadComponent: () =>
          import('./bank/features/security/permissions/pages/permission-page/permission-page.component').then(
            m => m.PermissionPageComponent
          )
      }
    ]
  }
];

export const appRouting = provideRouter(routes);
