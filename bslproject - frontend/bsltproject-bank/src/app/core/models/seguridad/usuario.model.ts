/**
 * Modelo de Usuario
 * 
 * Representa un usuario en el sistema de seguridad
 */
export interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  fechaCreacion?: Date;
  ultimoAcceso?: Date;
  estadoId?: string;
  estado?: Estado;
  roles?: Rol[];
}

/**
 * Modelo de Estado de Usuario
 * 
 * Representa el estado actual de un usuario (activo, inactivo, bloqueado, etc.)
 */
export interface Estado {
  id: string;
  nombre: string;
  descripcion?: string;
}

/**
 * Modelo de Rol
 * 
 * Representa un rol en el sistema que agrupa permisos
 */
export interface Rol {
  id: string;
  nombre: string;
  descripcion?: string;
  permisos?: Permiso[];
}

/**
 * Modelo de Permiso
 * 
 * Representa un permiso específico en el sistema
 */
export interface Permiso {
  id: string;
  nombre: string;
  descripcion?: string;
  modulo: string;
  accion: string;
}

/**
 * Modelo para solicitud de inicio de sesión
 */
export interface LoginRequest {
  email: string;
  password: string;
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
 * Modelo para respuesta de autenticación
 */
export interface AuthResponse {
  token: string;
  refreshToken: string;
  usuario: Usuario;
  expiracion: number;
}
