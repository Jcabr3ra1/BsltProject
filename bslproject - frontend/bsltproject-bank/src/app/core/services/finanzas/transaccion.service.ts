import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { Transaction } from '@core/models/finanzas/transaccion.model';
import { Account } from '@core/models/finanzas/cuenta.model';

@Injectable({
  providedIn: 'root'
})
export class TransaccionService {
  private apiUrl = `${environment.apiUrl}/transacciones`;
  private accountsUrl = `${environment.apiUrl}/cuentas`;

  constructor(private http: HttpClient) {}

  getTransactions(): Observable<Transaction[]> {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      return throwError(() => new Error('Usuario no autenticado'));
    }

    return this.http.get<Transaction[]>(`${this.apiUrl}/user/${userId}`).pipe(
      catchError(this.handleError)
    );
  }

  getAccounts(): Observable<Account[]> {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      return throwError(() => new Error('Usuario no autenticado'));
    }

    return this.http.get<Account[]>(`${this.accountsUrl}/user/${userId}`).pipe(
      catchError(this.handleError)
    );
  }

  createTransaction(transaction: Partial<Transaction>): Observable<Transaction> {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      return throwError(() => new Error('Usuario no autenticado'));
    }

    // Agregar el userId a la transacción
    const transactionWithUser = {
      ...transaction,
      userId
    };

    return this.http.post<Transaction>(this.apiUrl, transactionWithUser).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ha ocurrido un error. Por favor, intente nuevamente.';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = error.error.message;
    } else {
      // Error del lado del servidor
      if (error.status === 401) {
        // Limpiar la sesión si el token no es válido
        localStorage.clear();
        errorMessage = 'Su sesión ha expirado. Por favor, inicie sesión nuevamente.';
      } else if (error.status === 403) {
        errorMessage = 'No tiene permisos para realizar esta acción.';
      } else if (error.status === 404) {
        errorMessage = 'El recurso solicitado no existe.';
      } else if (error.status === 409) {
        // Error específico para usuarios duplicados
        if (error.error?.message?.includes('non unique result')) {
          errorMessage = 'Se encontraron múltiples usuarios con el mismo correo. Por favor, contacte al administrador.';
        } else {
          errorMessage = 'La transacción no pudo ser procesada debido a un conflicto.';
        }
      } else if (error.status === 422) {
        // Error de validación
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else {
          errorMessage = 'Los datos proporcionados no son válidos.';
        }
      } else if (error.status === 500) {
        errorMessage = 'Error interno del servidor. Por favor, intente más tarde.';
      }
    }

    console.error('Error en TransaccionService:', error);
    return throwError(() => new Error(errorMessage));
  }
}
