import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { CuentaService } from '@core/services/finanzas/cuenta.service';
import { Account, AccountType } from '@core/models/finanzas/cuenta.model';

@Component({
  selector: 'app-cuentas',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatDividerModule,
    MatTooltipModule,
    MatBadgeModule
  ],
  template: `
    <div class="dashboard-container">
      <div class="header-section">
        <h1 class="page-title">Mis Cuentas</h1>
        <button mat-raised-button color="primary" class="create-button" (click)="createAccount()">
          <mat-icon>add</mat-icon>
          Nueva Cuenta
        </button>
      </div>

      <div class="summary-cards">
        <mat-card class="summary-card">
          <div class="card-content">
            <div class="card-icon" [ngClass]="{'active': getActiveAccounts() > 0}">
              <mat-icon>account_balance</mat-icon>
            </div>
            <div class="card-info">
              <h3>Cuentas Activas</h3>
              <p class="card-value">{{ getActiveAccounts() }}</p>
            </div>
          </div>
        </mat-card>

        <mat-card class="summary-card">
          <div class="card-content">
            <div class="card-icon total-balance">
              <mat-icon>payments</mat-icon>
            </div>
            <div class="card-info">
              <h3>Saldo Total</h3>
              <p class="card-value">{{ getTotalBalance() | currency }}</p>
            </div>
          </div>
        </mat-card>

        <mat-card class="summary-card">
          <div class="card-content">
            <div class="card-icon" [ngClass]="{'inactive': getInactiveAccounts() > 0}">
              <mat-icon>block</mat-icon>
            </div>
            <div class="card-info">
              <h3>Cuentas Inactivas</h3>
              <p class="card-value">{{ getInactiveAccounts() }}</p>
            </div>
          </div>
        </mat-card>
      </div>

      <mat-card class="main-card">
        <mat-card-header>
          <mat-card-title>Detalle de Cuentas</mat-card-title>
        </mat-card-header>

        <mat-card-content>
          @if (loading) {
            <div class="loading-container">
              <mat-spinner diameter="40"></mat-spinner>
              <span>Cargando cuentas...</span>
            </div>
          } @else if (error) {
            <div class="error-container">
              <mat-icon color="warn">error</mat-icon>
              <span>{{error}}</span>
              <button mat-button color="primary" (click)="loadAccounts()">
                <mat-icon>refresh</mat-icon>
                Reintentar
              </button>
            </div>
          } @else {
            <div class="table-container">
              @if (accounts.length) {
                <table mat-table [dataSource]="accounts" class="mat-elevation-z2">
                  <!-- Account Number Column -->
                  <ng-container matColumnDef="numero">
                    <th mat-header-cell *matHeaderCellDef>Número de cuenta</th>
                    <td mat-cell *matCellDef="let account">
                      <div class="account-number">
                        <span class="account-icon">
                          <mat-icon>{{ isBolsillo(account.tipo) ? 'savings' : 'account_balance' }}</mat-icon>
                        </span>
                        <span class="account-number-text">{{account.numero}}</span>
                      </div>
                    </td>
                  </ng-container>

                  <!-- Type Column -->
                  <ng-container matColumnDef="tipo">
                    <th mat-header-cell *matHeaderCellDef>Tipo</th>
                    <td mat-cell *matCellDef="let account">
                      <span class="account-type-badge" [ngClass]="{'account-type-cuenta-corriente': account.tipo === AccountType.CUENTA_CORRIENTE, 'account-type-cuenta-ahorro': account.tipo === AccountType.CUENTA_AHORRO, 'account-type-cuenta-nomina': account.tipo === AccountType.CUENTA_NOMINA, 'account-type-cuenta-infantil': account.tipo === AccountType.CUENTA_INFANTIL, 'account-type-cuenta-joven': account.tipo === AccountType.CUENTA_JOVEN, 'account-type-bolsillo': account.tipo === AccountType.BOLSILLO}">
                        {{getTypeDisplay(account.tipo)}}
                      </span>
                    </td>
                  </ng-container>

                  <!-- Balance Column -->
                  <ng-container matColumnDef="saldo">
                    <th mat-header-cell *matHeaderCellDef>Saldo</th>
                    <td mat-cell *matCellDef="let account" class="balance-cell">
                      <span [ngClass]="{'positive-balance': account.saldo > 0, 'zero-balance': account.saldo === 0}">
                        {{account.saldo | currency}}
                      </span>
                    </td>
                  </ng-container>

                  <!-- Actions Column -->
                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef>Acciones</th>
                    <td mat-cell *matCellDef="let account">
                      <div class="action-buttons">
                        <button mat-icon-button color="primary" matTooltip="Editar cuenta" (click)="editAccount(account)">
                          <mat-icon>edit</mat-icon>
                        </button>
                        <button mat-icon-button color="warn" matTooltip="Eliminar cuenta" (click)="deleteAccount(account)">
                          <mat-icon>delete</mat-icon>
                        </button>
                        <button mat-icon-button color="accent" matTooltip="Ver transacciones" (click)="viewTransactions(account)">
                          <mat-icon>history</mat-icon>
                        </button>
                        <button mat-icon-button color="primary" matTooltip="Asignar usuario" (click)="assignUserToAccount(account)">
                          <mat-icon>person_add</mat-icon>
                        </button>
                      </div>
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="['numero', 'tipo', 'saldo', 'actions']"></tr>
                  <tr mat-row *matRowDef="let row; columns: ['numero', 'tipo', 'saldo', 'actions'];" class="account-row"></tr>
                </table>
              } @else {
                <div class="empty-state">
                  <mat-icon>account_balance_wallet</mat-icon>
                  <h3>No tienes cuentas registradas</h3>
                  <p>Crea una nueva cuenta para empezar a gestionar tus finanzas</p>
                  <button mat-raised-button color="primary" (click)="createAccount()">
                    <mat-icon>add</mat-icon>
                    Crear Cuenta
                  </button>
                </div>
              }
            </div>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .page-title {
      font-size: 28px;
      font-weight: 500;
      color: #2c3e50;
      margin: 0;
    }

    .create-button {
      background-color: #4caf50;
      color: white;
      font-weight: 500;
    }

    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }

    .summary-card {
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .summary-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    }

    .card-content {
      display: flex;
      align-items: center;
      padding: 20px;
    }

    .card-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background-color: #f5f5f5;
      margin-right: 16px;
    }

    .card-icon mat-icon {
      font-size: 30px;
      width: 30px;
      height: 30px;
      color: #757575;
    }

    .card-icon.active {
      background-color: #e8f5e9;
    }

    .card-icon.active mat-icon {
      color: #4caf50;
    }

    .card-icon.inactive {
      background-color: #ffebee;
    }

    .card-icon.inactive mat-icon {
      color: #f44336;
    }

    .card-icon.total-balance {
      background-color: #e3f2fd;
    }

    .card-icon.total-balance mat-icon {
      color: #2196f3;
    }

    .card-info h3 {
      font-size: 16px;
      font-weight: 500;
      color: #616161;
      margin: 0 0 8px 0;
    }

    .card-value {
      font-size: 24px;
      font-weight: 700;
      color: #2c3e50;
      margin: 0;
    }

    .main-card {
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    mat-card-header {
      background-color: #f5f5f5;
      padding: 16px 24px;
    }

    mat-card-title {
      font-size: 20px;
      color: #2c3e50;
      margin: 0;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      padding: 2rem;
    }

    .error-container {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background-color: #fff3f3;
      border-radius: 8px;
      margin: 1rem 0;
    }

    .table-container {
      margin-top: 1rem;
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
    }

    .mat-mdc-header-row {
      background-color: #f5f5f5;
    }

    .mat-mdc-header-cell {
      font-weight: 600;
      color: #616161;
    }

    .account-row {
      transition: background-color 0.2s ease;
    }

    .account-row:hover {
      background-color: #f9f9f9;
    }

    .account-number {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .account-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background-color: #e3f2fd;
      margin-right: 0;
      flex-shrink: 0;
    }

    .account-icon mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #2196f3;
    }

    .account-type-badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
    }

    .account-type-cuenta-corriente {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .account-type-cuenta-ahorro {
      background-color: #e8f5e9;
      color: #4caf50;
    }

    .account-type-cuenta-nomina {
      background-color: #fff8e1;
      color: #ff9800;
    }

    .account-type-cuenta-infantil {
      background-color: #f3e5f5;
      color: #9c27b0;
    }

    .account-type-cuenta-joven {
      background-color: #e1f5fe;
      color: #03a9f4;
    }

    .account-type-bolsillo {
      background-color: #e8eaf6;
      color: #3f51b5;
    }

    .balance-cell {
      font-weight: 600;
    }

    .positive-balance {
      color: #4caf50;
    }

    .zero-balance {
      color: #757575;
    }

    .action-buttons {
      display: flex;
      gap: 8px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px 24px;
      text-align: center;
      color: #757575;
      
      mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        margin-bottom: 16px;
        color: #bdbdbd;
      }

      h3 {
        font-size: 20px;
        font-weight: 500;
        color: #616161;
        margin: 0 0 8px 0;
      }

      p {
        font-size: 16px;
        margin-bottom: 24px;
      }
    }

    .account-number-text {
      font-size: 16px;
      font-weight: 500;
      color: #2c3e50;
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 16px;
      }

      .summary-cards {
        grid-template-columns: 1fr;
      }

      .header-section {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }

      .action-buttons {
        flex-direction: column;
        gap: 4px;
      }
    }
  `]
})
export class CuentasComponent implements OnInit {
  accounts: Account[] = [];
  displayedColumns = ['numero', 'tipo', 'saldo', 'actions'];
  loading = false;
  error: string | null = null;

