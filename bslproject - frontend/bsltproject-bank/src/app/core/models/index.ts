// Exportamos todos los modelos desde sus ubicaciones correctas

// Modelos de finanzas
export type { TipoMovimiento } from './finanzas/tipo-movimiento.model';
export type { Transaccion, TipoTransaccion } from './finanzas/transaccion.model';
export type { Bolsillo, BolsilloRequest } from './finanzas/bolsillo.model';
export type { Cuenta } from './finanzas/cuenta.model';

// Modelos de seguridad
export type { Usuario, Estado, Rol, Permiso } from './seguridad/usuario.model';

// Otros modelos
export type { User } from './user.model';
