export interface Transaccion {
    id?: string;
    _id?: string;
    descripcion: string;
    fecha_transaccion: string;
    monto: number;
    id_bolsillo_origen?: string;
    id_bolsillo_destino?: string;
    id_cuenta_origen?: string;
    id_cuenta_destino?: string;
    id_tipo_movimiento: string;
    id_tipo_transaccion: string;
    estado?: string; // ANULADA / ACTIVA
    tipo_movimiento?: any;
    tipo_transaccion?: any;
    cuenta_origen?: any;
    cuenta_destino?: any;
    bolsillo_origen?: any;
    bolsillo_destino?: any;
  }
  