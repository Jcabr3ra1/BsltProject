import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BolsilloService, CuentaService } from '../../../../core/services/finanzas';
import { BolsilloDialogComponent } from '../bolsillo-dialog/bolsillo-dialog.component';
import { BolsilloTransferDialogComponent } from '../bolsillo-transfer-dialog/bolsillo-transfer-dialog.component';
import { Bolsillo } from '../../../../core/models/bolsillo.model';
import { Cuenta } from '../../../../core/models/cuenta.model';

@Component({
  selector: 'app-bolsillo-list',
  templateUrl: './bolsillo-list.component.html',
  styleUrls: ['./bolsillo-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressBarModule,
    MatMenuModule,
    MatChipsModule,
    MatSnackBarModule
  ]
})
export class BolsilloListComponent implements OnInit {
  bolsillos: Bolsillo[] = [];
  cuentas: Cuenta[] = [];
  isLoading = false;
  filtroForm: FormGroup;
  displayedColumns: string[] = ['nombre', 'cuenta', 'saldo', 'meta', 'progreso', 'estado', 'acciones'];

  constructor(
    private bolsilloService: BolsilloService,
    private cuentaService: CuentaService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.filtroForm = this.fb.group({
      cuentaId: ['']
    });
  }

  ngOnInit(): void {
    this.loadBolsillos();
    this.loadCuentas();
    
    this.filtroForm.get('cuentaId')?.valueChanges.subscribe(value => {
      this.filtrarBolsillos(value);
    });
  }

  loadBolsillos(): void {
    this.isLoading = true;
    this.bolsilloService.getBolsillos().subscribe({
      next: (bolsillos: Bolsillo[]) => {
        this.bolsillos = bolsillos;
        this.isLoading = false;
      },
      error: (error: Error) => {
        console.error('Error al cargar bolsillos:', error);
        this.isLoading = false;
        this.mostrarError('Error al cargar los bolsillos');
      }
    });
  }

  loadCuentas(): void {
    this.cuentaService.getCuentas().subscribe({
      next: (cuentas: Cuenta[]) => {
        this.cuentas = cuentas;
      },
      error: (error: Error) => {
        console.error('Error al cargar cuentas:', error);
        this.mostrarError('Error al cargar las cuentas');
      }
    });
  }

  filtrarBolsillos(cuentaId: string): void {
    if (!cuentaId) {
      this.loadBolsillos();
      return;
    }
    
    this.isLoading = true;
    this.bolsilloService.getBolsillosPorCuenta(cuentaId).subscribe({
      next: (bolsillos: Bolsillo[]) => {
        this.bolsillos = bolsillos;
        this.isLoading = false;
      },
      error: (error: Error) => {
        console.error('Error al filtrar bolsillos:', error);
        this.isLoading = false;
        this.mostrarError('Error al filtrar los bolsillos');
      }
    });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(BolsilloDialogComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadBolsillos();
      }
    });
  }

  openTransferDialog(bolsillo: Bolsillo): void {
    const dialogRef = this.dialog.open(BolsilloTransferDialogComponent, {
      width: '400px',
      data: { bolsillo }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadBolsillos();
      }
    });
  }

  cerrarBolsillo(bolsillo: Bolsillo): void {
    if (!bolsillo.id) {
      this.mostrarError('ID de bolsillo no válido');
      return;
    }
    
    if (confirm('¿Está seguro de cerrar este bolsillo? El saldo se transferirá a la cuenta asociada.')) {
      this.isLoading = true;
      this.bolsilloService.cerrarBolsillo(bolsillo.id.toString()).subscribe({
        next: () => {
          this.mostrarExito('Bolsillo cerrado exitosamente');
          this.loadBolsillos();
        },
        error: (error: Error) => {
          console.error('Error al cerrar bolsillo:', error);
          this.isLoading = false;
          this.mostrarError('Error al cerrar el bolsillo');
        }
      });
    }
  }

  calcularPorcentaje(saldo: number, meta: number): number {
    if (meta <= 0) return 0;
    const porcentaje = (saldo / meta) * 100;
    return Math.min(porcentaje, 100);
  }

  getNombreCuenta(cuentaId: string): string {
    const cuenta = this.cuentas.find(c => c.id === cuentaId);
    return cuenta ? cuenta.numero_cuenta : 'N/A';
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
}
