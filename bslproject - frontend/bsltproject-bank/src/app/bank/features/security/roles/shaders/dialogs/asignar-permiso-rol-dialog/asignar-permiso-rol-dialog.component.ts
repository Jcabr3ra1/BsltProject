import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { Permiso } from '../../../../../../../core/models/permiso.model';
import { RolesService } from '../../../services/roles.service';
import { PermisosService } from '../../../../permissions/services/permisos.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
@Component({
  selector: 'app-asignar-permiso-rol-dialog',
  standalone: true,
  templateUrl: './asignar-permiso-rol-dialog.component.html',
  styleUrls: ['./asignar-permiso-rol-dialog.component.scss'],
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatListModule,
    MatIconModule,
    MatProgressSpinnerModule
  ]
})
export class AsignarPermisoRolDialogComponent implements OnInit {
  permisosDisponibles: Permiso[] = [];
  permisosAsignados: Permiso[] = [];
  cargando = true;

  constructor(
    private dialogRef: MatDialogRef<AsignarPermisoRolDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { rolId: string },
    private rolesService: RolesService,
    private permisosService: PermisosService
  ) {}

  ngOnInit(): void {
    this.cargarPermisos();
  }

  cargarPermisos(): void {
    this.cargando = true;
    Promise.all([
      this.permisosService.getPermisos().toPromise(),
      this.rolesService.getPermisosDeRol(this.data.rolId).toPromise()
    ]).then(([todos, asignados]) => {
      this.permisosDisponibles = todos ?? [];     // <- aseguramos array válido
      this.permisosAsignados = asignados ?? [];   // <- igual aquí
      this.cargando = false;
    }).catch(error => {
      console.error('❌ Error al cargar permisos', error);
      this.cargando = false;
    });
  }

  permisoAsignado(idPermiso: string): boolean {
    return this.permisosAsignados.some(p => p.id === idPermiso);
  }

  togglePermiso(permiso: Permiso): void {
    if (this.permisoAsignado(permiso.id!)) {
      this.rolesService.eliminarPermiso(this.data.rolId, permiso.id!).subscribe(() => {
        this.permisosAsignados = this.permisosAsignados.filter(p => p.id !== permiso.id);
      });
    } else {
      this.rolesService.asignarPermiso(this.data.rolId, permiso.id!).subscribe(() => {
        this.permisosAsignados.push(permiso);
      });
    }
  }

  cerrar(): void {
    this.dialogRef.close(true);
  }
}