  readonly AccountType = AccountType;

  constructor(
    private readonly accountService: CuentaService,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.loading = true;
    this.error = null;

    this.accountService.obtenerTodos().subscribe({
      next: (accounts: any[]) => {
        // Filtrar para mostrar solo cuentas (no bolsillos) o forzar el tipo a CUENTA
        this.accounts = accounts.map(account => {
          // Verificar y normalizar el ID (manejar tanto id como _id)
          const accountId = account.id || account._id;
          
          // Registrar cuentas sin ID válido para depuración
          if (!accountId) {
            console.error('Cuenta sin ID válido:', account);
          }
          
          // Generar un número de cuenta si no existe
          let numeroCuenta = account.numero || account.numero_cuenta;
          if (!numeroCuenta) {
            // Verificar si el ID existe antes de usar substring
            if (accountId) {
              numeroCuenta = `Cuenta-${accountId.substring(0, 8)}`;
            } else {
              // Si no hay ID, generar un número aleatorio
              numeroCuenta = `Cuenta-${Math.floor(Math.random() * 10000)}`;
            }
          }
          
          // Normalizar el tipo de cuenta
          const tipoCuenta = account.tipo || AccountType.CUENTA_CORRIENTE;
          
          // Normalizar el saldo
          const saldoCuenta = typeof account.saldo === 'number' ? account.saldo : 0;
          
          // Normalizar el ID de usuario
          const userId = account.userId || account.usuario_id || null;
          
          // Crear un nuevo objeto con los campos normalizados
          return {
            // Preservar otros campos que puedan existir
            ...account,
            // Sobreescribir con los campos normalizados
            id: accountId,
            numero: numeroCuenta,
            tipo: tipoCuenta,
            saldo: saldoCuenta,
            userId: userId
          };
        });
        
        console.log('Cuentas cargadas y normalizadas:', this.accounts);
        this.loading = false;
      },
      error: (error: Error) => {
        console.error('Error loading accounts:', error);
        this.error = 'Error al cargar las cuentas: ' + error.message;
        this.loading = false;
      }
    });
  }

