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

  /**
   * Inicia el proceso de verificación automática de transacciones pendientes
   * @param userId ID del usuario actual
   */
  startAutoApproveCheck(userId: string): void {
    if (this.checkInterval) {
      this.stopAutoApproveCheck();
    }

    this.userId = userId;
    this.processedTransactionIds.clear(); // Limpiar el historial al iniciar
    
    // Verificar cada 30 segundos las transacciones pendientes (aumentado de 5 a 30 segundos)
    this.checkInterval = interval(30000)
      .pipe(
        switchMap(() => this.transaccionService.getTransaccionesPorUsuario(userId)),
        catchError(error => {
          console.error('Error al verificar transacciones pendientes:', error);
          return [];
        })
      )
      .subscribe(transacciones => {
        // Filtrar transacciones pendientes que no hayan sido procesadas recientemente
        const transaccionesPendientes = transacciones.filter(t => {
          const id = t.id || t._id;
          return t.estado === 'PENDIENTE' && id && !this.processedTransactionIds.has(id);
        });
        
        if (transaccionesPendientes.length > 0) {
          console.log('Nuevas transacciones pendientes encontradas:', transaccionesPendientes.length);
          this.aprobarTransaccionesPendientes(transaccionesPendientes);
        }
      });
  }

  /**
   * Detiene el proceso de verificación automática
   */
  stopAutoApproveCheck(): void {
    if (this.checkInterval) {
      this.checkInterval.unsubscribe();
      this.checkInterval = null;
    }
    // Limpiar el historial de transacciones procesadas
    this.processedTransactionIds.clear();
  }

  /**
   * Aprueba automáticamente las transacciones pendientes
   */
  private aprobarTransaccionesPendientes(transacciones: Transaccion[]): void {
    transacciones.forEach(transaccion => {
      const id = transaccion.id || transaccion._id;
      if (id) {
        // Marcar esta transacción como procesada para evitar procesarla nuevamente
        this.processedTransactionIds.add(id);
        
        console.log(`Intentando aprobar transacción ${id}...`);
        
        // Usar SIEMPRE el método de actualización general para evitar errores 405
        this.transaccionService.actualizarTransaccion(id, { estado: 'APROBADA' })
          .pipe(
            catchError(error => {
              console.error(`Error al aprobar transacción ${id}:`, error);
              // Si hay un error, eliminamos el ID de la lista de procesados
              // para que se pueda intentar nuevamente en el futuro
              this.processedTransactionIds.delete(id);
              return [];
            })
          )
          .subscribe(response => {
            console.log(`Transacción ${id} aprobada automáticamente`, response);
            // Después de 5 minutos, eliminamos el ID de la lista de procesados
            // para permitir que se vuelva a intentar si aún está pendiente
            setTimeout(() => {
              this.processedTransactionIds.delete(id);
            }, 5 * 60 * 1000); // 5 minutos
          });
      }
    });
  }
}
