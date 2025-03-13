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
  EMPLEADO = 'EMPLEADO'
}

export enum EstadoUsuario {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
  PENDIENTE = 'PENDIENTE',
  BLOQUEADO = 'BLOQUEADO'
}

export interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: RolUsuario;
  estado: EstadoUsuario;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: Usuario;
  userId?: string;
  clientId?: string;
  sessionId?: string;
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
}

export interface ActualizacionUsuarioRequest {
  nombre?: string;
  apellido?: string;
  email?: string;
  password?: string;
  rol?: RolUsuario;
  estado?: EstadoUsuario;
}
