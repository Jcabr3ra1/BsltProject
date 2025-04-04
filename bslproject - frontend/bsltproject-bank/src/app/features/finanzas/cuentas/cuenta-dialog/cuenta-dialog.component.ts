import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Account, AccountType } from '@core/models/finanzas/cuenta.model';

interface DialogData {
  account?: Account;
  userId?: string;
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
    MatProgressSpinnerModule,
    MatIconModule,
    MatDividerModule,
    MatTooltipModule
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2 class="dialog-title">{{ data.account ? 'Editar' : 'Crear' }} Cuenta</h2>
        <button mat-icon-button mat-dialog-close class="close-button">
          <mat-icon>close</mat-icon>
        </button>
      </div>
      
      <mat-divider></mat-divider>
      
      <div class="dialog-content">
        @if (loading) {
          <div class="loading-container">
            <mat-progress-spinner mode="indeterminate" diameter="40"></mat-progress-spinner>
            <span>Procesando...</span>
          </div>
        } @else {
          <div class="form-icon">
            <mat-icon>{{ isBolsillo(accountForm.get('tipo')?.value) ? 'savings' : 'account_balance' }}</mat-icon>
          </div>
          
          <form [formGroup]="accountForm">
            <mat-form-field appearance="outline">
              <mat-label>Número de cuenta</mat-label>
              <input matInput formControlName="numero" required>
              <mat-icon matSuffix>credit_card</mat-icon>
              @if (accountForm.get('numero')?.errors?.['required'] && accountForm.get('numero')?.touched) {
                <mat-error>El número de cuenta es requerido</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Tipo de cuenta</mat-label>
              <mat-select formControlName="tipo" required (selectionChange)="onTypeChange($event.value)">
                @for (type of accountTypes; track type) {
                  <mat-option [value]="type">{{ getTypeDisplay(type) }}</mat-option>
                }
              </mat-select>
              <mat-icon matSuffix>account_balance_wallet</mat-icon>
              @if (accountForm.get('tipo')?.errors?.['required'] && accountForm.get('tipo')?.touched) {
                <mat-error>El tipo de cuenta es requerido</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Saldo</mat-label>
              <input matInput type="number" formControlName="saldo" required>
              <span matPrefix>$&nbsp;</span>
              <mat-icon matSuffix>payments</mat-icon>
              @if (accountForm.get('saldo')?.errors?.['required'] && accountForm.get('saldo')?.touched) {
                <mat-error>El saldo es requerido</mat-error>
              }
              @if (accountForm.get('saldo')?.errors?.['min']) {
                <mat-error>El saldo no puede ser negativo</mat-error>
              }
            </mat-form-field>
          </form>
        }
      </div>
      
      <mat-divider></mat-divider>
      
      <div class="dialog-actions">
        <button mat-button (click)="onCancel()" class="cancel-button">
          Cancelar
        </button>
        <button mat-raised-button color="primary" 
                [disabled]="accountForm.invalid || loading"
                (click)="onSubmit()" class="submit-button">
          <mat-icon>{{ data.account ? 'save' : 'add_circle' }}</mat-icon>
          {{ data.account ? 'Actualizar' : 'Crear' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .dialog-container {
      display: flex;
      flex-direction: column;
      max-height: 90vh;
    }
    
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
    }
    
    .dialog-title {
      margin: 0;
      font-size: 24px;
      color: #2c3e50;
      font-weight: 500;
    }
    
    .close-button {
      margin-right: -12px;
    }
    
    .dialog-content {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
      min-width: 450px;
    }
    
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      padding: 32px 0;
    }
    
    form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .form-icon {
      display: flex;
      justify-content: center;
      margin-bottom: 16px;
    }
    
    .form-icon mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #2196f3;
    }
    
    mat-form-field {
      width: 100%;
    }
    
    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 24px;
    }
    
    .submit-button {
      display: flex;
      align-items: center;
      gap: 8px;
      background-color: #4caf50;
      color: white;
    }
    
    @media (max-width: 576px) {
      .dialog-content {
        min-width: 300px;
      }
    }
  `]
})
export class CuentaDialogComponent {
  accountForm: FormGroup;
  loading = false;
  
  accountTypes = Object.values(AccountType);
  
  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<CuentaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.accountForm = this.fb.group({
      numero: [data.account?.numero || '', Validators.required],
      tipo: [data.account?.tipo || AccountType.CUENTA_CORRIENTE, Validators.required],
      saldo: [data.account?.saldo || 0, [Validators.required, Validators.min(0)]]
    });
  }
  
  onTypeChange(type: AccountType): void {
    // No se utiliza esta función en el código actual
  }
  
  getTypeDisplay(type: AccountType): string {
    switch (type) {
      case AccountType.CUENTA_CORRIENTE:
        return 'Cuenta Corriente';
      case AccountType.CUENTA_AHORRO:
        return 'Cuenta de Ahorro';
      case AccountType.CUENTA_NOMINA:
        return 'Cuenta Nómina';
      case AccountType.CUENTA_INFANTIL:
        return 'Cuenta Infantil';
      case AccountType.CUENTA_JOVEN:
        return 'Cuenta Joven';
      case AccountType.BOLSILLO:
        return 'Bolsillo';
      default:
        return type;
    }
  }
  
  isBolsillo(type: AccountType): boolean {
    return type === AccountType.BOLSILLO;
  }
  
  onSubmit(): void {
    if (this.accountForm.invalid) return;
    
    this.loading = true;
    
    const formValue = this.accountForm.value;
    const account: Account = {
      id: this.data.account?.id || '',
      numero: formValue.numero,
      tipo: formValue.tipo,
      saldo: formValue.saldo,
      // No asignamos usuario al crear la cuenta
      userId: this.data.account?.userId || ''
    };
    
    console.log('Enviando cuenta desde diálogo:', account);
    this.dialogRef.close(account);
  }
  
  onCancel(): void {
    this.dialogRef.close();
  }
}
