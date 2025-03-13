/**
 * Modelo de Usuario
 * 
 * Representa un usuario en el sistema de seguridad
 */
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  rol?: Role;
  estado?: State;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Modelo de Rol
 * 
 * Representa un rol en el sistema que agrupa permisos
 */
export interface Role {
  id: string;
  nombre: string;
  descripcion?: string;
  permisos?: string[];
}

/**
 * Modelo de Estado de Usuario
 * 
 * Representa el estado actual de un usuario (activo, inactivo, bloqueado, etc.)
 */
export interface State {
  id: string;
  nombre: string;
  descripcion?: string;
}

/**
 * Modelo para solicitud de inicio de sesión
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Modelo para respuesta de inicio de sesión
 */
export interface LoginResponse {
  token: string;
  usuario?: User;
  expiracion?: number;
}

/**
 * Modelo para solicitud de registro
 */
export interface RegistroRequest {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
}

/**
 * Modelo para respuesta de registro
 */
export interface RegistroResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  rol?: Role;
  estado?: State;
  createdAt?: Date;
  updatedAt?: Date;
}
