import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { TransaccionService } from '@core/services/finanzas/transaccion.service';
import { Transaction, TransactionType } from '@core/models/finanzas/transaccion.model';
import { Account } from '@core/models/finanzas/cuenta.model';

interface DialogData {
  tipo: TransactionType;
  transaction?: Transaction;
  readonly?: boolean;
}

@Component({
  selector: 'app-transaccion-form',
  templateUrl: './transaccion-form.component.html',
  styleUrls: ['./transaccion-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ]
})
export class TransaccionFormComponent implements OnInit {
  transaccionForm: FormGroup;
  loading = false;
  error: string | null = null;
  cuentasOrigen: Account[] = [];
  cuentasDestino: Account[] = [];
  tipoTransaccion: TransactionType;

  constructor(
    private fb: FormBuilder,
    private transaccionService: TransaccionService,
    private dialogRef: MatDialogRef<TransaccionFormComponent>,
    @Inject(MAT_DIALOG_DATA) private data: DialogData
  ) {
    this.tipoTransaccion = data.tipo;
    this.transaccionForm = this.fb.group({
      cuentaOrigen: ['', this.needsOrigen() ? Validators.required : null],
      cuentaDestino: ['', this.needsDestino() ? Validators.required : null],
      monto: ['', [Validators.required, Validators.min(1000)]],
      descripcion: ['', [Validators.required, Validators.maxLength(200)]]
    });

    if (data.readonly) {
      this.transaccionForm.disable();
    }

    if (data.transaction) {
      this.transaccionForm.patchValue(data.transaction);
    }
  }

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.loading = true;
    this.transaccionService.getAccounts().subscribe({
      next: (accounts) => {
        // Filtrar cuentas según el tipo de transacción
        if (this.needsOrigen()) {
          this.cuentasOrigen = accounts.filter(account => 
            this.tipoTransaccion === TransactionType.CUENTA_BOLSILLO ? 
            account.tipo === 'CUENTA' : 
            account.tipo === 'BOLSILLO'
          );
        }

        if (this.needsDestino()) {
          this.cuentasDestino = accounts.filter(account => 
            this.tipoTransaccion === TransactionType.CUENTA_BOLSILLO ? 
            account.tipo === 'BOLSILLO' : 
            account.tipo === 'CUENTA'
          );
        }

        this.loading = false;
      },
      error: (error) => {
        this.error = error.message;
        this.loading = false;
      }
    });
  }

  getTitulo(): string {
    if (this.data.readonly) {
      return 'Detalles de la Transacción';
    }

    switch (this.tipoTransaccion) {
      case TransactionType.CUENTA_CUENTA:
        return 'Transferir entre Cuentas';
      case TransactionType.CUENTA_BOLSILLO:
        return 'Transferir a Bolsillo';
      case TransactionType.BOLSILLO_CUENTA:
        return 'Transferir de Bolsillo a Cuenta';
      case TransactionType.BANCO_CUENTA:
        return 'Consignar a Cuenta';
      case TransactionType.BANCO_BOLSILLO:
        return 'Consignar a Bolsillo';
      case TransactionType.CUENTA_BANCO:
        return 'Retirar a Banco';
      default:
        return 'Nueva Transacción';
    }
  }

  needsOrigen(): boolean {
    return ![TransactionType.BANCO_CUENTA, TransactionType.BANCO_BOLSILLO].includes(this.tipoTransaccion);
  }

  needsDestino(): boolean {
    return this.tipoTransaccion !== TransactionType.CUENTA_BANCO;
  }

  getErrorMessage(field: string): string {
    const control = this.transaccionForm.get(field);
    if (!control) return '';

    if (control.hasError('required')) {
      return 'Este campo es requerido';
    }

    if (control.hasError('min')) {
      return 'El monto mínimo es $1,000';
    }

    if (control.hasError('maxlength')) {
      return 'La descripción no puede exceder los 200 caracteres';
    }

    return '';
  }

  onSubmit(): void {
    if (this.transaccionForm.invalid || this.loading) {
      return;
    }

    this.loading = true;
    const formValue = this.transaccionForm.value;

    const transaction = {
      tipo: this.tipoTransaccion,
      monto: formValue.monto,
      descripcion: formValue.descripcion,
      cuentaOrigenId: formValue.cuentaOrigen,
      cuentaDestinoId: formValue.cuentaDestino
    };

    this.transaccionService.createTransaction(transaction).subscribe({
      next: () => {
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.error = error.message;
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
