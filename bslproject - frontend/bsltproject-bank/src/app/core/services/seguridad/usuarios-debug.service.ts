import { Injectable } from '@angular/core';
import { Usuario, RolUsuario, EstadoUsuario } from '../../../core/models/seguridad/usuario.model';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuariosDebugService {
  constructor(private http: HttpClient) {}

  /**
   * Intercepta y depura la respuesta del API para usuarios
   * @param response Los datos de usuarios desde el API
   * @returns Los datos de usuarios con depuración
   */
  depurarUsuarios(usuarios: Usuario[]): Usuario[] {
    console.log('===== DEPURACIÓN DE USUARIOS =====');
    console.log('Usuarios recibidos:', usuarios);
    
    // Verificar tipos y valores de cada usuario
    usuarios.forEach((usuario, index) => {
      console.log(`[Usuario ${index}]`);
      console.log(`ID: ${usuario.id} (${typeof usuario.id})`);
      console.log(`Nombre: ${usuario.nombre} (${typeof usuario.nombre})`);
      console.log(`Apellido: ${usuario.apellido} (${typeof usuario.apellido})`);
      console.log(`Email: ${usuario.email} (${typeof usuario.email})`);
      console.log(`Rol: ${usuario.rol} (${typeof usuario.rol})`);
      console.log(`Estado: ${usuario.estado} (${typeof usuario.estado})`);
      
      // Verificar si los valores de rol y estado son válidos
      const rolValido = Object.values(RolUsuario).includes(usuario.rol as RolUsuario);
      const estadoValido = Object.values(EstadoUsuario).includes(usuario.estado as EstadoUsuario);
      
      console.log(`Rol válido: ${rolValido}`);
      console.log(`Estado válido: ${estadoValido}`);
      
      // Corregir problemas potenciales
      if (!rolValido) {
        console.warn(`Corrigiendo rol inválido: ${usuario.rol}`);
        usuario.rol = RolUsuario.CLIENTE; // Valor predeterminado
      }
      
      if (!estadoValido) {
        console.warn(`Corrigiendo estado inválido: ${usuario.estado}`);
        usuario.estado = EstadoUsuario.PENDIENTE; // Valor predeterminado
      }
    });
    
    console.log('===== FIN DE DEPURACIÓN =====');
    return usuarios;
  }

  /**
   * Método para interceptar la llamada al API y depurar
   */
  interceptGetUsuarios(originalObservable: Observable<Usuario[]>): Observable<Usuario[]> {
    return originalObservable.pipe(
      tap(usuarios => this.depurarUsuarios(usuarios))
    );
  }
}
