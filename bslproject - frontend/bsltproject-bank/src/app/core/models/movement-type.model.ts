export interface TipoMovimiento {
    id?: string;
    _id?: string;
    codigo_origen: string;
    codigo_destino: string;
    descripcion: string;
    tipo_operacion?: string; // Tipo de operación (transferenciasCuentaCuenta, retiroBolsilloCuenta, etc.)
  }
  