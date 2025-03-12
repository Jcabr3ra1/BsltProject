export interface Rol {
  id: string;
  nombre: string;
  descripcion: string;
  permisos?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}
