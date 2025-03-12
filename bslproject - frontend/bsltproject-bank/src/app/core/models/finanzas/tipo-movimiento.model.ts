/**
 * Modelo de Tipo de Movimiento
 * 
 * Representa un tipo de movimiento financiero
 */
export interface TipoMovimiento {
  /**
   * Identificador único del tipo de movimiento
   */
  id: string;
  /**
   * Nombre del tipo de movimiento
   */
  nombre: string;
  /**
   * Indica si el tipo de movimiento permite bolsillo
   */
  permiteBolsillo: boolean;
  /**
   * Indica si el tipo de movimiento está activo
   */
  activo: boolean;
}
