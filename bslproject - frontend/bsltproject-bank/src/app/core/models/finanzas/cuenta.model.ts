/**
 * Modelo de datos para cuentas bancarias
 * Incluye interfaces y enums para manejar diferentes tipos de cuentas
 */
import { Bolsillo } from './bolsillo.model';
import { Usuario } from '../seguridad/usuario.model';

/**
 * Tipos de cuentas bancarias disponibles en el sistema
 */
export enum TipoCuenta {
  CUENTA_CORRIENTE = 'CUENTA_CORRIENTE',
  CUENTA_AHORRO = 'CUENTA_AHORRO',
  CUENTA_NOMINA = 'CUENTA_NOMINA',
  CUENTA_INFANTIL = 'CUENTA_INFANTIL',
  CUENTA_JOVEN = 'CUENTA_JOVEN',
  BOLSILLO = 'BOLSILLO'
}

/**
 * Interfaz principal para cuentas bancarias
 * Incluye propiedades normalizadas y alternativas para compatibilidad con el backend
 */
export interface Cuenta {
  // Identificadores
  id: string;
  _id?: string; // Alternativa de MongoDB
  
  // Datos básicos
  numero: string;
  numero_cuenta?: string; // Alternativa del backend
  tipo: TipoCuenta | string;
  tipo_cuenta?: string; // Alternativa del backend
  saldo: number;
  
  // Datos de presentación
  nombre?: string;
  color?: string;
  
  // Relaciones (formato camelCase)
  usuarioId?: string;
  bolsilloId?: string;
  
  // Relaciones (formato snake_case para compatibilidad con backend)
  id_bolsillo?: string;
  userId?: string;
  id_usuario?: string;
  usuario_id?: string;
  
  // Relaciones expandidas
  usuario?: Usuario | null;
  bolsillos?: Bolsillo[] | null;
  
  // Fechas (con diferentes formatos para compatibilidad)
  createdAt?: Date | string;
  updatedAt?: Date | string;
  fechaCreacion?: Date | string;
  fechaActualizacion?: Date | string;
  fecha_creacion?: Date | string;
  fecha_actualizacion?: Date | string;
  
  // Metadatos adicionales
  activa?: boolean;
  estado?: string;
}

/**
 * Interfaz para solicitudes de creación de cuentas
 * Contiene los campos mínimos necesarios para crear una cuenta
 */
export interface CuentaRequest {
  numero?: string;
  tipo: TipoCuenta | string;
  saldo?: number;
  usuarioId?: string;
  nombre?: string;
  color?: string;
}

/**
 * Interfaz para filtros de búsqueda de cuentas
 */
export interface CuentaFiltros {
  tipo?: TipoCuenta | string | null;
  usuarioId?: string | null;
  activa?: boolean | null;
  saldoMinimo?: number | null;
  saldoMaximo?: number | null;
}

// Alias en inglés para compatibilidad con componentes existentes
export type Account = Cuenta;
export type AccountType = TipoCuenta;
export type AccountRequest = CuentaRequest;
export type AccountFilters = CuentaFiltros;