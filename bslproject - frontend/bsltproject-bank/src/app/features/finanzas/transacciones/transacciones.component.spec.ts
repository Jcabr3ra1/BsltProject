import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TransaccionesComponent } from './transacciones.component';
import { TransaccionService } from '@core/services/finanzas/transaccion.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { Transaction, TransactionStatus, TransactionType } from '@core/models/finanzas/transaccion.model';
import { AccountType, AccountStatus } from '@core/models/finanzas/cuenta.model';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('TransaccionesComponent', () => {
  let component: TransaccionesComponent;
  let fixture: ComponentFixture<TransaccionesComponent>;
  let transactionService: jasmine.SpyObj<TransaccionService>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  const mockTransaction: Transaction = {
    id: '1',
    amount: 100,
    type: TransactionType.TRANSFER,
    status: TransactionStatus.PENDING,
    accountId: '1',
    account: {
      id: '1',
      accountNumber: '123456789',
      type: AccountType.SAVINGS,
      balance: 1000,
      status: AccountStatus.ACTIVE
    }
  };

  beforeEach(async () => {
    const transactionServiceSpy = jasmine.createSpyObj('TransaccionService', [
      'getTransactions',
      'approveTransaction',
      'rejectTransaction',
      'deleteTransaction'
    ]);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        TransaccionesComponent
      ],
      providers: [
        { provide: TransaccionService, useValue: transactionServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    }).compileComponents();

    transactionService = TestBed.inject(TransaccionService) as jasmine.SpyObj<TransaccionService>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TransaccionesComponent);
    component = fixture.componentInstance;
    transactionService.getTransactions.and.returnValue(of([mockTransaction]));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load transactions on init', () => {
    expect(transactionService.getTransactions).toHaveBeenCalled();
    expect(component.transactions).toEqual([mockTransaction]);
    expect(component.loading).toBeFalse();
    expect(component.error).toBeNull();
  });

  it('should handle error when loading transactions', () => {
    const error = new Error('Failed to load transactions');
    transactionService.getTransactions.and.returnValue(throwError(() => error));
    
    component.loadTransactions();
    
    expect(component.error).toBe('Failed to load transactions. Please try again.');
    expect(component.loading).toBeFalse();
  });

  it('should approve transaction', () => {
    transactionService.approveTransaction.and.returnValue(of(void 0));
    
    component.approveTransaction(mockTransaction);
    
    expect(transactionService.approveTransaction).toHaveBeenCalledWith(mockTransaction.id);
    expect(snackBar.open).toHaveBeenCalledWith(
      'Transaction approved successfully',
      'Close',
      { duration: 3000, panelClass: ['success-snackbar'] }
    );
  });

  it('should handle error when approving transaction', () => {
    const error = new Error('Failed to approve transaction');
    transactionService.approveTransaction.and.returnValue(throwError(() => error));
    
    component.approveTransaction(mockTransaction);
    
    expect(snackBar.open).toHaveBeenCalledWith(
      'Error approving transaction',
      'Close',
      { duration: 3000, panelClass: ['error-snackbar'] }
    );
  });

  it('should reject transaction', () => {
    transactionService.rejectTransaction.and.returnValue(of(void 0));
    
    component.rejectTransaction(mockTransaction);
    
    expect(transactionService.rejectTransaction).toHaveBeenCalledWith(mockTransaction.id);
    expect(snackBar.open).toHaveBeenCalledWith(
      'Transaction rejected successfully',
      'Close',
      { duration: 3000, panelClass: ['success-snackbar'] }
    );
  });

  it('should handle error when rejecting transaction', () => {
    const error = new Error('Failed to reject transaction');
    transactionService.rejectTransaction.and.returnValue(throwError(() => error));
    
    component.rejectTransaction(mockTransaction);
    
    expect(snackBar.open).toHaveBeenCalledWith(
      'Error rejecting transaction',
      'Close',
      { duration: 3000, panelClass: ['error-snackbar'] }
    );
  });

  it('should delete transaction', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    transactionService.deleteTransaction.and.returnValue(of(void 0));
    
    component.deleteTransaction(mockTransaction);
    
    expect(transactionService.deleteTransaction).toHaveBeenCalledWith(mockTransaction.id);
    expect(snackBar.open).toHaveBeenCalledWith(
      'Transaction deleted successfully',
      'Close',
      { duration: 3000, panelClass: ['success-snackbar'] }
    );
  });

  it('should handle error when deleting transaction', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    const error = new Error('Failed to delete transaction');
    transactionService.deleteTransaction.and.returnValue(throwError(() => error));
    
    component.deleteTransaction(mockTransaction);
    
    expect(snackBar.open).toHaveBeenCalledWith(
      'Error deleting transaction',
      'Close',
      { duration: 3000, panelClass: ['error-snackbar'] }
    );
  });

  it('should not delete transaction if user cancels confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    
    component.deleteTransaction(mockTransaction);
    
    expect(transactionService.deleteTransaction).not.toHaveBeenCalled();
  });
});
