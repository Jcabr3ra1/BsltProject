import { Cuenta } from './cuenta.model';
import { Usuario } from '../seguridad/usuario.model';

/**
 * Modelo de Bolsillo
 * 
 * Representa un bolsillo asociado a una cuenta
 */
export interface Bolsillo {
  id: string;
  nombre: string;
  saldo: number;
  cuentaId: string;
  cuenta?: Cuenta;
  usuarioId: string;
  usuario?: Usuario;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  estado: boolean;
}

/**
 * Modelo para solicitud de creación de bolsillo
 */
export interface BolsilloRequest {
  nombre: string;
  cuentaId: string;
}
