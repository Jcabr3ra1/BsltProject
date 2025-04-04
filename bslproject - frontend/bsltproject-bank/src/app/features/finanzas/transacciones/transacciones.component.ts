import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Subscription, finalize, take } from 'rxjs';
import { Router } from '@angular/router';


import { TransaccionFormComponent } from './transaccion-form/transaccion-form.component';
import { TransaccionService } from '../../../core/services/finanzas/transaccion.service';
import { Transaction, TransactionType, TransactionStatus, TransactionFilters } from '../../../core/models/finanzas/transaccion.model';
import { AuthService } from '../../../core/services/seguridad/auth.service';
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
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    TransaccionListComponent
  ]
})
export class TransaccionesComponent implements OnInit, OnDestroy {
  // Exponer enums para el template
  readonly TransactionType = TransactionType;
  readonly TransactionStatus = TransactionStatus;

  // Estado de la aplicación
  transacciones: Transaction[] = [];
  transaccionesFiltradas: Transaction[] = [];
  loading = false;
  error: string | null = null;
  
  // For compatibility with spec file
  transactions: Transaction[] = [];
  
  // Formulario de filtros
  filterForm: FormGroup;
  activeFilters = false;
  
  // Estadísticas
  totalTransacciones = 0;
  totalMonto = 0;
  totalAprobadas = 0;
  totalPendientes = 0;
  totalRechazadas = 0;
  
  // Subscripciones
  private subscriptions = new Subscription();

  constructor(
    private readonly transaccionService: TransaccionService,
    private readonly authService: AuthService,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
    private readonly fb: FormBuilder,
    private readonly router: Router
  ) {
    this.filterForm = this.fb.group({
      type: [''],
      status: [''],
      startDate: [null],
      endDate: [null],
      montoMinimo: [null],
      montoMaximo: [null]
    });
  }

  ngOnInit(): void {
    // Verificar si el usuario está autenticado antes de cargar transacciones
    this.verifyUserAndLoadData();
    
    // Suscribirse a cambios en el formulario de filtros
    this.subscriptions.add(
      this.filterForm.valueChanges.subscribe(() => {
        this.applyFilters();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /**
   * Verifica si el usuario está autenticado y carga los datos
   */
  private verifyUserAndLoadData(): void {
    console.log('Verificando autenticación del usuario...');
    
    // Verificar si hay un token
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No hay token de autenticación');
      this.error = 'Debe iniciar sesión para ver sus transacciones';
      this.router.navigate(['/auth/login']);
      return;
    }
    
    // Verificar si hay un usuario en localStorage
    const userJson = localStorage.getItem('user');
    if (!userJson) {
      console.error('No hay información de usuario');
      this.error = 'Información de usuario no disponible';
      this.router.navigate(['/auth/login']);
      return;
    }
    
    try {
      const user = JSON.parse(userJson);
      console.log('Usuario actual:', user);
      
      // Si llegamos aquí, consideramos que el usuario está autenticado
      // Incluso si no tiene ID, intentaremos cargar transacciones
      // y dejaremos que el backend maneje la autenticación
      this.loadTransactions();
      
    } catch (error) {
      console.error('Error al parsear información del usuario:', error);
      this.error = 'Error al procesar información del usuario';
      this.router.navigate(['/auth/login']);
    }
  }

  /**
   * Carga las transacciones del usuario actual
   */
  loadTransactions(): void {
    this.loading = true;
    this.error = null;
    
    console.log('Iniciando carga de transacciones...');
    
    this.subscriptions.add(
      this.transaccionService.getTransactions()
        .pipe(finalize(() => {
          console.log('Finalizando solicitud de transacciones');
          this.loading = false;
        }))
        .subscribe({
          next: (transactions) => {
            console.log('Transacciones recibidas:', transactions);
            this.transacciones = transactions;
            this.transactions = transactions; // Para compatibilidad con spec
            this.applyFilters();
            this.calculateStatistics();
          },
          error: (err) => {
            console.error('Error detallado al cargar transacciones:', err);
            this.error = 'Failed to load transactions. Please try again.';
          }
        })
    );
  }

  /**
   * Abre el diálogo para crear una nueva transacción
   */
  onCreateTransaction(tipo: string): void {
    const dialogRef = this.dialog.open(TransaccionFormComponent, {
      width: '600px',
      data: { tipo }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open('Transacción creada con éxito', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });
        this.loadTransactions();
      }
    });
  }

  /**
   * Maneja la actualización de una transacción
   */
  onTransactionUpdated(transaction: Transaction): void {
    this.snackBar.open('Transacción actualizada', 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
    this.loadTransactions();
  }

  /**
   * Aplica los filtros a las transacciones
   */
  applyFilters(): void {
    const filters = this.filterForm.value as TransactionFilters;
    
    // Verificar si hay filtros activos
    this.activeFilters = Object.values(filters).some(value => 
      value !== null && value !== '' && value !== undefined
    );
    
    // Aplicar filtros
    this.transaccionesFiltradas = this.transacciones.filter(transaction => {
      // Filtro por tipo
      if (filters.type && transaction.tipo !== filters.type) {
        return false;
      }
      
      // Filtro por estado
      if (filters.status && transaction.estado !== filters.status) {
        return false;
      }
      
      // Filtro por fecha inicio
      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        const transactionDate = new Date(transaction.createdAt);
        if (transactionDate < startDate) {
          return false;
        }
      }
      
      // Filtro por fecha fin
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999); // Fin del día
        const transactionDate = new Date(transaction.createdAt);
        if (transactionDate > endDate) {
          return false;
        }
      }
      
      // Filtro por monto mínimo
      if (filters.montoMinimo !== null && filters.montoMinimo !== undefined && transaction.monto < filters.montoMinimo) {
        return false;
      }
      
      // Filtro por monto máximo
      if (filters.montoMaximo !== null && filters.montoMaximo !== undefined && transaction.monto > filters.montoMaximo) {
        return false;
      }
      
      return true;
    });
    
