import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { TransaccionService } from '@core/services/finanzas/transaccion.service';
import { Transaction, TransactionType } from '@core/models/finanzas/transaccion.model';
import { TransaccionListComponent } from './transaccion-list/transaccion-list.component';

@Component({
  selector: 'app-transacciones',
  templateUrl: './transacciones.component.html',
  styleUrls: ['./transacciones.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatSnackBarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    TransaccionListComponent
  ]
})
export class TransaccionesComponent implements OnInit {
  transacciones: Transaction[] = [];
  loading = false;
  error: string | null = null;
  TransactionType = TransactionType;

  constructor(
    private transaccionService: TransaccionService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.loading = true;
    this.error = null;

    this.transaccionService.getTransactions().subscribe({
      next: (transactions) => {
        this.transacciones = transactions;
        this.loading = false;
      },
      error: (error) => {
        this.error = error.message;
        this.loading = false;
        this.showErrorMessage(error.message);
      }
    });
  }

  onCreateTransaction(type: TransactionType): void {
    import('./transaccion-form/transaccion-form.component').then(({ TransaccionFormComponent }) => {
      const dialogRef = this.dialog.open(TransaccionFormComponent, {
        width: '500px',
        data: { tipo: type }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.loadTransactions();
          this.showSuccessMessage('Transacción creada exitosamente');
        }
      });
    });
  }

  onTransactionUpdated(transaction: Transaction): void {
    import('./transaccion-form/transaccion-form.component').then(({ TransaccionFormComponent }) => {
      this.dialog.open(TransaccionFormComponent, {
        width: '500px',
        data: { transaction, readonly: true }
      });
    });
  }

  private showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }

  private showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }
}
