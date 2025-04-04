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
   * Descripción detallada del tipo de movimiento
   */
  descripcion?: string;
  /**
   * Código que identifica el origen del movimiento (ACCOUNT, WALLET, BANK)
   */
  codigoOrigen: string;
  /**
   * Código que identifica el destino del movimiento (ACCOUNT, WALLET, BANK)
   */
  codigoDestino: string;
  /**
   * Indica si el tipo de movimiento permite bolsillo
   */
  permiteBolsillo: boolean;
  /**
   * Indica si el tipo de movimiento está activo
   */
  activo: boolean;

  /**
   * Para compatibilidad con código existente
   */
  codigo_origen?: string;  
  codigo_destino?: string;
  estado?: boolean;
}
