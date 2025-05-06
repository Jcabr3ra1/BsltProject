import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { Bolsillo } from '../../../../../core/models/bolsillo.model';

@Injectable({
  providedIn: 'root',
})
export class BolsillosService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ✅ Obtener todos los bolsillos
  getBolsillos(): Observable<Bolsillo[]> {
    return this.http.get<Bolsillo[]>(`${this.baseUrl}/finanzas/bolsillos`);
  }
  

  // ✅ Crear un nuevo bolsillo
  crearBolsillo(datos: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/finanzas/bolsillos`, datos);
  }
  
  // ✅ Actualizar un bolsillo
  actualizarBolsillo(id: string, bolsillo: Partial<Bolsillo>): Observable<any> {
    return this.http.put(`${this.baseUrl}/finanzas/bolsillos/${id}`, bolsillo);
  }

  // ✅ Eliminar un bolsillo
  eliminarBolsillo(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/finanzas/bolsillos/${id}`);
  }

  desasociarYEliminarBolsillo(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/finanzas/bolsillos/${id}/desasociar`);
  }
  

  asignarBolsilloACuenta(id_bolsillo: string, id_cuenta: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/finanzas/bolsillos/${id_bolsillo}/cuentas/${id_cuenta}`, {});
  }
  
}
