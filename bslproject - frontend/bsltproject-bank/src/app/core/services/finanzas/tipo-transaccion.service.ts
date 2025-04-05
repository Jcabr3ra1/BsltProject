import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, catchError, throwError, of, delay, map } from 'rxjs';
import { environment } from '@environments/environment';
import { TipoTransaccion } from '@core/models/finanzas/tipo-transaccion.model';
import { TipoTransaccion as TipoTransaccionEnum } from '@core/models/finanzas/transaccion.model';

@Injectable({
  providedIn: 'root'
})
export class TipoTransaccionService {
  // La estructura correcta según el backend es: {URL_GATEWAY}/finanzas/tipos-transaccion
  private apiGatewayUrl = `${environment.apiGatewayUrl}/finanzas/tipos-transaccion`;

  constructor(private http: HttpClient) {
    console.log('TipoTransaccionService inicializado');
    console.log('URL de la API de tipos de transacción:', this.apiGatewayUrl);
  }

  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        'Authorization': token && token.startsWith('Bearer ') ? token : `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
    };
  }

  getTiposTransaccion(): Observable<TipoTransaccion[]> {
    console.log('Usando tipos de transacción predefinidos');
    
    // Crear objetos TipoTransaccion basados en los valores del enum
    const tiposPredefinidos: TipoTransaccion[] = [
      {
        id: TipoTransaccionEnum.CUENTA_CUENTA,
        nombre: 'Cuenta a Cuenta',
        descripcion: 'Transferencia entre cuentas',
        requiereDestino: true,
        activo: true
      },
      {
        id: TipoTransaccionEnum.CUENTA_BOLSILLO,
        nombre: 'Cuenta a Bolsillo',
        descripcion: 'Transferencia de cuenta a bolsillo',
        requiereDestino: true,
        activo: true
      },
      {
        id: TipoTransaccionEnum.BOLSILLO_CUENTA,
        nombre: 'Bolsillo a Cuenta',
        descripcion: 'Transferencia de bolsillo a cuenta',
        requiereDestino: true,
        activo: true
      },
      {
        id: TipoTransaccionEnum.BANCO_CUENTA,
        nombre: 'Banco a Cuenta',
        descripcion: 'Transferencia de banco a cuenta',
        requiereDestino: true,
        activo: true
      },
      {
        id: TipoTransaccionEnum.BANCO_BOLSILLO,
        nombre: 'Banco a Bolsillo',
        descripcion: 'Transferencia de banco a bolsillo',
        requiereDestino: true,
        activo: true
      },
      {
        id: TipoTransaccionEnum.CUENTA_BANCO,
        nombre: 'Cuenta a Banco',
        descripcion: 'Transferencia de cuenta a banco',
        requiereDestino: true,
        activo: true
      }
    ];
    
    console.log('Tipos de transacción predefinidos:', tiposPredefinidos);
    return of(tiposPredefinidos).pipe(
      tap(tipos => {
        console.log('Tipos de transacción proporcionados:', tipos);
      }),
      catchError(error => {
        console.error('Error al proporcionar tipos de transacción:', error);
        return throwError(() => new Error('Error al proporcionar tipos de transacción'));
      })
    );
  }

  getTipoTransaccionById(id: string): Observable<TipoTransaccion> {
    console.log('Obteniendo tipo de transacción por ID:', id);
    
    // Primero obtenemos todos los tipos predefinidos
    return this.getTiposTransaccion().pipe(
      map(tipos => {
        // Buscamos el tipo con el ID especificado
        const tipoEncontrado = tipos.find(tipo => tipo.id === id);
        
        if (tipoEncontrado) {
          console.log('Tipo de transacción encontrado:', tipoEncontrado);
          return tipoEncontrado;
        } else {
          console.error('Tipo de transacción no encontrado con ID:', id);
          throw new Error(`Tipo de transacción no encontrado con ID: ${id}`);
        }
      })
    );
  }

  crearTipoTransaccion(tipoTransaccion: TipoTransaccion): Observable<TipoTransaccion> {
    console.log('Simulando creación de tipo de transacción:', tipoTransaccion);
    
    // En un entorno real, aquí se enviaría la solicitud al backend
    // Como estamos usando valores predefinidos, simplemente devolvemos el mismo objeto
    // En una aplicación real, deberíamos agregar el nuevo tipo a nuestra lista local
    
    return of(tipoTransaccion).pipe(
      delay(500), // Simular retardo de red
      tap(tipoCreado => {
        console.log('Tipo de transacción creado (simulado):', tipoCreado);
      })
    );
  }

  actualizarTipoTransaccion(id: string, tipoTransaccion: TipoTransaccion): Observable<TipoTransaccion> {
    console.log('Simulando actualización de tipo de transacción:', id, tipoTransaccion);
    
    // En un entorno real, aquí se enviaría la solicitud al backend
    // Como estamos usando valores predefinidos, simplemente devolvemos el objeto actualizado
    // En una aplicación real, deberíamos actualizar el tipo en nuestra lista local
    
    // Aseguramos que el ID no cambie
    const tipoActualizado: TipoTransaccion = {
      ...tipoTransaccion,
      id: id
    };
    
    return of(tipoActualizado).pipe(
      delay(500), // Simular retardo de red
      tap(tipo => {
        console.log('Tipo de transacción actualizado (simulado):', tipo);
      })
    );
  }

  eliminarTipoTransaccion(id: string): Observable<void> {
    console.log('Simulando eliminación de tipo de transacción con ID:', id);
    
    // En un entorno real, aquí se enviaría la solicitud al backend
    // Como estamos usando valores predefinidos, simplemente simulamos una eliminación exitosa
    // En una aplicación real, deberíamos eliminar el tipo de nuestra lista local
    
    return of(undefined).pipe(
      delay(500), // Simular retardo de red
      tap(() => {
        console.log('Tipo de transacción eliminado (simulado) con ID:', id);
      })
    );
  }
}