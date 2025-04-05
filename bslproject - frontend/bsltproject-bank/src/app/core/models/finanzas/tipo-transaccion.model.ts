export interface TipoTransaccion {
  id: string;
  nombre: string;
  descripcion?: string;
  codigo?: string;
  activo?: boolean;
  requiereDestino?: boolean;
}

export interface ConfiguracionTipoTransaccion {
  id: string;
  nombre: string;
  descripcion?: string;
  requiereDestino: boolean;
  activo?: boolean;
}