/**
 * Modelo de Tipo de Movimiento
 * 
 * Representa un tipo de movimiento financiero
 */
export interface TipoMovimiento {
  id: string;
  nombre: string;
  descripcion?: string;
  codigoOrigen: string;  // ACCOUNT, WALLET, BANK
  codigoDestino: string; // ACCOUNT, WALLET, BANK
  afectaSaldo: boolean;
  estado?: boolean;
  requiereDestino?: boolean; // Indica si el tipo de movimiento requiere un destino
}