  private normalizeStatus(status: string | undefined): string {
    if (!status) return 'INACTIVE';
    
    // Convert to uppercase for consistent comparison
    const upperStatus = typeof status === 'string' ? status.toUpperCase() : '';
    
    // Map Spanish status values to enum values
    switch (upperStatus) {
      case 'ACTIVA':
      case 'ACTIVE':
        return 'ACTIVE';
      case 'INACTIVA':
      case 'INACTIVE':
        return 'INACTIVE';
      case 'BLOQUEADA':
      case 'BLOCKED':
        return 'BLOCKED';
      default:
        return 'INACTIVE';
    }
  }

  getStatusDisplay(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'Activa';
      case 'INACTIVE':
        return 'Inactiva';
      case 'BLOCKED':
        return 'Bloqueada';
      default:
        return 'Inactiva';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'check_circle';
      case 'INACTIVE':
        return 'cancel';
      case 'BLOCKED':
        return 'block';
      default:
        return 'help';
    }
  }

  getActiveAccounts(): number {
    return this.accounts.length;
  }

  getInactiveAccounts(): number {
    return 0;
  }

  getTotalBalance(): number {
    return this.accounts.reduce((total, account) => total + account.saldo, 0);
  }

  createAccount(): void {
    this.accountService.abrirDialogoCuenta().afterClosed().subscribe((result: Account | undefined) => {
      if (result) {
        this.loadAccounts();
        this.snackBar.open('Cuenta creada exitosamente', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      }
    });
  }

  editAccount(account: Account): void {
    this.accountService.abrirDialogoCuenta(account).afterClosed().subscribe((result: Account | undefined) => {
      if (result) {
        // Actualizar la cuenta directamente con el servicio
        this.accountService.actualizar(account.id.toString(), result).subscribe({
          next: (updatedAccount) => {
            console.log('Cuenta actualizada:', updatedAccount);
            // Recargar las cuentas para mostrar los cambios
            this.loadAccounts();
            this.snackBar.open('Cuenta actualizada exitosamente', 'Cerrar', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
          },
          error: (error) => {
            console.error('Error al actualizar la cuenta:', error);
            this.snackBar.open('Error al actualizar la cuenta', 'Cerrar', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    });
  }

  deleteAccount(account: Account): void {
    if (confirm(`¿Estás seguro que deseas eliminar la cuenta ${account.numero}?`)) {
      this.accountService.eliminar(account.id.toString()).subscribe({
        next: () => {
          this.loadAccounts();
          this.snackBar.open('Cuenta eliminada exitosamente', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: (error: Error) => {
          console.error('Error deleting account:', error);
          this.snackBar.open('Error al eliminar la cuenta', 'Cerrar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  viewTransactions(account: Account): void {
    // Esta función se implementará cuando tengamos la vista de transacciones
    this.snackBar.open('Función de ver transacciones próximamente', 'Cerrar', {
      duration: 3000
    });
  }

  assignUserToAccount(account: Account): void {
    // Validación más completa de la cuenta
    if (!account) {
      this.snackBar.open('Error: Objeto de cuenta no disponible', 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      return;
    }
    
    if (!account.id) {
      this.snackBar.open('Error: La cuenta no tiene un ID válido', 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      console.error('Cuenta sin ID válido:', account);
      return;
    }
    
    // Asegurarse de que todos los campos requeridos estén presentes
    const validAccount: Account = {
      id: account.id,
      numero: account.numero || 'N/A',
      tipo: account.tipo || AccountType.CUENTA_CORRIENTE,
      saldo: account.saldo || 0,
      userId: account.userId || ''
    };
    
    console.log('Asignando usuario a cuenta (validada):', validAccount);
    
    this.accountService.abrirDialogoAsignarUsuario(validAccount).afterClosed().subscribe((result: any) => {
      if (result) {
        this.snackBar.open('Usuario asignado correctamente', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.loadAccounts();
      }
    });
  }

  isBolsillo(tipo: string): boolean {
    return tipo === AccountType.BOLSILLO;
  }

  isCuentaRegular(tipo: string): boolean {
    return tipo === AccountType.CUENTA_CORRIENTE ||
           tipo === AccountType.CUENTA_AHORRO ||
           tipo === AccountType.CUENTA_NOMINA ||
           tipo === AccountType.CUENTA_INFANTIL ||
           tipo === AccountType.CUENTA_JOVEN;
  }

  getTypeDisplay(tipo: string): string {
    switch (tipo) {
      case AccountType.CUENTA_CORRIENTE:
        return 'Cuenta Corriente';
      case AccountType.CUENTA_AHORRO:
        return 'Cuenta de Ahorro';
      case AccountType.CUENTA_NOMINA:
        return 'Cuenta Nómina';
      case AccountType.CUENTA_INFANTIL:
        return 'Cuenta Infantil';
      case AccountType.CUENTA_JOVEN:
        return 'Cuenta Joven';
      case AccountType.BOLSILLO:
        return 'Bolsillo';
      default:
        return tipo;
    }
  }
}
