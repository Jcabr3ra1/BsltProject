import { Permiso } from './permiso.model';

export interface Rol {
  id?: string;
  _id?: string;         // Opcional porque al crear aún no existe
  nombre: string;
  permisos?: Permiso[]; // Opcional, algunos usos no cargan permisos
}
