import { Component, OnInit, Input, Output, EventEmitter, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';

import { Transaction, TransactionStatus, TransactionType } from '@core/models/finanzas/transaccion.model';
import { TransaccionFormComponent } from '../transaccion-form/transaccion-form.component';

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
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ]
})
export class TransaccionListComponent implements OnInit, AfterViewInit {
  @Input() transacciones: Transaction[] = [];
  @Output() transactionSelected = new EventEmitter<Transaction>();
  @Output() createTransaction = new EventEmitter<void>();

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns: string[] = ['fecha', 'tipo', 'monto', 'estado', 'acciones'];
  dataSource = new MatTableDataSource<Transaction>([]);

  readonly TransactionType = TransactionType;
  readonly TransactionStatus = TransactionStatus;

  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {
    this.updateDataSource();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  // Update when input changes
  ngOnChanges(): void {
    this.updateDataSource();
  }
  
  updateDataSource(): void {
    this.dataSource.data = this.transacciones;
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  onViewTransaction(transaction: Transaction): void {
    this.transactionSelected.emit(transaction);
  }

  onCreateTransaction(): void {
    this.createTransaction.emit();
  }

  getNombreTipo(tipo: string): string {
    switch (tipo) {
      case TransactionType.CUENTA_CUENTA:
        return 'Entre Cuentas';
      case TransactionType.CUENTA_BOLSILLO:
        return 'A Bolsillo';
      case TransactionType.BOLSILLO_CUENTA:
        return 'De Bolsillo a Cuenta';
      case TransactionType.BANCO_CUENTA:
        return 'Consignación a Cuenta';
      case TransactionType.BANCO_BOLSILLO:
        return 'Consignación a Bolsillo';
      case TransactionType.CUENTA_BANCO:
        return 'Retiro a Banco';
      default:
        return tipo;
    }
  }

  getNombreEstado(estado: string): string {
    switch (estado) {
      case TransactionStatus.APPROVED:
        return 'Aprobada';
      case TransactionStatus.PENDING:
        return 'Pendiente';
      case TransactionStatus.REJECTED:
        return 'Rechazada';
      case TransactionStatus.CANCELLED:
        return 'Cancelada';
      default:
        return estado;
    }
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case TransactionStatus.APPROVED:
        return 'status-approved';
      case TransactionStatus.PENDING:
        return 'status-pending';
      case TransactionStatus.REJECTED:
        return 'status-rejected';
      case TransactionStatus.CANCELLED:
        return 'status-cancelled';
      default:
        return '';
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
