import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';

import { PermisosService } from '../../services/permisos.service';
import { Permiso } from '../../../../../../core/models/permiso.model';

import { CrearPermisoDialogComponent } from '../../shared/dialogs/crear-permiso-dialog/crear-permiso-dialog.component';
import { EditarPermisoDialogComponent } from '../../shared/dialogs/editar-permiso-dialog/editar-permiso-dialog.component';

@Component({
  selector: 'app-permission-page',
  standalone: true,
  templateUrl: './permission-page.component.html',
  styleUrls: ['./permission-page.component.scss'],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatDividerModule,
  ],
})
export class PermissionPageComponent implements OnInit {
  permisos: Permiso[] = [];
  cargando: boolean = true;

  constructor(
    private permisosService: PermisosService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.obtenerPermisos();
  }

  obtenerPermisos(): void {
    this.cargando = true;
    this.permisosService.getPermisos().subscribe({
      next: (data) => {
        this.permisos = data;
        this.cargando = false;
      },
      error: (error) => {
        console.error('❌ Error al obtener permisos', error);
        this.cargando = false;
      },
    });
  }

  abrirCrearPermiso(): void {
    const dialogRef = this.dialog.open(CrearPermisoDialogComponent, {
      width: '400px',
      data: {},
    });

    dialogRef.afterClosed().subscribe((nuevoPermiso: Permiso) => {
      if (nuevoPermiso) {
        this.permisosService
          .crearPermiso(nuevoPermiso)
          .subscribe(() => this.obtenerPermisos());
      }
    });
  }

  abrirEditarPermiso(permiso: Permiso): void {
    const dialogRef = this.dialog.open(EditarPermisoDialogComponent, {
      width: '400px',
      data: { permiso }
    });
  
    dialogRef.afterClosed().subscribe((permisoActualizado: Permiso) => {
      if (permisoActualizado) {
        this.permisosService.actualizarPermiso(permiso.id!, permisoActualizado).subscribe(() => this.obtenerPermisos());
      }
    });
  }

  eliminarPermiso(id: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar este permiso?')) {
      this.permisosService.eliminarPermiso(id).subscribe({
        next: () => {
          console.log('✅ Permiso eliminado');
          this.obtenerPermisos();
        },
        error: (error) => {
          console.error('❌ Error al eliminar permiso', error);
        },
      });
    }
  }
}