    // Actualizar estadísticas basadas en los filtros
    this.calculateStatistics();
  }

  /**
   * Calcula estadísticas basadas en las transacciones filtradas
   */
  calculateStatistics(): void {
    this.totalTransacciones = this.transaccionesFiltradas.length;
    
    this.totalMonto = this.transaccionesFiltradas.reduce(
      (sum, transaction) => sum + transaction.monto, 
      0
    );
    
    this.totalAprobadas = this.transaccionesFiltradas.filter(
      t => t.estado === TransactionStatus.APPROVED
    ).length;
    
    this.totalPendientes = this.transaccionesFiltradas.filter(
      t => t.estado === TransactionStatus.PENDING
    ).length;
    
    this.totalRechazadas = this.transaccionesFiltradas.filter(
      t => t.estado === TransactionStatus.REJECTED || t.estado === TransactionStatus.CANCELLED
    ).length;
  }

  /**
   * Reinicia todos los filtros
   */
  resetFilters(): void {
    this.filterForm.reset({
      type: '',
      status: '',
      startDate: null,
      endDate: null,
      montoMinimo: null,
      montoMaximo: null
    });
    // No es necesario llamar a applyFilters() porque la suscripción al valueChanges lo hará
  }

  /**
   * Formatea un monto para mostrar en la UI
   */
  formatMonto(monto: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(monto);
  }

  /**
   * Aprueba una transacción
   */
  approveTransaction(transaction: Transaction): void {
    this.transaccionService.approveTransaction(transaction.id).subscribe({
      next: () => {
        this.snackBar.open(
          'Transaction approved successfully',
          'Close',
          { duration: 3000, panelClass: ['success-snackbar'] }
        );
        this.loadTransactions();
      },
      error: (error) => {
        this.snackBar.open(
          'Error approving transaction',
          'Close',
          { duration: 3000, panelClass: ['error-snackbar'] }
        );
        console.error('Error approving transaction:', error);
      }
    });
  }

  /**
   * Rechaza una transacción
   */
  rejectTransaction(transaction: Transaction): void {
    this.transaccionService.rejectTransaction(transaction.id).subscribe({
      next: () => {
        this.snackBar.open(
          'Transaction rejected successfully',
          'Close',
          { duration: 3000, panelClass: ['success-snackbar'] }
        );
        this.loadTransactions();
      },
      error: (error) => {
        this.snackBar.open(
          'Error rejecting transaction',
          'Close',
          { duration: 3000, panelClass: ['error-snackbar'] }
        );
        console.error('Error rejecting transaction:', error);
      }
    });
  }

  /**
   * Elimina una transacción
   */
  deleteTransaction(transaction: Transaction): void {
    if (confirm('Are you sure you want to delete this transaction?')) {
      this.transaccionService.deleteTransaction(transaction.id).subscribe({
        next: () => {
          this.snackBar.open(
            'Transaction deleted successfully',
            'Close',
            { duration: 3000, panelClass: ['success-snackbar'] }
          );
          this.loadTransactions();
        },
        error: (error) => {
          this.snackBar.open(
            'Error deleting transaction',
            'Close',
            { duration: 3000, panelClass: ['error-snackbar'] }
          );
          console.error('Error deleting transaction:', error);
        }
      });
    }
  }
}
