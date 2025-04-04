// src/app/core/models/finanzas/transaccion.model.ts
export interface Transaccion {
  id: string;
  monto: number;
  descripcion: string;
  fecha: Date;
  estado: string;
  
  // IDs de relaciones
  tipoTransaccionId?: string;
  cuentaOrigenId?: string;
  cuentaDestinoId?: string;
  bolsilloOrigenId?: string;
  bolsilloDestinoId?: string;
  usuarioId?: string;
  
  // Campos para compatibilidad
  tipo_transaccion_id?: string;
  cuenta_origen_id?: string;
  cuenta_destino_id?: string;
  bolsillo_origen_id?: string;
  bolsillo_destino_id?: string;
  usuario_id?: string;
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TransaccionRequest {
  monto: number;
  descripcion: string;
  tipoTransaccionId: string;
  cuentaOrigenId?: string;
  cuentaDestinoId?: string;
  bolsilloOrigenId?: string;
  bolsilloDestinoId?: string;
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