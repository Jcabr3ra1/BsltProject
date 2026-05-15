import { Rol } from './rol.model';
import { Estado } from './estado.model';

export interface Usuario {
  id?: string;
  _id?: string;
  nombre: string;
  apellido: string;
  email: string;
  password?: string;
  cuentaId?: string;
  roles?: Rol[];
  estado?: Estado;
  cuenta?: {
    id: string;
    tipo: string;
    saldo: number;
  };
}
