import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Transaction, TransactionRequest, TransactionType, TransactionStatus } from '@core/models/finanzas/transaccion.model';
import { Account } from '@core/models/finanzas/cuenta.model';
import { environment } from '@environments/environment';

interface TransactionFilters {
  accountId?: string;
  type?: TransactionType;
  status?: TransactionStatus;
  startDate?: string;
  endDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TransaccionService {
  private readonly baseUrl = `${environment.financeUrl}/transacciones`;

  constructor(private readonly http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  private handleError(error: any, operation = 'operation'): Observable<never> {
    console.error(`${operation} failed:`, error);
    return throwError(() => error);
  }

  getTransactions(filters?: TransactionFilters): Observable<Transaction[]> {
    let params = new HttpParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params = params.set(key, value);
        }
      });
    }

    return this.http.get<Transaction[]>(`${this.baseUrl}`, {
      headers: this.getHeaders(),
      params
    }).pipe(
      catchError(error => this.handleError(error, 'getTransactions'))
    );
  }

  getTransaction(id: string): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => this.handleError(error, 'getTransaction'))
    );
  }

  createTransaction(transaction: TransactionRequest): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.baseUrl}`, transaction, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => this.handleError(error, 'createTransaction'))
    );
  }

  updateTransaction(id: string, transaction: TransactionRequest): Observable<Transaction> {
    return this.http.put<Transaction>(`${this.baseUrl}/${id}`, transaction, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => this.handleError(error, 'updateTransaction'))
    );
  }

  deleteTransaction(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => this.handleError(error, 'deleteTransaction'))
    );
  }

  approveTransaction(id: string): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/approve`, {}, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => this.handleError(error, 'approveTransaction'))
    );
  }

  rejectTransaction(id: string): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/reject`, {}, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => this.handleError(error, 'rejectTransaction'))
    );
  }

  getAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.baseUrl}/accounts`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => this.handleError(error, 'getAccounts'))
    );
  }
}
