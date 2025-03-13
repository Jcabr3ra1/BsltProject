import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { CuentaService } from '@core/services/finanzas/cuenta.service';
import { Account, AccountStatus } from '@core/models/finanzas/cuenta.model';

@Component({
  selector: 'app-cuentas',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatMenuModule
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Cuentas</mat-card-title>
      </mat-card-header>

      <mat-card-content>
        @if (loading) {
          <div class="loading-container">
            <mat-spinner diameter="40"></mat-spinner>
            <span>Loading accounts...</span>
          </div>
        } @else if (error) {
          <div class="error-container">
            <mat-icon color="warn">error</mat-icon>
            <span>{{error}}</span>
            <button mat-button color="primary" (click)="loadAccounts()">
              <mat-icon>refresh</mat-icon>
              Retry
            </button>
          </div>
        } @else {
          <div class="table-container">
            @if (accounts.length) {
              <table mat-table [dataSource]="accounts" class="mat-elevation-z2">
                <!-- Account Number Column -->
                <ng-container matColumnDef="numero">
                  <th mat-header-cell *matHeaderCellDef>Número de cuenta</th>
                  <td mat-cell *matCellDef="let account">{{account.numero}}</td>
                </ng-container>

                <!-- Type Column -->
                <ng-container matColumnDef="tipo">
                  <th mat-header-cell *matHeaderCellDef>Tipo</th>
                  <td mat-cell *matCellDef="let account">{{account.tipo}}</td>
                </ng-container>

                <!-- Balance Column -->
                <ng-container matColumnDef="saldo">
                  <th mat-header-cell *matHeaderCellDef>Saldo</th>
                  <td mat-cell *matCellDef="let account">{{account.saldo | currency}}</td>
                </ng-container>

                <!-- Status Column -->
                <ng-container matColumnDef="estado">
                  <th mat-header-cell *matHeaderCellDef>Estado</th>
                  <td mat-cell *matCellDef="let account">
                    <span [class]="'status-' + account.estado.toLowerCase()">
                      {{this.getStatusDisplay(account.estado)}}
                    </span>
                  </td>
                </ng-container>

                <!-- Actions Column -->
                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Actions</th>
                  <td mat-cell *matCellDef="let account">
                    <button mat-icon-button [matMenuTriggerFor]="menu" (click)="$event.stopPropagation()">
                      <mat-icon>more_vert</mat-icon>
                    </button>
                    <mat-menu #menu="matMenu">
                      <button mat-menu-item (click)="editAccount(account)">
                        <mat-icon>edit</mat-icon>
                        <span>Edit</span>
                      </button>
                      <button mat-menu-item (click)="deleteAccount(account)">
                        <mat-icon>delete</mat-icon>
                        <span>Delete</span>
                      </button>
                    </mat-menu>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
              </table>
            } @else {
              <div class="empty-state">
                <mat-icon>account_balance_wallet</mat-icon>
                <p>No accounts found</p>
              </div>
            }

            <div class="actions">
              <button mat-raised-button color="primary" (click)="createAccount()">
                <mat-icon>add</mat-icon>
                Create Account
              </button>
            </div>
          </div>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      padding: 2rem;
    }

    .error-container {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background-color: #fff3f3;
      border-radius: 4px;
      margin: 1rem 0;
    }

    .table-container {
      margin-top: 1rem;
    }

    table {
      width: 100%;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem;
      color: #666;
      
      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        margin-bottom: 1rem;
      }
    }

    .actions {
      margin-top: 1rem;
      display: flex;
      justify-content: flex-end;
    }

    .status-active {
      color: #4caf50;
      font-weight: 500;
    }

    .status-inactive {
      color: #f44336;
      font-weight: 500;
    }

    .status-blocked {
      color: #ff9800;
      font-weight: 500;
    }
  `]
})
export class CuentasComponent implements OnInit {
  accounts: Account[] = [];
  displayedColumns = ['numero', 'tipo', 'saldo', 'estado', 'actions'];
  loading = false;
  error: string | null = null;

  readonly AccountStatus = AccountStatus;

  constructor(
    private readonly accountService: CuentaService,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.loading = true;
    this.error = null;

    this.accountService.obtenerTodos().subscribe({
      next: (accounts: Account[]) => {
        this.accounts = accounts.map(account => ({
          ...account,
          estado: this.normalizeStatus(account.estado)
        }));
        this.loading = false;
      },
      error: (error: Error) => {
        console.error('Error loading accounts:', error);
        this.error = 'Error al cargar las cuentas: ' + error.message;
        this.loading = false;
      }
    });
  }

  private normalizeStatus(status: AccountStatus | string | undefined): AccountStatus {
    if (!status) return AccountStatus.INACTIVE;
    
    // If it's already a valid enum value, return it
    if (Object.values(AccountStatus).includes(status as AccountStatus)) {
      return status as AccountStatus;
    }
    
    // Convert to uppercase for consistent comparison
    const upperStatus = typeof status === 'string' ? status.toUpperCase() : '';
    
    // Map Spanish status values to enum values
    switch (upperStatus) {
      case 'ACTIVA':
      case 'ACTIVE':
        return AccountStatus.ACTIVE;
      case 'INACTIVA':
      case 'INACTIVE':
        return AccountStatus.INACTIVE;
      case 'BLOQUEADA':
      case 'BLOCKED':
        return AccountStatus.BLOCKED;
      default:
        return AccountStatus.INACTIVE;
    }
  }

  getStatusDisplay(status: AccountStatus): string {
    switch (status) {
      case AccountStatus.ACTIVE:
        return 'Activa';
      case AccountStatus.INACTIVE:
        return 'Inactiva';
      case AccountStatus.BLOCKED:
        return 'Bloqueada';
      default:
        return 'Inactiva';
    }
  }

  createAccount(): void {
    this.accountService.abrirDialogoCuenta().afterClosed().subscribe((result: Account | undefined) => {
      if (result) {
        this.loadAccounts();
        this.snackBar.open('Account created successfully', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      }
    });
  }

  editAccount(account: Account): void {
    this.accountService.abrirDialogoCuenta(account).afterClosed().subscribe((result: Account | undefined) => {
      if (result) {
        this.loadAccounts();
        this.snackBar.open('Account updated successfully', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      }
    });
  }

  deleteAccount(account: Account): void {
    if (confirm(`Are you sure you want to delete account ${account.numero}?`)) {
      this.accountService.eliminar(account.id.toString()).subscribe({
        next: () => {
          this.loadAccounts();
          this.snackBar.open('Account deleted successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: (error: Error) => {
          console.error('Error deleting account:', error);
          this.snackBar.open('Error deleting account', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }
}
