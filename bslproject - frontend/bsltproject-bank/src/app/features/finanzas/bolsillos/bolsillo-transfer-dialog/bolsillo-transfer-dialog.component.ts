import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Pocket } from '@core/models/finanzas/cuenta.model';

@Component({
  selector: 'app-bolsillo-transfer-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule
  ],
  template: `
    <h2 mat-dialog-title>Transfer to Pocket</h2>
    <mat-dialog-content>
      <form [formGroup]="transferForm">
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Amount</mat-label>
          <input matInput type="number" formControlName="amount" min="0">
          <mat-error *ngIf="transferForm.get('amount')?.hasError('required')">Amount is required</mat-error>
          <mat-error *ngIf="transferForm.get('amount')?.hasError('min')">Amount must be greater than 0</mat-error>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Description</mat-label>
          <input matInput formControlName="description">
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" 
              [disabled]="!transferForm.valid"
              (click)="onSubmit()">
        Transfer
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width {
      width: 100%;
      margin-bottom: 1rem;
    }
  `]
})
export class BolsilloTransferDialogComponent {
  transferForm: FormGroup;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly dialogRef: MatDialogRef<BolsilloTransferDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { pocket: Pocket }
  ) {
    this.transferForm = this.formBuilder.group({
      amount: ['', [Validators.required, Validators.min(0)]],
      description: ['']
    });
  }

  onSubmit(): void {
    if (this.transferForm.valid) {
      this.dialogRef.close(this.transferForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
