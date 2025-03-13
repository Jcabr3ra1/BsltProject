import { Component, Input, Output, EventEmitter, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Transaction, TransactionType, TransactionStatus } from '@core/models/finanzas/transaccion.model';

@Component({
  selector: 'app-transaccion-list',
  templateUrl: './transaccion-list.component.html',
  styleUrls: ['./transaccion-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ]
})
export class TransaccionListComponent implements AfterViewInit {
  @Input() set transacciones(value: Transaction[]) {
    this._transacciones = value;
    this.dataSource.data = this._transacciones;
  }
  get transacciones(): Transaction[] {
    return this._transacciones;
  }

  @Output() transactionSelected = new EventEmitter<Transaction>();
  @Output() transaccionCreated = new EventEmitter<void>();
  @Output() transaccionUpdated = new EventEmitter<Transaction>();

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns: string[] = ['id', 'tipo', 'monto', 'estado', 'descripcion', 'createdAt', 'acciones'];
  dataSource = new MatTableDataSource<Transaction>([]);
  private _transacciones: Transaction[] = [];

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  onViewTransaction(transaction: Transaction): void {
    this.transactionSelected.emit(transaction);
  }

  onCreateClick(): void {
    this.transaccionCreated.emit();
  }

  onEditClick(transaccion: Transaction): void {
    this.transaccionUpdated.emit(transaccion);
  }

  getEstadoClass(estado: string): string {
    switch (estado.toUpperCase()) {
      case 'APROBADA':
        return 'status-approved';
      case 'PENDIENTE':
        return 'status-pending';
      case 'RECHAZADA':
        return 'status-rejected';
      case 'CANCELADA':
        return 'status-cancelled';
      default:
        return '';
    }
  }

  getTypeIcon(type: TransactionType): string {
    switch (type) {
      case TransactionType.BANCO_CUENTA:
      case TransactionType.BANCO_BOLSILLO:
        return 'arrow_downward';
      case TransactionType.CUENTA_BANCO:
        return 'arrow_upward';
      case TransactionType.CUENTA_CUENTA:
      case TransactionType.CUENTA_BOLSILLO:
      case TransactionType.BOLSILLO_CUENTA:
        return 'swap_horiz';
      default:
        return 'help';
    }
  }

  getTypeDescription(type: TransactionType): string {
    switch (type) {
      case TransactionType.CUENTA_CUENTA:
        return 'Transferencia entre Cuentas';
      case TransactionType.CUENTA_BOLSILLO:
        return 'Transferencia a Bolsillo';
      case TransactionType.BOLSILLO_CUENTA:
        return 'Transferencia de Bolsillo a Cuenta';
      case TransactionType.BANCO_CUENTA:
        return 'Consignación a Cuenta';
      case TransactionType.BANCO_BOLSILLO:
        return 'Consignación a Bolsillo';
      case TransactionType.CUENTA_BANCO:
        return 'Retiro a Banco';
      default:
        return 'Transacción';
    }
  }

  formatMonto(monto: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(monto);
  }
}
