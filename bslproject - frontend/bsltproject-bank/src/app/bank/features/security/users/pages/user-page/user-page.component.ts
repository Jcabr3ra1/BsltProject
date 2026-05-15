import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from '../../services/usuarios.service';
import { forkJoin } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { Usuario } from '../../../../../../core/models/usuario.model';
import { Rol } from '../../../../../../core/models/rol.model';
import { Estado } from '../../../../../../core/models/estado.model';
import { CrearUsuarioDialogComponent } from '../../shared/dialogs/crear-usuario-dialog/crear-usuario-dialog.component';
import { EditarUsuarioDialogComponent } from '../../shared/dialogs/editar-usuario-dialog/editar-usuario-dialog.component';

@Component({
  selector: 'app-user-page',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatInputModule,
    MatPaginatorModule,
    MatSortModule,
    MatTooltipModule,
    MatSnackBarModule,
    FormsModule,
  ],
  templateUrl: './user-page.component.html',
  styleUrls: ['./user-page.component.css'],
})
export class UserPageComponent implements OnInit, AfterViewInit {
  usuarios: Usuario[] = [];
  roles: Rol[] = [];
  estados: Estado[] = [];
  filteredUsuarios: Usuario[] = [];
  searchTerm: string = '';

  displayedColumns: string[] = ['nombre', 'email', 'tieneCuenta', 'rol', 'estado', 'acciones'];
  dataSource = new MatTableDataSource<Usuario>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private usuariosService: UsuariosService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  ngAfterViewInit() {
    if (this.paginator && this.sort) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  cargarDatos() {
    forkJoin({
      usuarios: this.usuariosService.getUsuarios(),
      cuentas: this.usuariosService.getCuentas(),
      roles: this.usuariosService.getRoles(),
      estados: this.usuariosService.getEstados(),
    }).subscribe({
      next: ({ usuarios, cuentas, roles, estados }) => {
        this.roles = roles;
        this.estados = estados;

        this.usuarios = usuarios.map((usuario) => {
          const tieneCuenta = cuentas.some((c) => c.usuario_id === usuario.id);
          return { ...usuario, tieneCuenta };
        });

        this.filteredUsuarios = [...this.usuarios];
        this.dataSource.data = this.filteredUsuarios;

        if (this.paginator && this.sort) {
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        }
      },
      error: (err) => {
        this.mostrarError(
          'Error al cargar los datos. Por favor, intente nuevamente.'
        );
      },
    });
  }

  mostrarError(mensaje: string, duracion: number = 5000) {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: duracion,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['error-snackbar'],
    });
  }

  mostrarExito(mensaje: string, duracion: number = 3000) {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: duracion,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['success-snackbar'],
    });
  }

  filtrarUsuarios() {
    if (!this.searchTerm) {
      this.filteredUsuarios = [...this.usuarios];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredUsuarios = this.usuarios.filter(
        (user) =>
          (user.nombre?.toLowerCase() || '').includes(term) ||
          (user.apellido?.toLowerCase() || '').includes(term) ||
          (user.email?.toLowerCase() || '').includes(term) ||
          (user.roles?.[0]?.nombre?.toLowerCase() || '').includes(term)
      );
    }
    this.dataSource.data = this.filteredUsuarios;

    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  getEstadoIdByName(nombreEstado: string): string {
    const estado = this.estados.find((e) => e.nombre === nombreEstado);
    return estado?.id ?? '';
  }

  cambiarRol(usuario: Usuario, rolId: string) {
    if (usuario.roles?.[0]?.id === rolId) return; // No hacer nada si es el mismo rol

    const payload = {
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      roles: [{ id: rolId }],
      estado: usuario.estado,
    };

    this.usuariosService.actualizarUsuario(usuario.id!, payload).subscribe({
      next: () => {
        this.cargarDatos(); // Recargar datos después del cambio
        this.mostrarExito(`Rol actualizado correctamente`);
      },
      error: (error) => {
        this.mostrarError('Error al cambiar el rol. Inténtelo nuevamente.');
      },
    });
  }

  cambiarEstado(usuario: Usuario, estadoId: string) {
    if (usuario.estado?.id === estadoId) return; // No hacer nada si es el mismo estado

    const payload = {
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      roles: usuario.roles,
      estado: { id: estadoId },
    };

    this.usuariosService.actualizarUsuario(usuario.id!, payload).subscribe({
      next: () => {
        this.cargarDatos(); // Recargar datos después del cambio
        this.mostrarExito(`Estado actualizado correctamente`);
      },
      error: (error) => {
        this.mostrarError('Error al cambiar el estado. Inténtelo nuevamente.');
      },
    });
  }

  editarUsuario(usuario: Usuario) {
    event?.stopPropagation();

    const dialogRef = this.dialog.open(EditarUsuarioDialogComponent, {
      width: '450px',
      data: {
        usuario: usuario,
        roles: this.roles,
        estados: this.estados,
      },
      panelClass: ['custom-dialog', 'custom-dark-dialog'],
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado === true) {
        this.cargarDatos();
        this.mostrarExito('Usuario actualizado correctamente');
      } else if (resultado && resultado.error) {
        if (
          resultado.error.includes('correo electrónico ya está en uso') ||
          resultado.error.includes('email already exists') ||
          resultado.error.includes('duplicate key') ||
          resultado.error.includes('already exists')
        ) {
          this.mostrarError(
            'El correo electrónico ya está registrado en el sistema'
          );
        } else {
          this.mostrarError(
            resultado.error || 'Error al actualizar el usuario'
          );
        }
      }
    });
  }

  eliminarUsuario(usuario: Usuario) {
    event?.stopPropagation();

    const confirmado = confirm(
      `¿Estás seguro de que deseas eliminar a ${usuario.nombre} ${usuario.apellido}?`
    );

    if (confirmado) {
      this.usuariosService.eliminarUsuario(usuario.id!).subscribe({
        next: () => {
          this.cargarDatos();
          this.mostrarExito('Usuario eliminado correctamente');
        },
        error: (error) => {
          this.mostrarError(
            'Error al eliminar el usuario. Inténtelo nuevamente.'
          );
        },
      });
    }
  }

  abrirFormularioUsuario() {
    const dialogRef = this.dialog.open(CrearUsuarioDialogComponent, {
      width: '450px',
      data: {
        roles: this.roles,
        estados: this.estados,
      },
      panelClass: ['custom-dialog', 'custom-dark-dialog'],
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado === true) {
        this.cargarDatos();
        this.mostrarExito('Usuario creado correctamente');
      } else if (resultado && resultado.error) {
        if (
          typeof resultado.error === 'string' &&
          (resultado.error.includes('correo electrónico ya está registrado') ||
            resultado.error.includes('email already exists') ||
            resultado.error.includes('duplicate key') ||
            resultado.error.includes('already exists') ||
            resultado.error.includes('ya está registrado'))
        ) {
          this.mostrarError(
            'El correo electrónico ya está registrado en el sistema'
          );
        } else {
          this.mostrarError(
            typeof resultado.error === 'string'
              ? resultado.error
              : 'Error al crear el usuario'
          );
        }
      }
    });
  }
}   