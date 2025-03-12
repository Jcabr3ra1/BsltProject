import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Transaction, TransactionType, TransactionStatus } from '@core/models/finanzas/transaccion.model';
import { Account } from '@core/models/finanzas/cuenta.model';

@Component({
  selector: 'app-transaccion-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="transaction-list-container">
      <form [formGroup]="filterForm" class="filter-form">
        <mat-form-field>
          <mat-label>Account</mat-label>
          <mat-select formControlName="accountId">
            <mat-option [value]="''">All</mat-option>
            @for (account of accounts; track account.id) {
              <mat-option [value]="account.id">{{ account.accountNumber }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field>
          <mat-label>Type</mat-label>
          <mat-select formControlName="type">
            <mat-option [value]="''">All</mat-option>
            @for (type of TransactionType | keyvalue; track type.key) {
              <mat-option [value]="type.value">{{ type.value }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field>
          <mat-label>Status</mat-label>
          <mat-select formControlName="status">
            <mat-option [value]="''">All</mat-option>
            @for (status of TransactionStatus | keyvalue; track status.key) {
              <mat-option [value]="status.value">{{ status.value }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field>
          <mat-label>Date Range</mat-label>
          <mat-date-range-input [rangePicker]="picker">
            <input matStartDate formControlName="startDate" placeholder="Start date">
            <input matEndDate formControlName="endDate" placeholder="End date">
          </mat-date-range-input>
          <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-date-range-picker #picker></mat-date-range-picker>
        </mat-form-field>
      </form>

      @if (loading) {
        <div class="loading-container">
          <mat-progress-spinner mode="indeterminate" diameter="40"></mat-progress-spinner>
          <span>Loading transactions...</span>
        </div>
      } @else if (error) {
        <div class="error-container">
          <mat-icon color="warn">error</mat-icon>
          <p>{{ error }}</p>
          <button mat-raised-button color="primary" (click)="loadTransactions()">Retry</button>
        </div>
      } @else {
        <table mat-table [dataSource]="dataSource" matSort class="transaction-table">
          <ng-container matColumnDef="createdAt">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Date</th>
            <td mat-cell *matCellDef="let transaction">{{ transaction.createdAt | date }}</td>
          </ng-container>

          <ng-container matColumnDef="accountNumber">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Account</th>
            <td mat-cell *matCellDef="let transaction">
              {{ getAccountNumber(transaction.accountId) }}
            </td>
          </ng-container>

          <ng-container matColumnDef="type">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Type</th>
            <td mat-cell *matCellDef="let transaction">{{ transaction.type }}</td>
          </ng-container>

          <ng-container matColumnDef="amount">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Amount</th>
            <td mat-cell *matCellDef="let transaction">{{ transaction.amount | currency }}</td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
            <td mat-cell *matCellDef="let transaction">
              <span [class]="'status-badge status-' + transaction.status.toLowerCase()">
                {{ transaction.status }}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="description">
            <th mat-header-cell *matHeaderCellDef>Description</th>
            <td mat-cell *matCellDef="let transaction">{{ transaction.description }}</td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let transaction">
              <button mat-icon-button [matMenuTriggerFor]="menu" (click)="$event.stopPropagation()">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #menu="matMenu">
                @if (transaction.status === TransactionStatus.PENDING) {
                  <button mat-menu-item (click)="onApprove(transaction)">
                    <mat-icon>check</mat-icon>
                    <span>Approve</span>
                  </button>
                  <button mat-menu-item (click)="onReject(transaction)">
                    <mat-icon>close</mat-icon>
                    <span>Reject</span>
                  </button>
                }
                <button mat-menu-item (click)="onEdit(transaction)">
                  <mat-icon>edit</mat-icon>
                  <span>Edit</span>
                </button>
                <button mat-menu-item (click)="onDelete(transaction)">
                  <mat-icon>delete</mat-icon>
                  <span>Delete</span>
                </button>
              </mat-menu>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        <mat-paginator [pageSizeOptions]="[5, 10, 25, 100]" showFirstLastButtons></mat-paginator>
      }
    </div>
  `,
  styles: [`
    .transaction-list-container {
      padding: 1rem;
    }

    .filter-form {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }

    .transaction-table {
      width: 100%;
    }

    .loading-container,
    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      padding: 2rem;
    }

    .status-badge {
      padding: 0.25rem 0.5rem;
      border-radius: 1rem;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .status-pending {
      background-color: #fff3e0;
      color: #e65100;
    }

    .status-approved {
      background-color: #e8f5e9;
      color: #2e7d32;
    }

    .status-rejected {
      background-color: #ffebee;
      color: #c62828;
    }
  `]
})
export class TransaccionListComponent implements OnInit {
  @Input() transactions: Transaction[] = [];
  @Input() accounts: Account[] = [];
  @Input() loading = false;
  @Input() error: string | null = null;

  @Output() filterChange = new EventEmitter<any>();
  @Output() approve = new EventEmitter<Transaction>();
  @Output() reject = new EventEmitter<Transaction>();
  @Output() edit = new EventEmitter<Transaction>();
  @Output() delete = new EventEmitter<Transaction>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  filterForm: FormGroup;
  dataSource: MatTableDataSource<Transaction>;
  displayedColumns = ['createdAt', 'accountNumber', 'type', 'amount', 'status', 'description', 'actions'];
  readonly TransactionType = TransactionType;
  readonly TransactionStatus = TransactionStatus;

  constructor(private readonly fb: FormBuilder) {
    this.filterForm = this.fb.group({
      accountId: [''],
      type: [''],
      status: [''],
      startDate: [null],
      endDate: [null]
    });

    this.dataSource = new MatTableDataSource<Transaction>();
  }

  ngOnInit(): void {
    this.filterForm.valueChanges.subscribe(filters => {
      this.filterChange.emit(filters);
    });

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnChanges(): void {
    if (this.transactions) {
      this.dataSource.data = this.transactions;
    }
  }

  getAccountNumber(accountId: string): string {
    const account = this.accounts.find(a => a.id === accountId);
    return account ? account.accountNumber : 'Unknown';
  }

  onApprove(transaction: Transaction): void {
    this.approve.emit(transaction);
  }

  onReject(transaction: Transaction): void {
    this.reject.emit(transaction);
  }

  onEdit(transaction: Transaction): void {
    this.edit.emit(transaction);
  }

  onDelete(transaction: Transaction): void {
    this.delete.emit(transaction);
  }

  loadTransactions(): void {
    this.filterChange.emit(this.filterForm.value);
  }
}
