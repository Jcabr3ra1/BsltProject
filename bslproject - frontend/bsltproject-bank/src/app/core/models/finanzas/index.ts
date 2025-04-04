// Exportar modelos de finanzas de forma explícita
export type { TipoMovimiento } from './tipo-movimiento.model';
export type { 
  Transaccion, 
  TransaccionRequest,
  TransaccionFiltros,
  TipoTransaccion,
  Transaction,
  CreateTransactionRequest,
  TransactionFilters
} from './transaccion.model';
export { 
  TipoTransaccionEnum, 
  EstadoTransaccionEnum,
  TransactionType,
  TransactionStatus 
} from './transaccion.model';
export type { 
  Bolsillo, 
  BolsilloRequest,
  Pocket,
  PocketRequest 
} from './bolsillo.model';
export type { 
  Cuenta, 
  Account,
  TipoCuenta,
  CreateAccountRequest,
  AccountFilters
} from './cuenta.model';
export { AccountType } from './cuenta.model';
