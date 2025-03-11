// Exportaciones explícitas para evitar ambigüedades
import { TipoMovimiento } from './tipo-movimiento.model';
import { Transaccion, TipoTransaccion } from './transaccion.model';
import { Bolsillo, BolsilloRequest } from './bolsillo.model';
import { Cuenta } from './cuenta.model';

// Usar 'export type' para interfaces cuando isolatedModules está habilitado
export type { 
  TipoMovimiento,
  Transaccion,
  TipoTransaccion,
  Bolsillo,
  BolsilloRequest,
  Cuenta
};
