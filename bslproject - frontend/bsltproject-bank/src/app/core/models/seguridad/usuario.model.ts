/**
 * Modelo de Usuario
 * 
 * Representa un usuario en el sistema de seguridad
 */
// Alias para compatibilidad con código existente
export type User = Usuario;
export type Role = RolUsuario;
export type State = EstadoUsuario;

export enum RolUsuario {
  ADMIN = 'ADMIN',
  CLIENTE = 'CLIENTE',
  EMPLEADO = 'EMPLEADO',
  GERENTE = 'GERENTE',
  SUPERVISOR = 'SUPERVISOR',
  ANALISTA = 'ANALISTA'
}

export enum EstadoUsuario {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
  PENDIENTE = 'PENDIENTE',
  BLOQUEADO = 'BLOQUEADO',
  SUSPENDIDO = 'SUSPENDIDO',
  VERIFICANDO = 'VERIFICANDO'
}

export interface Cuenta {
  id?: string;
  _id?: string;
  numero?: string;
  numero_cuenta?: string;
  number?: string;
  saldo?: number;
  balance?: number;
  tipo?: string;
  type?: string;
  [key: string]: any; // Para permitir propiedades adicionales
}

export interface Usuario {
  id: string;
  _id?: string;
  nombre: string;
  name?: string;
  apellido?: string;
  lastName?: string;
  email: string;
  correo?: string;
  password?: string;
  rol?: RolUsuario | string;
  role?: string;
  estado?: EstadoUsuario | string;
  status?: string;
  // `undefined` es aceptable aquí, pero `null` no lo es en TypeScript estricto
  cuenta?: Cuenta | string;
  account?: Cuenta | string;
  accountId?: string;
  cuentaId?: string;
  [key: string]: any; // Para permitir propiedades adicionales
}

export interface Rol {
  id: string;
  nombre: string;
  descripcion?: string;
}

export interface Estado {
  id: string;
  nombre: string;
  descripcion?: string;
}

export interface RolUsuarioInfo {
  id: string;
  nombre: string;
  descripcion?: string;
  name?: string;
}

export interface PermisoUsuario {
  id: string;
  nombre: string;
  descripcion?: string;
}

export interface EstadoUsuarioInfo {
  id: string;
  nombre: string;
  descripcion?: string;
  name?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: Usuario;
  message?: string;
}

export interface TokenVerificationResponse {
  isValid: boolean;
  user?: Usuario;
}

export interface RegistroRequest {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  rol?: RolUsuario;
  estado?: EstadoUsuario;
  crearCuenta?: boolean;
  tipoCuenta?: string;
}

export interface ActualizacionUsuarioRequest {
  nombre?: string;
  apellido?: string;
  email?: string;
  password?: string;
  rol?: RolUsuario;
  estado?: EstadoUsuario;
}
