export interface User {
  id: string;
  username: string;
  email: string;
  nombre?: string;
  apellido?: string;
  roles?: string[];
  estado_id?: string;
  estado?: string;
  cuentaId?: string;
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;
  token?: string;
}
