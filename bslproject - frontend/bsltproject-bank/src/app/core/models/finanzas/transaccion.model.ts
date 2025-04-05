/**
 * Modelo de datos para transacciones financieras
 * Incluye interfaces y enums para manejar diferentes tipos y estados de transacciones
 */

import { Cuenta } from './cuenta.model';
import { Bolsillo } from './bolsillo.model';
import { TipoMovimiento } from './tipo-movimiento.model';

/**
 * Estados posibles para una transacción
 */
export enum EstadoTransaccion {
  PENDIENTE = 'PENDIENTE',
  COMPLETADA = 'COMPLETADA',
  ANULADA = 'ANULADA',
  RECHAZADA = 'RECHAZADA',
  APROBADA = 'APROBADA'
}

/**
 * Tipos de transacción según el origen y destino
 */
export enum TipoTransaccion {
  CUENTA_CUENTA = 'CUENTA_CUENTA',
  CUENTA_BOLSILLO = 'CUENTA_BOLSILLO',
  BOLSILLO_CUENTA = 'BOLSILLO_CUENTA',
  BANCO_CUENTA = 'BANCO_CUENTA',
  BANCO_BOLSILLO = 'BANCO_BOLSILLO',
  CUENTA_BANCO = 'CUENTA_BANCO'
}

/**
 * Tipos de movimiento (entrada/salida/transferencia)
 */
export enum TipoMovimientoEnum {
  INGRESO = 'INGRESO',
  EGRESO = 'EGRESO',
  TRANSFERENCIA = 'TRANSFERENCIA'
}

/**
 * Interfaz principal para transacciones
 * Incluye propiedades normalizadas y alternativas para compatibilidad con el backend
 */
export interface Transaccion {
  // Identificadores
  id: string;
  _id?: string; // Alternativa de MongoDB
  
  // Datos básicos
  monto: number;
  descripcion: string;
  estado: EstadoTransaccion | string;
  
  // Fechas (con diferentes formatos para compatibilidad)
  fecha: Date | string;
  fecha_transaccion?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  fecha_creacion?: Date | string;
  fecha_actualizacion?: Date | string;
  
  // IDs de relaciones (formato camelCase)
  tipo?: string; // Tipo de transacción (usado en formularios)
  tipoTransaccionId?: string;
  tipoMovimientoId?: string;
  cuentaOrigenId?: string;
  cuentaDestinoId?: string;
  bolsilloOrigenId?: string;
  bolsilloDestinoId?: string;
  usuarioId?: string;
  
  // IDs de relaciones (formato snake_case para compatibilidad con backend)
  id_tipo_transaccion?: string;
  id_tipo_movimiento?: string;
  id_cuenta_origen?: string;
  id_cuenta_destino?: string;
  id_bolsillo_origen?: string;
  id_bolsillo_destino?: string;
  id_usuario?: string;
  usuario_id?: string;
  
  // Relaciones expandidas (formato camelCase)
  tipoTransaccion?: { id: string; nombre: string; descripcion?: string } | null;
  tipoMovimiento?: TipoMovimiento | null;
  cuentaOrigen?: Cuenta | null;
  cuentaDestino?: Cuenta | null;
  bolsilloOrigen?: Bolsillo | null;
  bolsilloDestino?: Bolsillo | null;
  
  // Relaciones expandidas (formato snake_case para compatibilidad con backend)
  tipo_transaccion?: { id: string; nombre: string; descripcion?: string } | null;
  tipo_movimiento?: TipoMovimiento | null;
  cuenta_origen?: Cuenta | null;
  cuenta_destino?: Cuenta | null;
  bolsillo_origen?: Bolsillo | null;
  bolsillo_destino?: Bolsillo | null;
}

/**
 * Interfaz para solicitudes de creación de transacciones
 * Contiene los campos mínimos necesarios para crear una transacción
 */
export interface TransaccionRequest {
  monto: number;
  descripcion: string;
  tipoMovimientoId: string;  // ID del tipo de movimiento
  cuentaOrigenId?: string;   // Para transferencias cuenta-cuenta, cuenta-bolsillo
  cuentaDestinoId?: string;  // Para transferencias cuenta-cuenta, bolsillo-cuenta
  bolsilloOrigenId?: string; // Para transferencias bolsillo-cuenta
  bolsilloDestinoId?: string; // Para transferencias cuenta-bolsillo
  usuarioId?: string;        // ID del usuario que realiza la transacción
}

/**
 * Interfaz para filtros de búsqueda de transacciones
 */
export interface TransaccionFiltros {
  tipo?: string | null;
  estado?: EstadoTransaccion | string | null;
  fechaInicio?: Date | string | null;
  fechaFin?: Date | string | null;
  montoMinimo?: number | null;
  montoMaximo?: number | null;
  usuarioId?: string | null;
  cuentaId?: string | null;
  bolsilloId?: string | null;
}

// Alias en inglés para compatibilidad con componentes existentes
export type Transaction = Transaccion;
export type TransactionRequest = TransaccionRequest;

/**
 * Alias en inglés para TransaccionFiltros con propiedades mapeadas
 * para mantener compatibilidad con componentes existentes
 */
export interface TransactionFilters extends Omit<TransaccionFiltros, 'tipo' | 'estado' | 'fechaInicio' | 'fechaFin'> {
  // Propiedades en inglés
  type?: string | null;
  status?: EstadoTransaccion | string | null;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  
  // Propiedades en español para compatibilidad con componentes existentes
  tipo?: string | null;
  estado?: EstadoTransaccion | string | null;
  fechaInicio?: Date | string | null;
  fechaFin?: Date | string | null;
  
  // Las demás propiedades se heredan directamente
}

export enum TransactionStatus {
  PENDING = EstadoTransaccion.PENDIENTE,
  COMPLETED = EstadoTransaccion.COMPLETADA,
  CANCELLED = EstadoTransaccion.ANULADA,
  REJECTED = EstadoTransaccion.RECHAZADA,
  APPROVED = EstadoTransaccion.APROBADA
}

export enum TransactionType {
  INGRESO = TipoMovimientoEnum.INGRESO,
  EGRESO = TipoMovimientoEnum.EGRESO,
  TRANSFERENCIA = TipoMovimientoEnum.TRANSFERENCIA,
  CUENTA_CUENTA = TipoTransaccion.CUENTA_CUENTA,
  CUENTA_BOLSILLO = TipoTransaccion.CUENTA_BOLSILLO,
  BOLSILLO_CUENTA = TipoTransaccion.BOLSILLO_CUENTA,
  BANCO_CUENTA = TipoTransaccion.BANCO_CUENTA,
  BANCO_BOLSILLO = TipoTransaccion.BANCO_BOLSILLO,
  CUENTA_BANCO = TipoTransaccion.CUENTA_BANCO
}