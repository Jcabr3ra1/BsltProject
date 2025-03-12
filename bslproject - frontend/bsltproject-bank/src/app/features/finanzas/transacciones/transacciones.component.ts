import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';

import { Transaction, TransactionStatus, TransactionType } from '@core/models/finanzas/transaccion.model';
import { TransaccionService } from '@core/services/finanzas/transaccion.service';

@Component({
  selector: 'app-transacciones',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatCardModule
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Transactions</mat-card-title>
      </mat-card-header>

      <mat-card-content>
        @if (loading) {
          <div class="loading-container">
            <mat-spinner diameter="40"></mat-spinner>
            <span>Loading transactions...</span>
          </div>
        } @else if (error) {
          <div class="error-container">
            <mat-icon color="warn">error</mat-icon>
            <span>{{error}}</span>
            <button mat-button color="primary" (click)="loadTransactions()">
              <mat-icon>refresh</mat-icon>
              Retry
            </button>
          </div>
        } @else {
          <div class="table-container">
            @if (transactions.length) {
              <table mat-table [dataSource]="transactions" class="mat-elevation-z2">
                <!-- Account Column -->
                <ng-container matColumnDef="account">
                  <th mat-header-cell *matHeaderCellDef>Account</th>
                  <td mat-cell *matCellDef="let transaction">{{transaction.account?.accountNumber}}</td>
                </ng-container>

                <!-- Type Column -->
                <ng-container matColumnDef="type">
                  <th mat-header-cell *matHeaderCellDef>Type</th>
                  <td mat-cell *matCellDef="let transaction">{{transaction.type}}</td>
                </ng-container>

                <!-- Amount Column -->
                <ng-container matColumnDef="amount">
                  <th mat-header-cell *matHeaderCellDef>Amount</th>
                  <td mat-cell *matCellDef="let transaction">{{transaction.amount | currency}}</td>
                </ng-container>

                <!-- Status Column -->
                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Status</th>
                  <td mat-cell *matCellDef="let transaction">
                    <span [class]="'status-' + transaction.status.toLowerCase()">
                      {{transaction.status}}
                    </span>
                  </td>
                </ng-container>

                <!-- Actions Column -->
                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Actions</th>
                  <td mat-cell *matCellDef="let transaction">
                    <button mat-icon-button [matMenuTriggerFor]="menu" (click)="$event.stopPropagation()">
                      <mat-icon>more_vert</mat-icon>
                    </button>
                    <mat-menu #menu="matMenu">
                      @if (transaction.status === TransactionStatus.PENDING) {
                        <button mat-menu-item (click)="approveTransaction(transaction)">
                          <mat-icon>check</mat-icon>
                          <span>Approve</span>
                        </button>
                        <button mat-menu-item (click)="rejectTransaction(transaction)">
                          <mat-icon>close</mat-icon>
                          <span>Reject</span>
                        </button>
                      }
                      <button mat-menu-item (click)="deleteTransaction(transaction)">
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
                <mat-icon>receipt_long</mat-icon>
                <p>No transactions found</p>
              </div>
            }
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
      overflow-x: auto;
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

    .status-pending {
      color: #ff9800;
      font-weight: 500;
    }

    .status-approved {
      color: #4caf50;
      font-weight: 500;
    }

    .status-rejected {
      color: #f44336;
      font-weight: 500;
    }

    .status-completed {
      color: #2196f3;
      font-weight: 500;
    }

    .status-failed {
      color: #9c27b0;
      font-weight: 500;
    }

    .status-cancelled {
      color: #607d8b;
      font-weight: 500;
    }
  `]
})
export class TransaccionesComponent implements OnInit {
  transactions: Transaction[] = [];
  displayedColumns: string[] = ['account', 'type', 'amount', 'status', 'actions'];
  loading = false;
  error: string | null = null;
  readonly TransactionStatus = TransactionStatus;

  constructor(
    private readonly transactionService: TransaccionService,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.loading = true;
    this.error = null;

    this.transactionService.getTransactions().subscribe({
      next: (transactions) => {
        this.transactions = transactions;
        this.loading = false;
      },
      error: (error: Error) => {
        console.error('Error loading transactions:', error);
        this.error = 'Failed to load transactions. Please try again.';
        this.loading = false;
      }
    });
  }

  approveTransaction(transaction: Transaction): void {
    this.loading = true;
    this.transactionService.approveTransaction(transaction.id).subscribe({
      next: () => {
        this.snackBar.open('Transaction approved successfully', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.loadTransactions();
      },
      error: (error: Error) => {
        console.error('Error approving transaction:', error);
        this.snackBar.open('Error approving transaction', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.loading = false;
      }
    });
  }

  rejectTransaction(transaction: Transaction): void {
    this.loading = true;
    this.transactionService.rejectTransaction(transaction.id).subscribe({
      next: () => {
        this.snackBar.open('Transaction rejected successfully', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.loadTransactions();
      },
      error: (error: Error) => {
        console.error('Error rejecting transaction:', error);
        this.snackBar.open('Error rejecting transaction', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.loading = false;
      }
    });
  }

  deleteTransaction(transaction: Transaction): void {
    if (confirm(`Are you sure you want to delete this transaction?`)) {
      this.loading = true;
      this.transactionService.deleteTransaction(transaction.id).subscribe({
        next: () => {
          this.snackBar.open('Transaction deleted successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadTransactions();
        },
        error: (error: Error) => {
          console.error('Error deleting transaction:', error);
          this.snackBar.open('Error deleting transaction', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          this.loading = false;
        }
      });
    }
  }
}
