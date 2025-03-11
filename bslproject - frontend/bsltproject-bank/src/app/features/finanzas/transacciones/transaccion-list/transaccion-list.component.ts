import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule, MatCardContent } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TransaccionService, CuentaService, TipoTransaccionService } from '../../../../core/services/finanzas';
import { Transaccion, TipoTransaccion } from '../../../../core/models/finanzas/transaccion.model';
import { Cuenta } from '../../../../core/models/finanzas/cuenta.model';
import { TransaccionDialogComponent } from '../transaccion-dialog/transaccion-dialog.component';

@Component({
  selector: 'app-transaccion-list',
  templateUrl: './transaccion-list.component.html',
  styleUrls: ['./transaccion-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatCardModule,
    MatCardContent,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule,
    MatPaginatorModule,
    MatTooltipModule
  ]
})
export class TransaccionListComponent implements OnInit {
  transacciones: Transaccion[] = [];
  cuentas: Cuenta[] = [];
  tiposTransaccion: TipoTransaccion[] = [];
  cuentaSeleccionadaId: string = '';
  fechaInicio?: Date;
  fechaFin?: Date;
  tipoSeleccionado: string = '';
  isLoading = false;
  displayedColumns: string[] = [
    'fecha',
    'monto',
    'tipo',
    'descripcion',
    'estado',
    'acciones'
  ];

  constructor(
    private transaccionService: TransaccionService,
    private cuentaService: CuentaService,
    private tipoTransaccionService: TipoTransaccionService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.cargarCuentas();
    this.cargarTiposTransaccion();
  }

  cargarCuentas(): void {
    this.isLoading = true;
    this.cuentaService.getCuentas().subscribe({
      next: (cuentas) => {
        this.cuentas = cuentas;
        if (cuentas.length > 0) {
          this.cuentaSeleccionadaId = cuentas[0].id;
          this.cargarTransacciones();
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar cuentas:', error);
        this.mostrarError('Error al cargar las cuentas');
        this.isLoading = false;
      }
    });
  }

  cargarTiposTransaccion(): void {
    this.tipoTransaccionService.getTiposTransaccion().subscribe({
      next: (tipos) => {
        this.tiposTransaccion = tipos;
      },
      error: (error) => {
        console.error('Error al cargar tipos de transacción:', error);
        this.mostrarError('Error al cargar los tipos de transacción');
      }
    });
  }

  cargarTransacciones(): void {
    if (!this.cuentaSeleccionadaId) return;

    this.isLoading = true;
    this.transaccionService.getTransaccionesPorCuenta(this.cuentaSeleccionadaId).subscribe({
      next: (transacciones) => {
        this.transacciones = transacciones;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar transacciones:', error);
        this.mostrarError('Error al cargar las transacciones');
        this.isLoading = false;
      }
    });
  }

  filtrarTransacciones(): void {
    if (!this.cuentaSeleccionadaId) return;

    this.isLoading = true;
    this.transaccionService.getHistorialTransacciones(
      this.fechaInicio,
      this.fechaFin,
      this.tipoSeleccionado
    ).subscribe({
      next: (transacciones) => {
        this.transacciones = transacciones;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al filtrar transacciones:', error);
        this.mostrarError('Error al filtrar las transacciones');
        this.isLoading = false;
      }
    });
  }

  crearTransaccion(): void {
    const dialogRef = this.dialog.open(TransaccionDialogComponent, {
      width: '500px',
      data: { cuentaId: this.cuentaSeleccionadaId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarTransacciones();
      }
    });
  }

  anularTransaccion(id: string): void {
    if (confirm('¿Está seguro de anular esta transacción?')) {
      this.isLoading = true;
      this.transaccionService.anularTransaccion(id).subscribe({
        next: () => {
          this.mostrarExito('Transacción anulada exitosamente');
          this.cargarTransacciones();
        },
        error: (error) => {
          console.error('Error al anular transacción:', error);
          this.mostrarError('Error al anular la transacción');
          this.isLoading = false;
        }
      });
    }
  }

  private mostrarExito(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private mostrarError(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  onCuentaChange(): void {
    this.cargarTransacciones();
  }

  limpiarFiltros(): void {
    this.fechaInicio = undefined;
    this.fechaFin = undefined;
    this.tipoSeleccionado = '';
    this.cargarTransacciones();
  }

  getTipoTransaccion(id: string | number | undefined): string {
    if (!id) return 'Desconocido';
    
    // Convertir id a string para asegurar la comparación correcta
    const idStr = id.toString();
    const tipo = this.tiposTransaccion.find(t => t.id && t.id.toString() === idStr);
    return tipo ? tipo.nombre : 'Desconocido';
  }

  getNombreCuenta(cuentaId: string | number | undefined): string {
    if (!cuentaId) return 'N/A';
    
    // Convertir cuentaId a string para asegurar la comparación correcta
    const cuentaIdStr = cuentaId.toString();
    const cuenta = this.cuentas.find(c => c.id && c.id.toString() === cuentaIdStr);
    return cuenta ? cuenta.numero || 'Sin número' : 'N/A';
  }

  // Tracking functions for ngFor
  trackCuentaById(index: number, cuenta: Cuenta): string {
    return cuenta.id;
  }

  trackTipoById(index: number, tipo: TipoTransaccion): string {
    return tipo.id;
  }
}
