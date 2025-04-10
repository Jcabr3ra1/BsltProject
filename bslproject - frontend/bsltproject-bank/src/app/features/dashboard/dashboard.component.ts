import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subscription } from 'rxjs';

// Importar servicios
import { TransaccionService } from '@core/services/finanzas/transaccion.service';
import { CuentaService } from '@core/services/finanzas/cuenta.service';
import { AuthService } from '@core/services/seguridad/auth.service';

// Importar modelos
import { Transaccion } from '@core/models/finanzas/transaccion.model';
import { Cuenta } from '@core/models/finanzas/cuenta.model';

// Interfaces específicas para el dashboard
interface FinancialSummary {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  totalSavings?: number;
}

interface Transaction {
  id: string;
  date: string;
  type: string;
  amount: number;
  description?: string;
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
    MatDividerModule,
    MatProgressSpinnerModule
  ]
})
export class DashboardComponent implements OnInit, OnDestroy {
  // Fecha actual para mostrar la última actualización
  today: Date = new Date();
  
  // Estado de error
  error: string | null = null;
  
  // Resumen financiero
  summary: FinancialSummary = {
    totalBalance: 0,
    totalIncome: 0,
    totalExpenses: 0
  };
  
  // Transacciones recientes
  recentTransactions: Transaction[] = [];
  
  // Cuentas
  accounts: Cuenta[] = [];
  
  // Subscripciones
  private subscriptions = new Subscription();

  constructor(
    private transaccionService: TransaccionService,
    private cuentaService: CuentaService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }
  
  ngOnDestroy(): void {
    // Limpiar todas las subscripciones al destruir el componente
    this.subscriptions.unsubscribe();
  }

  // Formatea la fecha para mostrarla en el formato DD/MM/YYYY
  formatDate(date: string | Date): string {
    try {
      const d = new Date(date);
      return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    } catch (error) {
      return 'Fecha inválida';
    }
  }

  loadDashboardData(): void {
    this.error = null;

    // Obtener ID del usuario actual
    const currentUser = this.authService.currentUserValue;
    if (!currentUser || !currentUser.id) {
      this.error = 'Usuario no autenticado';
      return;
    }
    
    const userId = currentUser.id;
    
    // Cargar cuentas
    this.subscriptions.add(
      this.cuentaService.obtenerCuentasPorUsuario(userId).subscribe({
        next: (cuentas) => {
          this.accounts = cuentas;
          this.calculateFinancialSummary();
        },
        error: (err) => {
          console.error('Error al cargar cuentas', err);
        }
      })
    );
    
    // Cargar transacciones recientes
    this.subscriptions.add(
      this.transaccionService.obtenerTransaccionesPorUsuario(userId).subscribe({
        next: (transacciones) => {
          this.recentTransactions = this.processTransactions(transacciones);
        },
        error: (err) => {
          console.error('Error al cargar transacciones', err);
        }
      })
    );
  }
  
  // Procesar transacciones para el dashboard
  private processTransactions(transactions: Transaccion[]): Transaction[] {
    // Transformar transacciones al formato necesario para el dashboard
    return transactions
      .map(t => ({
        id: t.id || '',
        date: t.fecha?.toString() || new Date().toString(),
        description: t.descripcion || 'Sin descripción',
        amount: t.monto || 0,
        type: t.tipoMovimiento?.nombre || 'Transferencia'
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }
  
  // Calcular resumen financiero basado en las cuentas
  private calculateFinancialSummary(): void {
    // Calcular saldo total de todas las cuentas
    const totalBalance = this.accounts.reduce((total, account) => total + (account.saldo || 0), 0);
    
    // Para este ejemplo, usamos valores simulados para ingresos y gastos
    // En una aplicación real, estos valores vendrían de transacciones filtradas por fecha
    const totalIncome = totalBalance > 0 ? totalBalance * 0.7 : 1500;
    const totalExpenses = totalBalance > 0 ? totalBalance * 0.3 : 500;
    
    // Calcular ahorros (ingresos - gastos)
    const totalSavings = totalIncome - totalExpenses;
    
    // Actualizar el resumen
    this.summary = {
      totalBalance,
      totalIncome,
      totalExpenses,
      totalSavings
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
  

  
  // Método para obtener el porcentaje de ahorro
  getSavingsPercentage(): number {
    if (this.summary.totalIncome === 0) return 0;
    const savings = this.summary.totalSavings || 0;
    return Math.round((savings / this.summary.totalIncome) * 100);
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
