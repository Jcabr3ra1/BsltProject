// src/app/core/models/seguridad/usuario.model.ts
export interface Usuario {
  id: string;
  nombre: string;
  apellido?: string;
  email: string;
  password?: string;
  rol?: string | Rol;
  estado?: string | Estado;
  cuenta?: string | Cuenta;
  cuentaId?: string;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
  
  // Propiedades en inglés para compatibilidad
  name?: string;
  lastName?: string;
  role?: string | Rol;
  state?: string | Estado;
  account?: string | Cuenta;
  accountId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Rol {
  id: string;
  nombre: string;
  descripcion?: string;
  permisos?: any[];
}

export interface Estado {
  id: string;
  nombre: string;
  descripcion?: string;
}

export interface Cuenta {
  id?: string;
  numero?: string;
  saldo?: number;
  tipo?: string;
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

export interface RegistroRequest {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
}

// Definir alias para compatibilidad hacia atrás
export type User = Usuario;