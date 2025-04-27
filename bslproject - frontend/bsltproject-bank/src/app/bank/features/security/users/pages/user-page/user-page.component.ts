import { Component, OnInit, ViewChild } from '@angular/core';
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
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { UsuariosService } from '../../services/usuarios.service';
import { forkJoin } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
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
    FormsModule
  ],
  templateUrl: './user-page.component.html',
  styleUrls: ['./user-page.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(10px)' }))
      ])
    ])
  ]
})
export class UserPageComponent implements OnInit {
  // Datos principales
  usuarios: any[] = [];
  roles: any[] = [];
  estados: any[] = [];
  filteredUsuarios: any[] = [];
  selectedUser: any = null;
  searchTerm: string = '';
  
  // Estadísticas
  get totalUsers(): number {
    return this.usuarios.length;
  }
  
  get activeUsers(): number {
    return this.usuarios.filter(u => u.estado && u.estado.nombre === 'Activo').length;
  }
  
  get adminUsers(): number {
    return this.usuarios.filter(u => u.roles && u.roles[0] && u.roles[0].nombre === 'ADMIN').length;
  }
  
  // Colores para avatares
  avatarColors: string[] = [
    '#a46cf5', // Morado principal
    '#8e57d6', // Morado secundario
    '#7145b8', // Morado oscuro
    '#b884ff', // Morado claro
    '#5e3694'  // Morado muy oscuro
  ];

  displayedColumns: string[] = ['nombre', 'email', 'tieneCuenta', 'estado', 'rol', 'acciones'];
  dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private usuariosService: UsuariosService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  cargarDatos() {
    forkJoin({
      usuarios: this.usuariosService.getUsuarios(),
      cuentas: this.usuariosService.getCuentas(),
      roles: this.usuariosService.getRoles(),
      estados: this.usuariosService.getEstados()
    }).subscribe(({ usuarios, cuentas, roles, estados }) => {
      this.roles = roles;
      this.estados = estados;
      this.usuarios = usuarios.map((usuario) => {
        const tieneCuenta = cuentas.some((c) => c.usuario_id === usuario.id);
        return { ...usuario, tieneCuenta };
      });
      this.filteredUsuarios = [...this.usuarios];
      this.dataSource.data = this.filteredUsuarios;
    });
  }

  // Método para filtrar usuarios
  filtrarUsuarios() {
    if (!this.searchTerm) {
      this.filteredUsuarios = [...this.usuarios];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredUsuarios = this.usuarios.filter(user => 
        user.nombre.toLowerCase().includes(term) || 
        user.apellido.toLowerCase().includes(term) || 
        user.email.toLowerCase().includes(term) ||
        (user.roles && user.roles[0] && user.roles[0].nombre.toLowerCase().includes(term))
      );
    }
    this.dataSource.data = this.filteredUsuarios;
  }

  // Método para seleccionar un usuario y mostrar detalles
  selectUser(user: any) {
    this.selectedUser = this.selectedUser && this.selectedUser.id === user.id ? null : user;
  }

  // Obtener iniciales para el avatar
  getInitials(nombre: string, apellido: string): string {
    const firstInitial = nombre ? nombre.charAt(0).toUpperCase() : '';
    const secondInitial = apellido ? apellido.charAt(0).toUpperCase() : '';
    return `${firstInitial}${secondInitial}`;
  }

  // Generar color para avatar basado en el nombre
  getAvatarColor(nombre: string): string {
    if (!nombre) return this.avatarColors[0];
    
    // Generar un índice basado en la suma de los códigos ASCII de los caracteres del nombre
    const charSum = nombre.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const colorIndex = charSum % this.avatarColors.length;
    return this.avatarColors[colorIndex];
  }

  // Obtener ID de estado por nombre
  getEstadoIdByName(nombreEstado: string): string {
    const estado = this.estados.find(e => e.nombre === nombreEstado);
    return estado ? estado.id : '';
  }

  cambiarRol(usuario: any, rolId: string) {
    if (usuario.roles?.[0]?.id === rolId) return; // No hacer nada si es el mismo rol

    const payload = {
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      roles: [{ id: rolId }],
      estado: usuario.estado 
    };

    this.usuariosService.actualizarUsuario(usuario.id, payload).subscribe({
      next: () => {
        this.cargarDatos(); // Recargar datos después del cambio
        if (this.selectedUser && this.selectedUser.id === usuario.id) {
          // Actualizar usuario seleccionado si es el mismo que se está editando
          this.selectedUser = null; // Cerrar el panel de detalles para refrescar
          setTimeout(() => {
            this.selectedUser = this.usuarios.find(u => u.id === usuario.id);
          }, 300);
        }
      },
      error: (error) => console.error('Error al cambiar rol:', error)
    });
  }

  cambiarEstado(usuario: any, estadoId: string) {
    if (usuario.estado?.id === estadoId) return; // No hacer nada si es el mismo estado

    const payload = {
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      roles: usuario.roles,
      estado: { id: estadoId }
    };

    this.usuariosService.actualizarUsuario(usuario.id, payload).subscribe({
      next: () => {
        this.cargarDatos(); // Recargar datos después del cambio
        if (this.selectedUser && this.selectedUser.id === usuario.id) {
          // Actualizar usuario seleccionado si es el mismo que se está editando
          this.selectedUser = null; // Cerrar el panel de detalles para refrescar
          setTimeout(() => {
            this.selectedUser = this.usuarios.find(u => u.id === usuario.id);
          }, 300);
        }
      },
      error: (error) => console.error('Error al cambiar estado:', error)
    });
  }

  editarUsuario(usuario: any) {
    // Detener la propagación del evento para evitar seleccionar el usuario al mismo tiempo
    event?.stopPropagation();
    
    const dialogRef = this.dialog.open(EditarUsuarioDialogComponent, {
      width: '450px',
      data: usuario,
      panelClass: 'custom-dialog'
    });
  
    dialogRef.afterClosed().subscribe((actualizado) => {
      if (actualizado) {
        this.cargarDatos();
        // Si estaba seleccionado, actualizar la vista de detalles
        if (this.selectedUser && this.selectedUser.id === usuario.id) {
          this.selectedUser = null; // Cerrar el panel de detalles para refrescar
          setTimeout(() => {
            this.selectedUser = this.usuarios.find(u => u.id === usuario.id);
          }, 300);
        }
      }
    });
  }

  eliminarUsuario(usuario: any) {
    // Detener la propagación del evento para evitar seleccionar el usuario al mismo tiempo
    event?.stopPropagation();
    
    const confirmado = confirm(`¿Estás seguro de que deseas eliminar a ${usuario.nombre} ${usuario.apellido}?`);
  
    if (confirmado) {
      this.usuariosService.eliminarUsuario(usuario.id).subscribe({
        next: () => {
          this.cargarDatos();
          // Si estaba seleccionado, cerrar el panel de detalles
          if (this.selectedUser && this.selectedUser.id === usuario.id) {
            this.selectedUser = null;
          }
        },
        error: (error) => console.error('Error al eliminar usuario:', error)
      });
    }
  }
  
  abrirFormularioUsuario() {
    const dialogRef = this.dialog.open(CrearUsuarioDialogComponent, {
      width: '450px',
      panelClass: 'custom-dialog'
    });
  
    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        this.cargarDatos();
      }
    });
  }
}