import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Usuario } from '../../../core/models/usuario.model';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

interface Transaction {
  fecha: string;
  descripcion: string;
  monto: number;
  categoria: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatTableModule,
    MatButtonModule,
    MatTooltipModule,
    DatePipe
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  user: Usuario | null = null;
  currentDate: Date = new Date();
  activeChartPeriod: 'week' | 'month' | 'year' = 'month';
  
  recentTransactions: Transaction[] = [
    { fecha: '25 Abr, 2025', descripcion: 'Depósito nómina', monto: 2500.00, categoria: 'Ingresos' },
    { fecha: '22 Abr, 2025', descripcion: 'Pago servicios', monto: -120.50, categoria: 'Hogar' },
    { fecha: '20 Abr, 2025', descripcion: 'Transferencia recibida', monto: 350.00, categoria: 'Ingresos' },
    { fecha: '18 Abr, 2025', descripcion: 'Compra en línea', monto: -89.99, categoria: 'Compras' },
    { fecha: '15 Abr, 2025', descripcion: 'Retiro cajero', monto: -200.00, categoria: 'Efectivo' }
  ];

  accountsTotal: number = 12540.00;
  previousMonthTotal: number = 11920.00;
  transactionsCount: number = 18;
  previousMonthTransactions: number = 21;
  savingsGoal: number = 12500.00;
  currentSavings: number = 9375.00;
  savingsPercentage: number = 75;

  private dateInterval!: ReturnType<typeof setInterval>;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
    this.loadDashboardData();
    
    this.dateInterval = setInterval(() => {
      this.currentDate = new Date();
    }, 60000);
  }

  ngOnDestroy(): void {
    clearInterval(this.dateInterval);
  }

  loadDashboardData(): void {
    setTimeout(() => {}, 500);
  }

  viewAllTransactions(): void {
    this.router.navigate(['/transacciones']);
  }

  setChartPeriod(period: 'week' | 'month' | 'year'): void {
    this.activeChartPeriod = period;
    this.updateChartData();
  }

  updateChartData(): void {
  }

  getCategoryColor(category: string): string {
    const colors: {[key: string]: string} = {
      'Ingresos': '#4caf50',
      'Hogar': '#ff9800',
      'Compras': '#f44336',
      'Efectivo': '#2196f3',
      'Transporte': '#9c27b0',
      'Alimentación': '#607d8b',
      'Entretenimiento': '#00bcd4'
    };
    
    return colors[category] || '#757575';
  }
}