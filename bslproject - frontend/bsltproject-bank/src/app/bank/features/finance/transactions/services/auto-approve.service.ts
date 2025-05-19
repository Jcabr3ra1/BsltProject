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
    
    // Verificar cada 30 segundos las transacciones pendientes para reducir la carga en el servidor
    // Aumentamos de 5 a 30 segundos para evitar el bucle constante de peticiones
    this.checkInterval = interval(30000)
      .pipe(
        switchMap(() => {
          console.log('Verificando transacciones pendientes...');
          return this.transaccionService.getTransaccionesPorUsuario(userId);
        }),
        catchError(error => {
          console.error('Error al verificar transacciones pendientes:', error);
          return [];
        })
      )
      .subscribe(transacciones => {
        console.log(`Recibidas ${transacciones.length} transacciones para revisar`);
        
        // Filtrar transacciones pendientes que no hayan sido procesadas recientemente
        const transaccionesPendientes = transacciones.filter(t => {
          const id = t.id || t._id;
          return t.estado === 'PENDIENTE' && id && !this.processedTransactionIds.has(id);
        });
        
        if (transaccionesPendientes.length > 0) {
          console.log('Nuevas transacciones pendientes encontradas:', transaccionesPendientes.length);
          this.aprobarTransaccionesPendientes(transaccionesPendientes);
        } else {
          console.log('No se encontraron nuevas transacciones pendientes');
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
    // Procesamos todas las transacciones pendientes en paralelo para mayor velocidad
    console.log(`Procesando ${transacciones.length} transacciones pendientes en paralelo`);
    
    // Crear un array de promesas para aprobar todas las transacciones
    const promesasAprobacion = transacciones.map(transaccion => {
      const id = transaccion.id || transaccion._id;
      if (!id) return Promise.resolve(); // Ignorar transacciones sin ID
      
      // Marcar esta transacción como procesada para evitar procesarla nuevamente
      this.processedTransactionIds.add(id);
      
      console.log(`Intentando aprobar transacción ${id}...`);
      
      // Convertir el observable a promesa para manejar todas las aprobaciones en paralelo
      return new Promise<void>((resolve) => {
        // Usar el método de aprobación específico en lugar del método general
        this.transaccionService.aprobarTransaccion(id)
          .pipe(
            catchError(error => {
              console.error(`Error al aprobar transacción ${id}:`, error);
              // Si hay un error, eliminamos el ID de la lista de procesados
              this.processedTransactionIds.delete(id);
              resolve(); // Resolver la promesa aún con error para continuar con las demás
              return [];
            })
          )
          .subscribe(response => {
            console.log(`✅ Transacción ${id} aprobada automáticamente`, response);
            // Reducimos el tiempo a 1 minuto para permitir reintento más rápido si es necesario
            setTimeout(() => {
              this.processedTransactionIds.delete(id);
            }, 60 * 1000); // 1 minuto
            resolve();
          });
      });
    });
    
    // Ejecutar todas las aprobaciones en paralelo
    Promise.all(promesasAprobacion)
      .then(() => {
        console.log('Proceso de aprobación automática completado');
      })
      .catch(error => {
        console.error('Error en el proceso de aprobación automática:', error);
      });
  }
}
