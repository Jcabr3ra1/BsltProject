import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { CuentaService } from '../../../../core/services/finanzas';
import { Cuenta } from '../../../../core/models/finanzas/cuenta.model';

@Component({
  selector: 'app-cuenta-list',
  templateUrl: './cuenta-list.component.html',
  styleUrls: ['./cuenta-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDialogModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ]
})
export class CuentaListComponent implements OnInit {
  cuentas: Cuenta[] = [];
  displayedColumns: string[] = ['numero_cuenta', 'saldo', 'estado', 'acciones'];
  isLoading = false;

  constructor(
    private cuentaService: CuentaService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadCuentas();
  }

  loadCuentas(): void {
    this.isLoading = true;
    this.cuentaService.getCuentas().subscribe({
      next: (cuentas: Cuenta[]) => {
        this.cuentas = cuentas;
        this.isLoading = false;
      },
      error: (error: Error) => {
        console.error('Error al cargar cuentas:', error);
        this.snackBar.open('Error al cargar las cuentas', 'Cerrar', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  crearCuenta(): void {
    // Implement dialog for creating new account
  }

  editarCuenta(cuenta: Cuenta): void {
    // Implement dialog for editing account
  }

  verTransacciones(cuenta: Cuenta): void {
    // Navigate to transactions view for this account
  }

  verBolsillos(cuenta: Cuenta): void {
    // Navigate to pockets view for this account
  }

  verDetalles(cuenta: Cuenta): void {
    // Por implementar: Mostrar detalles de la cuenta
    console.log('Ver detalles de cuenta:', cuenta);
  }

  verMovimientos(cuenta: Cuenta): void {
    // Por implementar: Mostrar movimientos de la cuenta
    console.log('Ver movimientos de cuenta:', cuenta);
  }
}
