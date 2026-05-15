import { TipoMovimiento } from './movement-type.model';
import { TipoTransaccion } from './tipo_transaccion.model';
import { Cuenta } from './cuenta.model';
import { Bolsillo } from './bolsillo.model';

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
    tipo_movimiento?: TipoMovimiento;
    tipo_transaccion?: TipoTransaccion;
    cuenta_origen?: Cuenta;
    cuenta_destino?: Cuenta;
    bolsillo_origen?: Bolsillo;
    bolsillo_destino?: Bolsillo;
  }
  