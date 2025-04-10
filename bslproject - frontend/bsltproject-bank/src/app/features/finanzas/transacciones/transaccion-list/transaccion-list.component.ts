import { Component, OnInit, Input, Output, EventEmitter, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';

import { Transaccion, EstadoTransaccion, TipoTransaccion } from '@core/models/finanzas/transaccion.model';
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
  @Input() transacciones: Transaccion[] = [];
  @Output() transaccionSeleccionada = new EventEmitter<Transaccion>();
  @Output() crearTransaccion = new EventEmitter<void>();

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  columnasVisibles: string[] = ['fecha', 'tipo', 'monto', 'estado', 'acciones'];
  fuenteDatos = new MatTableDataSource<Transaccion>([]);

  readonly TipoTransaccion = TipoTransaccion;
  readonly EstadoTransaccion = EstadoTransaccion;

  constructor(private readonly dialog: MatDialog) {}

  ngOnInit(): void {
    this.actualizarFuenteDatos();
  }

  ngAfterViewInit(): void {
    this.fuenteDatos.sort = this.sort;
    this.fuenteDatos.paginator = this.paginator;
  }

  // Actualizar cuando cambian las entradas
  ngOnChanges(): void {
    this.actualizarFuenteDatos();
  }
  
  actualizarFuenteDatos(): void {
    this.fuenteDatos.data = this.transacciones;
    if (this.sort) {
      this.fuenteDatos.sort = this.sort;
    }
    if (this.paginator) {
      this.fuenteDatos.paginator = this.paginator;
    }
  }

  verTransaccion(transaccion: Transaccion): void {
    this.transaccionSeleccionada.emit(transaccion);
  }

  nuevaTransaccion(): void {
    this.crearTransaccion.emit();
  }

  getNombreTipo(tipo: string): string {
    if (!tipo) return 'Desconocido';
    
    // Normalizar el tipo para manejar diferentes formatos
    const tipoNormalizado = tipo.toUpperCase();
    
    switch (tipoNormalizado) {
      case TipoTransaccion.CUENTA_CUENTA:
        return 'Entre Cuentas';
      case TipoTransaccion.CUENTA_BOLSILLO:
        return 'A Bolsillo';
      case TipoTransaccion.BOLSILLO_CUENTA:
        return 'De Bolsillo a Cuenta';
      case TipoTransaccion.BANCO_CUENTA:
        return 'Consignación a Cuenta';
      case TipoTransaccion.BANCO_BOLSILLO:
        return 'Consignación a Bolsillo';
      case TipoTransaccion.CUENTA_BANCO:
        return 'Retiro a Banco';
      default:
        // Si no coincide con ninguno de los tipos conocidos, intentar inferir
        if (tipoNormalizado.includes('CUENTA') && tipoNormalizado.includes('CUENTA')) {
          return 'Entre Cuentas';
        } else if (tipoNormalizado.includes('BOLSILLO')) {
          return 'Operación con Bolsillo';
        } else if (tipoNormalizado.includes('BANCO')) {
          return 'Operación Bancaria';
        }
        return tipo;
    }
  }

  getNombreEstado(estado: string): string {
    if (!estado) return 'Desconocido';
    
    // Normalizar el estado para manejar diferentes formatos
    const estadoNormalizado = estado.toUpperCase();
    
    switch (estadoNormalizado) {
      case this.EstadoTransaccion.APROBADA:
      case this.EstadoTransaccion.COMPLETADA:
      case 'APPROVED':
      case 'COMPLETED':
        return 'Aprobada';
      case this.EstadoTransaccion.PENDIENTE:
      case 'PENDING':
        return 'Pendiente';
      case this.EstadoTransaccion.RECHAZADA:
      case 'REJECTED':
        return 'Rechazada';
      case this.EstadoTransaccion.CANCELADA:
      case 'CANCELED':
      case 'CANCELLED':
        return 'Cancelada';
      default:
        return estado;
    }
  }

  getClaseEstado(estado: string): string {
    if (!estado) return 'estado-desconocido';
    
    // Normalizar el estado para manejar diferentes formatos
    const estadoNormalizado = estado.toUpperCase();
    
    switch (estadoNormalizado) {
      case this.EstadoTransaccion.APROBADA:
      case this.EstadoTransaccion.COMPLETADA:
      case 'APPROVED':
      case 'COMPLETED':
        return 'estado-aprobada';
      case this.EstadoTransaccion.PENDIENTE:
      case 'PENDING':
        return 'estado-pendiente';
      case this.EstadoTransaccion.RECHAZADA:
      case 'REJECTED':
        return 'estado-rechazada';
      case this.EstadoTransaccion.CANCELADA:
      case 'CANCELED':
      case 'CANCELLED':
        return 'estado-cancelada';
      default:
        return 'estado-desconocido';
    }
  }

  formatearMonto(monto: number): string {
    // Manejar valores nulos o indefinidos
    if (monto === null || monto === undefined) {
      return '$0';
    }
    
    // Asegurar que monto sea un número
    const montoNumerico = typeof monto === 'string' ? parseFloat(monto) : monto;
    
    // Si no es un número válido después de la conversión, devolver $0
    if (isNaN(montoNumerico)) {
      return '$0';
    }
    
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(montoNumerico);
  }
}
