export interface Transaccion {
  id: string;
  monto: number;
  descripcion: string;
  fecha: Date;
  estado: string;
  tipo_transaccion_id: string;
  cuenta_origen_id: string;
  cuenta_destino_id?: string;
  bolsillo_origen_id?: string;
  bolsillo_destino_id?: string;
  usuario_id: string;
  fecha_creacion: Date;
  fecha_actualizacion: Date;
}
