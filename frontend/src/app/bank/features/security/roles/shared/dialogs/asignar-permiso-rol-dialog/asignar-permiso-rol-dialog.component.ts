import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Permiso } from '../../../../../../../core/models/permiso.model';
import { RolesService } from '../../../services/roles.service';
import { PermisosService } from '../../../../permissions/services/permisos.service';
import { FormsModule } from '@angular/forms';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-asignar-permiso-rol-dialog',
  standalone: true,
  templateUrl: './asignar-permiso-rol-dialog.component.html',
  styleUrls: ['./asignar-permiso-rol-dialog.component.css'],
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatListModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    FormsModule
  ]
})
export class AsignarPermisoRolDialogComponent implements OnInit {
  permisosDisponibles: Permiso[] = [];
  permisosAsignados: Permiso[] = [];
  filteredPermisos: Permiso[] = [];
  cargando = true;
  searchTerm = '';
  errorMessage = '';

  constructor(
    private dialogRef: MatDialogRef<AsignarPermisoRolDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { rolId: string },
    private rolesService: RolesService,
    private permisosService: PermisosService
  ) {
    this.dialogRef.addPanelClass('custom-dialog');
  }

  ngOnInit(): void {
    this.cargarPermisos();
  }

  cargarPermisos(): void {
    this.cargando = true;
    this.errorMessage = '';
    
    Promise.all([
      this.permisosService.getPermisos().pipe(
        catchError(error => {
          return of([]);
        })
      ).toPromise(),
      
      this.rolesService.getPermisosDeRol(this.data.rolId).pipe(
        catchError(error => {
          return of([]);
        })
      ).toPromise()
    ])
    .then(([todos, asignados]) => {
      this.permisosDisponibles = todos || [];
      this.permisosAsignados = asignados || [];
      this.filteredPermisos = [...this.permisosDisponibles];
      this.cargando = false;
    })
    .catch(error => {
      this.errorMessage = 'Error al cargar permisos. Inténtelo de nuevo.';
      this.cargando = false;
    });
  }

  filtrarPermisos(): void {
    if (!this.searchTerm.trim()) {
      this.filteredPermisos = [...this.permisosDisponibles];
      return;
    }
    
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredPermisos = this.permisosDisponibles.filter(permiso => 
      permiso.nombre.toLowerCase().includes(term) || 
      (permiso.descripcion && permiso.descripcion.toLowerCase().includes(term))
    );
  }

  permisoAsignado(idPermiso: string): boolean {
    return this.permisosAsignados.some(p => p.id === idPermiso);
  }

  togglePermiso(permiso: Permiso): void {
    const isAsignado = this.permisoAsignado(permiso.id!);
    
    if (isAsignado) {
      this.rolesService.eliminarPermiso(this.data.rolId, permiso.id!)
        .pipe(
          catchError(error => {
            return of(null);
          })
        )
        .subscribe(result => {
          if (result !== null) {
            this.permisosAsignados = this.permisosAsignados.filter(p => p.id !== permiso.id);
          }
        });
    } else {
      this.rolesService.asignarPermiso(this.data.rolId, permiso.id!)
        .pipe(
          catchError(error => {
            return of(null);
          })
        )
        .subscribe(result => {
          if (result !== null) {
            this.permisosAsignados.push(permiso);
          }
        });
    }
  }

  cerrar(): void {
    this.dialogRef.close(true);
  }
}