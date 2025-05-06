import { Bolsillo } from './bolsillo.model';

export interface Cuenta {
  _id?: string;
  id?: string;
  numero_cuenta: string;
  color: string;
  saldo: number;
  meta_ahorro: number;
  tipo: string;
  createdAt?: Date;
  usuario_id?: string;
  id_bolsillo?: string | null;

  // Campos para visualización
  usuarioNombre?: string;
  tieneBolsillo?: boolean;
  bolsillos?: Bolsillo[];
}
