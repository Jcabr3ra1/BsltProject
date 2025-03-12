import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Account, AccountType, AccountStatus } from '@core/models/finanzas/cuenta.model';

interface DialogData {
  account?: Account;
  userId: string;
}

@Component({
  selector: 'app-cuenta-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.account ? 'Edit' : 'Create' }} Account</h2>
    <mat-dialog-content>
      @if (loading) {
        <mat-progress-spinner mode="indeterminate"></mat-progress-spinner>
      } @else {
        <form [formGroup]="accountForm">
          <mat-form-field appearance="fill">
            <mat-label>Account Number</mat-label>
            <input matInput formControlName="accountNumber" required>
            @if (accountForm.get('accountNumber')?.errors?.['required'] && accountForm.get('accountNumber')?.touched) {
              <mat-error>Account number is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="fill">
            <mat-label>Type</mat-label>
            <mat-select formControlName="type" required>
              @for (type of accountTypes; track type) {
                <mat-option [value]="type">{{ type }}</mat-option>
              }
            </mat-select>
            @if (accountForm.get('type')?.errors?.['required'] && accountForm.get('type')?.touched) {
              <mat-error>Account type is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="fill">
            <mat-label>Balance</mat-label>
            <input matInput type="number" formControlName="balance" required>
            @if (accountForm.get('balance')?.errors?.['required'] && accountForm.get('balance')?.touched) {
              <mat-error>Balance is required</mat-error>
            }
            @if (accountForm.get('balance')?.errors?.['min']) {
              <mat-error>Balance cannot be negative</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="fill">
            <mat-label>Status</mat-label>
            <mat-select formControlName="status" required>
              @for (status of accountStatuses; track status) {
                <mat-option [value]="status">{{ status }}</mat-option>
              }
            </mat-select>
            @if (accountForm.get('status')?.errors?.['required'] && accountForm.get('status')?.touched) {
              <mat-error>Status is required</mat-error>
            }
          </mat-form-field>
        </form>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" 
              [disabled]="accountForm.invalid || loading"
              (click)="onSubmit()">
        {{ data.account ? 'Update' : 'Create' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      min-width: 400px;
    }
    form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    mat-progress-spinner {
      margin: 2rem auto;
    }
  `]
})
export class CuentaDialogComponent {
  accountForm: FormGroup;
  loading = false;
  error: string | null = null;

  accountTypes = Object.values(AccountType);
  accountStatuses = Object.values(AccountStatus);

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<CuentaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.accountForm = this.fb.group({
      accountNumber: ['', Validators.required],
      type: [AccountType.SAVINGS, Validators.required],
      balance: [0, [Validators.required, Validators.min(0)]],
      status: [AccountStatus.ACTIVE, Validators.required]
    });

    if (data.account) {
      this.accountForm.patchValue({
        accountNumber: data.account.accountNumber,
        type: data.account.type,
        balance: data.account.balance,
        status: data.account.status
      });
    }
  }

  onSubmit(): void {
    if (this.accountForm.valid) {
      const account: Partial<Account> = {
        ...this.accountForm.value,
        userId: this.data.userId
      };
      this.dialogRef.close(account);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
