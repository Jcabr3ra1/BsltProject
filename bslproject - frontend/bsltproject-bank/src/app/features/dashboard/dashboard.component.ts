import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatDividerModule } from '@angular/material/divider';

// Interfaces para los datos del dashboard
interface Transaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  type: string;
}

interface Payment {
  id: number;
  description: string;
  amount: number;
  dueDate: string;
  status: string;
}

interface Account {
  id: number;
  name: string;
  accountNumber: string;
  balance: number;
  type: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatGridListModule,
    MatDividerModule
  ]
})
export class DashboardComponent implements OnInit {
  // Fecha actual para mostrar la última actualización
  today: Date = new Date();
  
  // Datos financieros
  totalBalance: number = 5000.00;
  totalIncome: number = 1500.00;
  totalExpenses: number = 350.00;
  totalSavings: number = 1150.00;
  
  // Indicadores de cambio (porcentajes)
  balanceChange: number = 2.4;
  incomeChange: number = 5.3;
  expenseChange: number = -1.8;
  savingsChange: number = 3.7;
  
  // Transacciones recientes
  recentTransactions: Transaction[] = [
    { id: 1, date: '2025-03-10', description: 'Depósito de nómina', amount: 1000, type: 'INGRESO' },
    { id: 2, date: '2025-03-09', description: 'Retiro ATM', amount: -200, type: 'EGRESO' },
    { id: 3, date: '2025-03-08', description: 'Pago de servicio de luz', amount: -150, type: 'EGRESO' },
    { id: 4, date: '2025-03-07', description: 'Transferencia recibida', amount: 500, type: 'INGRESO' }
  ];
  
  // Próximos pagos
  upcomingPayments: Payment[] = [
    { id: 1, description: 'Pago de hipoteca', amount: 800, dueDate: '2025-03-15', status: 'PENDIENTE' },
    { id: 2, description: 'Suscripción Netflix', amount: 15, dueDate: '2025-03-20', status: 'PENDIENTE' },
    { id: 3, description: 'Seguro de auto', amount: 120, dueDate: '2025-03-25', status: 'PENDIENTE' }
  ];
  
  // Cuentas
  accounts: Account[] = [
    { id: 1, name: 'Cuenta Corriente', accountNumber: '****1234', balance: 3500, type: 'CHECKING' },
    { id: 2, name: 'Cuenta de Ahorros', accountNumber: '****5678', balance: 1500, type: 'SAVINGS' }
  ];

  constructor() { }

  ngOnInit(): void {
    // Aquí se cargarían los datos reales desde los servicios
    this.loadDashboardData();
  }

  // Método para cargar datos del dashboard
  loadDashboardData(): void {
    // En un caso real, aquí se llamaría a los servicios para obtener los datos
    // Por ejemplo:
    // this.accountService.getBalance().subscribe(balance => this.totalBalance = balance);
    // this.transactionService.getRecent().subscribe(transactions => this.recentTransactions = transactions);
    
    // Por ahora usamos los datos de ejemplo
    console.log('Cargando datos del dashboard...');
    
    // Calcular saldo total de las cuentas
    this.calculateTotalBalance();
  }
  
  // Método para calcular el saldo total de todas las cuentas
  calculateTotalBalance(): void {
    if (this.accounts && this.accounts.length > 0) {
      this.totalBalance = this.accounts.reduce((total, account) => total + account.balance, 0);
    }
  }

  // Método para formatear montos con clase CSS
  getTransactionAmountClass(amount: number): string {
    return amount >= 0 ? 'positive-amount' : 'negative-amount';
  }
  
  // Método para obtener la clase del icono según el tipo de transacción
  getTransactionIconClass(amount: number): string {
    return amount >= 0 ? 'positive-icon' : 'negative-icon';
  }
  
  // Método para formatear fechas en formato legible
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }
  
  // Método para obtener el porcentaje de ahorro
  getSavingsPercentage(): number {
    if (this.totalIncome === 0) return 0;
    return Math.round((this.totalSavings / this.totalIncome) * 100);
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
}
