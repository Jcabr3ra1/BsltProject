import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Usuario, RolUsuario, EstadoUsuario } from '../../../core/models/seguridad/usuario.model';
import { UsuariosService } from '../../../core/services/seguridad/usuarios.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss']
})
export class UsuariosComponent implements OnInit {
  displayedColumns: string[] = ['id', 'nombre', 'apellido', 'email', 'rol', 'estado', 'acciones'];
  dataSource: MatTableDataSource<Usuario>;
  loading = false;
  error: string | null = null;

  filtroRol: RolUsuario | null = null;
  filtroEstado: EstadoUsuario | null = null;

  roles = [
    { id: RolUsuario.ADMIN, name: 'Administrador' },
    { id: RolUsuario.EMPLEADO, name: 'Empleado' },
    { id: RolUsuario.CLIENTE, name: 'Cliente' }
  ];

  estados = [
    { id: EstadoUsuario.ACTIVO, name: 'Activo' },
    { id: EstadoUsuario.INACTIVO, name: 'Inactivo' },
    { id: EstadoUsuario.PENDIENTE, name: 'Pendiente' }
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private usuariosService: UsuariosService,
    private snackBar: MatSnackBar
  ) {
    this.dataSource = new MatTableDataSource<Usuario>();
  }

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  cargarUsuarios() {
    this.loading = true;
    this.error = null;

    this.usuariosService.getUsuarios().subscribe({
      next: (usuarios) => {
        // Verificar los valores de roles y estados
        usuarios.forEach(usuario => {
          console.log(`Usuario: ${usuario.nombre}, Rol: ${usuario.rol}, Estado: ${usuario.estado}`);
        });
        
        this.dataSource.data = usuarios;
        
        // Forzar la detección de cambios
        setTimeout(() => {
          this.dataSource._updateChangeSubscription();
        });
        
        this.loading = false;
        this.mostrarSnackBar('Usuarios cargados correctamente', 'success-snackbar');
      },
      error: (error) => {
        this.error = 'Error al cargar usuarios: ' + error.message;
        this.loading = false;
        this.mostrarSnackBar('Error al cargar usuarios', 'error-snackbar');
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  aplicarFiltros() {
    this.dataSource.filterPredicate = (data: Usuario) => {
      const cumpleRol = !this.filtroRol || data.rol === this.filtroRol;
      const cumpleEstado = !this.filtroEstado || data.estado === this.filtroEstado;
      return cumpleRol && cumpleEstado;
    };
    this.dataSource.filter = ' '; // Trigger filter
    
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onRolChange(usuario: Usuario, nuevoRol: RolUsuario) {
    this.usuariosService.actualizarRol(usuario.id, nuevoRol).subscribe({
      next: () => {
        usuario.rol = nuevoRol;
        this.mostrarSnackBar('Rol actualizado correctamente', 'success-snackbar');
      },
      error: (error) => {
        this.mostrarSnackBar('Error al actualizar rol: ' + error.message, 'error-snackbar');
      }
    });
  }

  onEstadoChange(usuario: Usuario, nuevoEstado: EstadoUsuario) {
    this.usuariosService.actualizarEstado(usuario.id, nuevoEstado).subscribe({
      next: () => {
        usuario.estado = nuevoEstado;
        this.mostrarSnackBar('Estado actualizado correctamente', 'success-snackbar');
      },
      error: (error) => {
        this.mostrarSnackBar('Error al actualizar estado: ' + error.message, 'error-snackbar');
      }
    });
  }

  eliminarUsuario(usuario: Usuario) {
    if (confirm(`¿Está seguro que desea eliminar al usuario ${usuario.nombre} ${usuario.apellido}?`)) {
      this.usuariosService.eliminarUsuario(usuario.id).subscribe({
        next: () => {
          this.dataSource.data = this.dataSource.data.filter(u => u.id !== usuario.id);
          this.mostrarSnackBar('Usuario eliminado correctamente', 'success-snackbar');
        },
        error: (error) => {
          this.mostrarSnackBar('Error al eliminar usuario: ' + error.message, 'error-snackbar');
        }
      });
    }
  }
  
  mostrarSnackBar(mensaje: string, panelClass: string) {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [panelClass]
    });
  }

  getRolName(rolId: string): string {
    const rol = this.roles.find(r => r.id === rolId);
    return rol ? rol.name : 'Desconocido';
  }

  getEstadoName(estadoId: string): string {
    const estado = this.estados.find(e => e.id === estadoId);
    return estado ? estado.name : 'Desconocido';
  }

  compareWithFn(item1: any, item2: any): boolean {
    return item1 && item2 && item1 === item2;
  }
}
