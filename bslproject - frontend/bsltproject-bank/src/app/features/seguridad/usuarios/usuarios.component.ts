import { Component, WritableSignal, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UsuariosService } from '../../../core/services/seguridad/usuarios.service';

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  cuenta?: { numero_cuenta: string };
  cuentaNumero?: string;
  rol?: number;
  estado?: number;
}

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatPaginatorModule,
    MatTooltipModule
  ],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss']
})
export class UsuariosComponent {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  usuarios: Usuario[] = []; // Ahora es un array tipado de Usuario
  roles: any[] = [];
  estados: any[] = [];
  errorMessage: string = '';

  constructor(private usuarioService: UsuariosService) {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.usuarioService.obtenerUsuarios().subscribe({
      next: (data: any[]) => {
        console.log("Usuarios obtenidos:", data);
  
        this.usuarios = data.map((user) => {
          // Tomar el primer rol del array de roles
          const usuarioRol = user.roles.length > 0 ? user.roles[0].id : null;
          const usuarioEstado = user.estado ? user.estado.id : null; // Asegurar el estado
  
          return {
            ...user,
            cuentaNumero: user.cuenta ? user.cuenta.numero_cuenta : 'Sin cuenta',
            rol: usuarioRol, // Asignamos el ID del primer rol
            estado: usuarioEstado // Asignamos el ID del estado
          };
        });
  
        console.log("Usuarios procesados:", this.usuarios);
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar usuarios';
        console.error('Error:', error);
      }
    });
  
    this.usuarioService.obtenerRoles().subscribe({
      next: (data) => {
        this.roles = data;
        console.log("Roles obtenidos:", this.roles);
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar roles';
        console.error('Error:', error);
      }
    });
  
    this.usuarioService.obtenerEstados().subscribe({
      next: (data) => {
        this.estados = data;
        console.log("Estados obtenidos:", this.estados);
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar estados';
        console.error('Error:', error);
      }
    });
  }
  
  eliminarUsuario(id: number) {
    this.usuarioService.eliminarUsuario(id).subscribe({
      next: () => this.cargarUsuarios(),
      error: (error) => {
        console.error('Error al eliminar usuario:', error);
        this.errorMessage = 'Error al eliminar usuario';
      }
    });
  }

  actualizarUsuario(usuario: Usuario) {
    this.usuarioService.actualizarUsuario(usuario).subscribe({
      next: () => {
        console.log('Usuario actualizado correctamente');
      },
      error: (error) => {
        console.error('Error al actualizar usuario:', error);
        this.errorMessage = 'Error al actualizar usuario';
      }
    });
  }

  asignarRol(usuarioId: number, rolId: number) {
    this.usuarioService.asignarRol(usuarioId.toString(), rolId.toString()).subscribe({
      next: () => {
        console.log('Rol asignado correctamente');
      },
      error: (error) => {
        console.error('Error al asignar rol:', error);
        this.errorMessage = 'Error al asignar rol';
      }
    });
  }

  asignarEstado(usuarioId: number, estadoId: number) {
    this.usuarioService.asignarEstado(usuarioId.toString(), estadoId.toString()).subscribe({
      next: () => {
        console.log('Estado asignado correctamente');
      },
      error: (error) => {
        console.error('Error al asignar estado:', error);
        this.errorMessage = 'Error al asignar estado';
      }
    });
  }
}
