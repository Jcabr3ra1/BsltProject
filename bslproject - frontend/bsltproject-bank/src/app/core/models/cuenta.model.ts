export interface Cuenta {
  id: string;
  numero_cuenta: string;
  saldo: number;
  tipo_cuenta: string;
  estado: string;
  usuario_id: string;
  fecha_creacion: Date;
  fecha_actualizacion: Date;
}
