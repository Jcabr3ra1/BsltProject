// src/app/core/models/finanzas/transaccion.model.ts
export interface Transaccion {
  id: string;
  monto: number;
  descripcion: string;
  fecha: Date | string;
  estado: string;
  
  // IDs de relaciones (versión frontend)
  tipoTransaccionId?: string;
  tipoMovimientoId?: string;
  cuentaOrigenId?: string;
  cuentaDestinoId?: string;
  bolsilloOrigenId?: string;
  bolsilloDestinoId?: string;
  usuarioId?: string;
  
  // IDs de relaciones (versión backend)
  _id?: string;
  id_tipo_transaccion?: string;
  id_tipo_movimiento?: string;
  id_cuenta_origen?: string;
  id_cuenta_destino?: string;
  id_bolsillo_origen?: string;
  id_bolsillo_destino?: string;
  id_usuario?: string;
  usuario_id?: string;
  fecha_transaccion?: Date | string;
  
  // Relaciones expandidas (para respuestas populadas)
  tipo_transaccion?: any;
  tipo_movimiento?: any;
  cuenta_origen?: any;
  cuenta_destino?: any;
  bolsillo_origen?: any;
  bolsillo_destino?: any;
  
  // Versiones en camelCase para el frontend
  tipoTransaccion?: any;
  tipoMovimiento?: any;
  cuentaOrigen?: any;
  cuentaDestino?: any;
  bolsilloOrigen?: any;
  bolsilloDestino?: any;
  
  // Fechas
  fecha_creacion?: Date | string;
  fecha_actualizacion?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface TransaccionRequest {
  monto: number;
  descripcion: string;
  tipoMovimientoId: string;  // ID del tipo de movimiento
  cuentaOrigenId?: string;   // Para transferencias cuenta-cuenta, cuenta-bolsillo
  cuentaDestinoId?: string;  // Para transferencias cuenta-cuenta, bolsillo-cuenta
  bolsilloOrigenId?: string; // Para transferencias bolsillo-cuenta
  bolsilloDestinoId?: string; // Para transferencias cuenta-bolsillo
}

export enum EstadoTransaccion {
  PENDIENTE = 'PENDIENTE',
  COMPLETADA = 'COMPLETADA',
  ANULADA = 'ANULADA',
  RECHAZADA = 'RECHAZADA'
}

export enum TipoTransaccion {
  CUENTA_CUENTA = 'CUENTA_CUENTA',
  CUENTA_BOLSILLO = 'CUENTA_BOLSILLO',
  BOLSILLO_CUENTA = 'BOLSILLO_CUENTA',
  BANCO_CUENTA = 'BANCO_CUENTA',
  BANCO_BOLSILLO = 'BANCO_BOLSILLO',
  CUENTA_BANCO = 'CUENTA_BANCO'
}