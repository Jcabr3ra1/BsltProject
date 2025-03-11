export interface TipoMovimiento {
    id?: number;
    nombre: string;
    descripcion?: string;
    codigo_origen: string;  // ACCOUNT, WALLET, BANK
    codigo_destino: string; // ACCOUNT, WALLET, BANK
    estado: boolean;
}
