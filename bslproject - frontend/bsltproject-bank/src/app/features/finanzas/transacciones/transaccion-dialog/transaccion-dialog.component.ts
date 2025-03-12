import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { TransaccionService } from '@core/services/finanzas/transaccion.service';
import { Transaction, TransactionType } from '@core/models/finanzas/transaccion.model';
import { Account } from '@core/models/finanzas/cuenta.model';

interface DialogData {
  transaction?: Transaction;
  accounts: Account[];
}

interface TransactionFormData {
  accountId: string;
  type: TransactionType;
  amount: number;
  description: string;
}

@Component({
  selector: 'app-transaccion-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.transaction ? 'Edit' : 'Create' }} Transaction</h2>
    
    <form [formGroup]="transactionForm" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <mat-form-field>
          <mat-label>Account</mat-label>
          <mat-select formControlName="accountId" required>
            <mat-option *ngFor="let account of data.accounts; trackBy: trackAccountById" [value]="account.id">{{ account.accountNumber }}</mat-option>
          </mat-select>
          <mat-error *ngIf="transactionForm.get('accountId')?.hasError('required') && transactionForm.get('accountId')?.touched">Account is required</mat-error>
        </mat-form-field>

        <mat-form-field>
          <mat-label>Type</mat-label>
          <mat-select formControlName="type" required>
            <mat-option *ngFor="let type of TransactionType | keyvalue; trackBy: trackTypeByKey" [value]="type.value">{{ type.value }}</mat-option>
          </mat-select>
          <mat-error *ngIf="transactionForm.get('type')?.hasError('required') && transactionForm.get('type')?.touched">Type is required</mat-error>
        </mat-form-field>

        <mat-form-field>
          <mat-label>Amount</mat-label>
          <input matInput type="number" formControlName="amount" required>
          <mat-error *ngIf="transactionForm.get('amount')?.hasError('required') && transactionForm.get('amount')?.touched">Amount is required</mat-error>
          <mat-error *ngIf="transactionForm.get('amount')?.hasError('min') && transactionForm.get('amount')?.touched">Amount must be greater than 0</mat-error>
        </mat-form-field>

        <mat-form-field>
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" required></textarea>
          <mat-error *ngIf="transactionForm.get('description')?.hasError('required') && transactionForm.get('description')?.touched">Description is required</mat-error>
        </mat-form-field>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">Cancel</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="!transactionForm.valid">
          {{ data.transaction ? 'Update' : 'Create' }}
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [`
    mat-dialog-content {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      min-width: 300px;
    }

    mat-form-field {
      width: 100%;
    }
  `]
})
export class TransaccionDialogComponent implements OnInit {
  transactionForm: FormGroup;
  readonly TransactionType = TransactionType;

  constructor(
    private readonly dialogRef: MatDialogRef<TransaccionDialogComponent>,
    private readonly transactionService: TransaccionService,
    private readonly fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.transactionForm = this.fb.group({
      accountId: ['', Validators.required],
      type: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(0)]],
      description: ['', Validators.required]
    });

    if (data.transaction) {
      this.transactionForm.patchValue({
        accountId: data.transaction.accountId,
        type: data.transaction.type,
        amount: data.transaction.amount,
        description: data.transaction.description
      });
    }
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.transactionForm.valid) {
      const formData: TransactionFormData = this.transactionForm.value;

      if (this.data.transaction) {
        this.transactionService.updateTransaction(this.data.transaction.id, formData).subscribe({
          next: () => this.dialogRef.close(true),
          error: (error) => console.error('Error updating transaction:', error)
        });
      } else {
        this.transactionService.createTransaction(formData).subscribe({
          next: () => this.dialogRef.close(true),
          error: (error) => console.error('Error creating transaction:', error)
        });
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  trackAccountById(_: number, account: Account): string {
    return account.id;
  }

  trackTypeByKey(_: number, type: { key: string; value: string }): string {
    return type.key;
  }
}
