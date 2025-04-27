export interface Usuario {
  id?: string;
  nombre: string;
  apellido: string;
  email: string; // <- antes era email, ahora igual que backend
  password?: string;
  cuentaId?: string;
  roles?: string[];
  estado?: {
    id: string;
    nombre: string;
  };
  cuenta?: { // <- Opcional si quieres traer info de cuenta bancaria
    id: string;
    tipo: string;
    saldo: number;
  };
}
