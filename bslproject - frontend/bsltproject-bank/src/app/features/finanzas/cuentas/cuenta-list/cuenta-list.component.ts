import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { Account, AccountStatus } from '../../../../core/models/finanzas/cuenta.model';
import { CuentaService } from '../../../../core/services/finanzas';

@Component({
  selector: 'app-cuenta-list',
  templateUrl: './cuenta-list.component.html',
  styleUrls: ['./cuenta-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule
  ]
})
export class CuentaListComponent implements OnInit {
  accounts: Account[] = [];
  loading = false;
  displayedColumns: string[] = ['accountNumber', 'type', 'balance', 'status', 'actions'];
  AccountStatus = AccountStatus;

  constructor(
    private readonly router: Router,
    private readonly accountService: CuentaService
  ) { }

  ngOnInit(): void {
    this.loadAccounts();
  }

  private async loadAccounts(): Promise<void> {
    try {
      this.loading = true;
      this.accounts = await firstValueFrom(this.accountService.obtenerTodos());
    } catch (error) {
      console.error('Error loading accounts:', error);
    } finally {
      this.loading = false;
    }
  }

  onRowClick(account: Account): void {
    this.router.navigate(['/cuentas', account.id]);
  }

  onEdit(account: Account): void {
    this.router.navigate(['/cuentas', account.id, 'edit']);
  }

  onDelete(account: Account): void {
    // TODO: Implement delete functionality
    console.log('Delete account:', account);
  }

  onCreate(): void {
    this.router.navigate(['/cuentas/new']);
  }

  verDetalles(account: Account): void {
    // Por implementar: Mostrar detalles de la cuenta
    console.log('Ver detalles de cuenta:', account);
  }

  verMovimientos(account: Account): void {
    // Por implementar: Mostrar movimientos de la cuenta
    console.log('Ver movimientos de cuenta:', account);
  }
}
