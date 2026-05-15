import { Injectable } from '@angular/core';
import { TransaccionService } from './transaccion.service';
import { interval, Subscription } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { Transaccion } from '../../../../../core/models/transaccion.model';

@Injectable({
  providedIn: 'root'
})
export class AutoApproveService {
  private checkInterval: Subscription | null = null;
  private userId: string | null = null;
  private processedTransactionIds: Set<string> = new Set<string>();
  
  constructor(private transaccionService: TransaccionService) {}

  
  startAutoApproveCheck(userId: string): void {
    if (this.checkInterval) {
      this.stopAutoApproveCheck();
    }

    this.userId = userId;
    this.processedTransactionIds.clear(); // Limpiar el historial al iniciar
    
    this.checkInterval = interval(30000)
      .pipe(
        switchMap(() => {
          return this.transaccionService.getTransaccionesPorUsuario(userId);
        }),
        catchError(error => {
          return [];
        })
      )
      .subscribe(transacciones => {
        const transaccionesPendientes = transacciones.filter(t => {
          const id = t.id || t._id;
          return t.estado === 'PENDIENTE' && id && !this.processedTransactionIds.has(id);
        });
        
        if (transaccionesPendientes.length > 0) {
          this.aprobarTransaccionesPendientes(transaccionesPendientes);
        } else {
          }
      });
  }

  
  stopAutoApproveCheck(): void {
    if (this.checkInterval) {
      this.checkInterval.unsubscribe();
      this.checkInterval = null;
    }
    this.processedTransactionIds.clear();
  }

  
  private aprobarTransaccionesPendientes(transacciones: Transaccion[]): void {
    const promesasAprobacion = transacciones.map(transaccion => {
      const id = transaccion.id || transaccion._id;
      if (!id) return Promise.resolve(); // Ignorar transacciones sin ID
      
      this.processedTransactionIds.add(id);
      
      return new Promise<void>((resolve) => {
        this.transaccionService.aprobarTransaccion(id)
          .pipe(
            catchError(error => {
              this.processedTransactionIds.delete(id);
              resolve(); // Resolver la promesa aún con error para continuar con las demás
              return [];
            })
          )
          .subscribe(response => {
            setTimeout(() => {
              this.processedTransactionIds.delete(id);
            }, 60 * 1000); // 1 minuto
            resolve();
          });
      });
    });
    
    Promise.all(promesasAprobacion)
      .then(() => {
        })
      .catch(error => {
        });
  }
}
