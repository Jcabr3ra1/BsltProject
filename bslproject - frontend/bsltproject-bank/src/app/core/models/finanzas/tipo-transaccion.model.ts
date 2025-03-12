/**
 * Modelo de Tipo de Transacción
 * 
 * Representa un tipo de transacción en el sistema financiero
 */
export interface TipoTransaccion {
  id: string;
  nombre: string;
  descripcion: string;
  requiereDestino: boolean;
  activo: boolean;
}
