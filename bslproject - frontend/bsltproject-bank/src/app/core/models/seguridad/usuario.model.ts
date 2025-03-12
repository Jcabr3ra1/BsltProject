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
  role?: Role;
  state?: State;
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
  name: string;
  description?: string;
  permissions?: string[];
}

/**
 * Modelo de Estado de Usuario
 * 
 * Representa el estado actual de un usuario (activo, inactivo, bloqueado, etc.)
 */
export interface State {
  id: string;
  name: string;
  description?: string;
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
  refreshToken: string;
  user?: User;
  expiracion?: number;
}

/**
 * Modelo para solicitud de registro
 */
export interface RegistroRequest {
  firstName: string;
  lastName: string;
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
  role?: Role;
  state?: State;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Modelo para solicitud de refresco de token
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * Modelo para respuesta de refresco de token
 */
export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
  expiracion?: number;
}
