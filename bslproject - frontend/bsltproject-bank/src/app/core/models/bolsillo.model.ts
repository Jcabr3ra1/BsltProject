export interface Bolsillo {
  id: string;
  _id?: string;
  nombre: string;
  color: string;
  saldo: number;
  id_cuenta: string;
  usuario_id?: string; // ← ✅ Agregado aquí
}
