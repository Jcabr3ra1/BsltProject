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
            <input matInput formControlName="numero" required>
            @if (accountForm.get('numero')?.errors?.['required'] && accountForm.get('numero')?.touched) {
              <mat-error>Account number is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="fill">
            <mat-label>Type</mat-label>
            <mat-select formControlName="tipo" required>
              @for (type of accountTypes; track type) {
                <mat-option [value]="type">{{ type }}</mat-option>
              }
            </mat-select>
            @if (accountForm.get('tipo')?.errors?.['required'] && accountForm.get('tipo')?.touched) {
              <mat-error>Account type is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="fill">
            <mat-label>Balance</mat-label>
            <input matInput type="number" formControlName="saldo" required>
            @if (accountForm.get('saldo')?.errors?.['required'] && accountForm.get('saldo')?.touched) {
              <mat-error>Balance is required</mat-error>
            }
            @if (accountForm.get('saldo')?.errors?.['min']) {
              <mat-error>Balance cannot be negative</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="fill">
            <mat-label>Status</mat-label>
            <mat-select formControlName="estado" required>
              @for (status of accountStatuses; track status) {
                <mat-option [value]="status">{{ status }}</mat-option>
              }
            </mat-select>
            @if (accountForm.get('estado')?.errors?.['required'] && accountForm.get('estado')?.touched) {
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
      numero: ['', Validators.required],
      tipo: [AccountType.CUENTA, Validators.required],
      saldo: [0, [Validators.required, Validators.min(0)]],
      estado: [AccountStatus.ACTIVE, Validators.required]
    });

    if (data.account) {
      this.accountForm.patchValue({
        numero: data.account.numero,
        tipo: data.account.tipo,
        saldo: data.account.saldo,
        estado: data.account.estado
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
