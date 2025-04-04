// src/app/core/models/finanzas/tipo-movimiento.model.ts
export interface TipoMovimiento {
    id: string;
    nombre: string;
    descripcion?: string;
    codigoOrigen: string;
    codigoDestino: string;
    permiteBolsillo?: boolean;
    activo?: boolean;
    
    // Para compatibilidad
    codigo_origen?: string;
    codigo_destino?: string;
    estado?: boolean;
  }