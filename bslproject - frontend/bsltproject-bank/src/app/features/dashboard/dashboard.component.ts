import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription, forkJoin, of, catchError, finalize } from 'rxjs';

// Importar servicios reales
import { TransaccionService } from '@core/services/finanzas/transaccion.service';
import { CuentaService } from '@core/services/finanzas/cuenta.service';
import { AuthService } from '@core/services/seguridad/auth.service';
import { CatalogoService } from '@core/services/common/catalogo.service';

// Importar modelos
import { Transaccion, Transaction, EstadoTransaccionEnum } from '@core/models/finanzas/transaccion.model';
import { Cuenta } from '@core/models/finanzas/cuenta.model';

// Interfaces específicas para el dashboard
interface DashboardSummary {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  totalSavings: number;
  balanceChange: number;
  incomeChange: number;
  expenseChange: number;
  savingsChange: number;
}

interface Payment {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  status: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatGridListModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ]
})
export class DashboardComponent implements OnInit, OnDestroy {
  // Fecha actual para mostrar la última actualización
  today: Date = new Date();
  
  // Estados de carga y error
  loading = true;
  error: string | null = null;
  
  // Datos financieros
  summary: DashboardSummary = {
    totalBalance: 0,
    totalIncome: 0,
    totalExpenses: 0,
    totalSavings: 0,
    balanceChange: 0,
    incomeChange: 0,
    expenseChange: 0,
    savingsChange: 0
  };
  
  // Transacciones recientes (procesadas para el dashboard)
  recentTransactions: {
    id: string;
    date: string;
    description: string;
    amount: number;
    type: string;
  }[] = [];
  
  // Próximos pagos
  upcomingPayments: Payment[] = [];
  
  // Cuentas
  accounts: Cuenta[] = [];
  
  // Para exponer enums al template
  readonly EstadoTransaccion = EstadoTransaccionEnum;
  
  // Subscripciones
  private subscriptions = new Subscription();

  constructor(
    private readonly transaccionService: TransaccionService,
    private readonly cuentaService: CuentaService,
    private readonly authService: AuthService,
    private readonly catalogoService: CatalogoService
  ) { }

  ngOnInit(): void {
    // Cargar catálogos primero para tener datos de referencia
    this.subscriptions.add(
      this.catalogoService.cargarTodosCatalogos().subscribe({
        next: () => this.loadDashboardData(),
        error: (error) => {
          console.error('Error al cargar catálogos:', error);
          this.error = 'Error al cargar datos de referencia';
          this.loading = false;
        }
      })
    );
  }
  
  ngOnDestroy(): void {
    // Limpiar todas las subscripciones al destruir el componente
    this.subscriptions.unsubscribe();
  }

  // Método para cargar datos del dashboard
  loadDashboardData(): void {
    this.loading = true;
    this.error = null;
    
    // Obtener ID del usuario actual
    const currentUser = this.authService.currentUserValue;
    if (!currentUser || !currentUser.id) {
      this.error = 'Usuario no autenticado';
      this.loading = false;
      return;
    }
    
    const userId = currentUser.id;
    
    // Usar forkJoin para cargar datos en paralelo
    this.subscriptions.add(
      forkJoin({
        transactions: this.transaccionService.getTransactions(),
        accounts: this.cuentaService.obtenerCuentasPorUsuario(userId),
        upcomingPayments: this.transaccionService.getUpcomingPayments(userId)
      }).pipe(
        catchError(error => {
          console.error('Error al cargar datos del dashboard:', error);
          this.error = 'Error al cargar los datos. Por favor, intente nuevamente.';
          return of({ transactions: [], accounts: [], upcomingPayments: [] });
        }),
        finalize(() => {
          this.loading = false;
        })
      ).subscribe(({ transactions, accounts, upcomingPayments }) => {
        // Procesar transacciones
        this.recentTransactions = this.processTransactions(transactions);
        
        // Procesar cuentas
        this.accounts = accounts;
        
        // Procesar próximos pagos
        this.upcomingPayments = upcomingPayments;
        
        // Calcular resumen financiero
        this.calculateFinancialSummary();
      })
    );
  }
  
  // Procesar transacciones para el dashboard
  private processTransactions(transactions: Transaccion[]): any[] {
    // Ordenar por fecha (más recientes primero) y limitar a 5
    return transactions
      .map(t => ({
        id: t.id || t._id || '',
        date: (t.fecha || t.fecha_transaccion || t.createdAt || new Date()).toString(),
        description: t.descripcion || 'Sin descripción',
        amount: t.monto,
        type: t.tipoMovimiento?.nombre || t.tipo_movimiento?.nombre || 'TRANSFERENCIA'
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }
  
  // Calcular resumen financiero basado en transacciones y cuentas
  private calculateFinancialSummary(): void {
    // Calcular saldo total
    const totalBalance = this.accounts.reduce((total, account) => total + (account.saldo || 0), 0);
    
    // Calcular ingresos y gastos del último mes
    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    
    let totalIncome = 0;
    let totalExpenses = 0;
    
    this.recentTransactions.forEach((transaction: any) => {
      const transactionDate = new Date(transaction.date);
      if (transactionDate >= oneMonthAgo) {
        if (transaction.amount > 0 || transaction.type === 'INGRESO') {
          totalIncome += Math.abs(transaction.amount);
        } else {
          totalExpenses += Math.abs(transaction.amount);
        }
      }
    });
    
    // Calcular ahorros (ingresos - gastos)
    const totalSavings = totalIncome - totalExpenses;
    
    // Simular cambios porcentuales (en una aplicación real, se compararían con el mes anterior)
    const balanceChange = this.getRandomChange(1, 5);
    const incomeChange = this.getRandomChange(1, 6);
    const expenseChange = this.getRandomChange(-3, 3);
    const savingsChange = this.getRandomChange(0, 4);
    
    // Actualizar el resumen
    this.summary = {
      totalBalance,
      totalIncome,
      totalExpenses,
      totalSavings,
      balanceChange,
      incomeChange,
      expenseChange,
      savingsChange
    };
  }
  
  // Generar un cambio aleatorio para simulación
  private getRandomChange(min: number, max: number): number {
    return parseFloat((Math.random() * (max - min) + min).toFixed(1));
  }

  // Método para formatear montos con clase CSS
  getTransactionAmountClass(amount: number): string {
    return amount >= 0 ? 'positive-amount' : 'negative-amount';
  }
  
  // Método para obtener la clase del icono según el tipo de transacción
  getTransactionIconClass(type: string): string {
    return type === 'INGRESO' ? 'positive-icon' : 'negative-icon';
  }
  
  // Método para formatear fechas en formato legible
  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  }
  
  // Método para obtener el porcentaje de ahorro
  getSavingsPercentage(): number {
    if (this.summary.totalIncome === 0) return 0;
    return Math.round((this.summary.totalSavings / this.summary.totalIncome) * 100);
  }
  
  // Método para obtener el color de tendencia basado en el valor
  getTrendColor(value: number, isExpense: boolean = false): string {
    // Para gastos, un valor negativo (reducción) es positivo
    if (isExpense) {
      return value <= 0 ? 'positive' : 'negative';
    }
    // Para ingresos y ahorros, un valor positivo es bueno
    return value >= 0 ? 'positive' : 'negative';
  }
  
  // Método para obtener el icono según el tipo de transacción
  getTransactionIcon(type: string): string {
    switch (type) {
      case 'INGRESO':
        return 'arrow_upward';
      case 'EGRESO':
        return 'arrow_downward';
      case 'TRANSFERENCIA':
        return 'swap_horiz';
      default:
        return 'history';
    }
  }
}
