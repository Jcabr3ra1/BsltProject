// src/app/core/models/finanzas/index.ts
export * from './bolsillo.model';
export * from './cuenta.model';
export * from './tipo-movimiento.model';

// Importar con nombres diferentes para evitar ambigüedad
import { TipoTransaccion as TipoTransaccionEnum } from './transaccion.model';
import { TipoTransaccion as TipoTransaccionEntity } from './tipo-transaccion.model';

// Exportar selectivamente desde transaccion.model
// Valores
export { EstadoTransaccion } from './transaccion.model';

// Tipos
export type { 
  Transaccion,
  TransaccionRequest,
  Transaction,
  TransactionType,
  TransactionStatus,
  TransactionFilters
} from './transaccion.model';

// Exportar selectivamente desde tipo-transaccion.model
export type { 
  ConfiguracionTipoTransaccion 
} from './tipo-transaccion.model';

// Exportar los tipos renombrados para evitar conflictos
export type { TipoTransaccionEnum, TipoTransaccionEntity };