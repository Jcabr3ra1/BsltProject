import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';


import { RolesService } from '../../services/roles.service';
import { Rol } from '../../../../../../core/models/rol.model';

// Importar los nuevos diálogos
import { CrearRolDialogComponent } from '../../shaders/dialogs/crear-rol-dialog/crear-rol-dialog.component';
import { AsignarPermisoRolDialogComponent } from '../../shaders/dialogs/asignar-permiso-rol-dialog/asignar-permiso-rol-dialog.component';
import { VerPermisosRolDialogComponent } from '../../shaders/dialogs/ver-permisos-rol-dialog/ver-permisos-rol-dialog.component';

@Component({
  selector: 'app-role-page',
  standalone: true,
  templateUrl: './role-page.component.html',
  styleUrls: ['./role-page.component.scss'],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatTableModule
  ]
})
export class RolePageComponent implements OnInit {
  roles: Rol[] = [];
  cargando: boolean = true;

  constructor(
    private rolesService: RolesService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.obtenerRoles();
  }

  obtenerRoles(): void {
    this.cargando = true;
    this.rolesService.getRoles().subscribe({
      next: (data) => {
        this.roles = data;
        this.cargando = false;
      },
      error: (error) => {
        console.error('❌ Error al obtener roles', error);
        this.cargando = false;
      }
    });
  }

  abrirCrearRol(): void {
    const dialogRef = this.dialog.open(CrearRolDialogComponent, {
      width: '400px',
      data: {}
    });

    dialogRef.afterClosed().subscribe((nuevoRol: Rol) => {
      if (nuevoRol) {
        this.rolesService.crearRol(nuevoRol).subscribe(() => this.obtenerRoles());
      }
    });
  }

  abrirEditarRol(rol: Rol): void {
    const dialogRef = this.dialog.open(CrearRolDialogComponent, {
      width: '400px',
      data: { rol }
    });

    dialogRef.afterClosed().subscribe((rolActualizado: Rol) => {
      if (rolActualizado) {
        this.rolesService.actualizarRol(rol.id!, rolActualizado).subscribe(() => this.obtenerRoles());
      }
    });
  }

  abrirVerPermisos(rol: Rol): void {
    this.dialog.open(VerPermisosRolDialogComponent, {
      width: '500px',
      data: { permisos: rol.permisos || [] }
    });
  }

  eliminarRol(id: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar este rol?')) {
      this.rolesService.eliminarRol(id).subscribe({
        next: () => {
          console.log('✅ Rol eliminado');
          this.obtenerRoles();
        },
        error: (error) => {
          console.error('❌ Error al eliminar rol', error);
        }
      });
    }
  }

  abrirAsignarPermisos(rol: Rol): void {
    const dialogRef = this.dialog.open(AsignarPermisoRolDialogComponent, {
      width: '600px',
      data: { rolId: rol.id }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.obtenerRoles(); // Opcional: refrescar roles si asignó o quitó permisos
      }
    });
  }
}
