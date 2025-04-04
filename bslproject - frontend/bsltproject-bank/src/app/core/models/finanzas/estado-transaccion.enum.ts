/**
 * Interface para el estado de transacción
 * Reemplaza el enum hardcodeado para usar datos dinámicos de la base de datos
 */
export interface EstadoTransaccion {
  id: string;
  nombre: string;
  descripcion?: string;
}

// Para compatibilidad con código existente, mantenemos estos valores como constantes
// pero el código debería migrar a usar los valores dinámicos de la base de datos
export const ESTADOS_TRANSACCION = {
  PENDIENTE: 'PENDIENTE',
  APROBADA: 'APROBADA',
  RECHAZADA: 'RECHAZADA',
  CANCELADA: 'CANCELADA'
};
