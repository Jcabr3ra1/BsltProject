import { Transaccion } from './transaccion.model';

/**
 * Modelo de Estadísticas de Transacciones
 * 
 * Representa las estadísticas de transacciones para una cuenta
 */
export interface EstadisticasTransaccion {
  totalIngresos: number;
  totalEgresos: number;
  cantidadTransacciones: number;
  totalTransacciones: number;
  saldoActual: number;
  transaccionesRecientes: Transaccion[];
}
