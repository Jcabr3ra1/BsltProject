// src/app/core/models/finanzas/estado-transaccion.model.ts

export interface EstadoTransaccion {
  id: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
  fechaCreacion?: Date | string;
  fechaActualizacion?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export enum EstadoTransaccionEnum {
  PENDIENTE = 'PENDIENTE',
  APROBADA = 'APROBADA',
  RECHAZADA = 'RECHAZADA',
  CANCELADA = 'CANCELADA',
  EN_PROCESO = 'EN_PROCESO',
  COMPLETADA = 'COMPLETADA',
  ERROR = 'ERROR'
}
