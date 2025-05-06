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
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

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
    // Asegurar que el diálogo tenga el estilo correcto
    this.dialogRef.addPanelClass('custom-dialog');
  }

  ngOnInit(): void {
    this.cargarPermisos();
  }

  cargarPermisos(): void {
    this.cargando = true;
    this.errorMessage = '';
    
    // Usar observables en lugar de promesas para mejor manejo de errores
    Promise.all([
      this.permisosService.getPermisos().pipe(
        catchError(error => {
          console.error('Error al cargar todos los permisos:', error);
          return of([]);
        })
      ).toPromise(),
      
      this.rolesService.getPermisosDeRol(this.data.rolId).pipe(
        catchError(error => {
          console.error('Error al cargar permisos del rol:', error);
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
      console.error('Error general al cargar permisos', error);
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
    // Estado actual
    const isAsignado = this.permisoAsignado(permiso.id!);
    
    if (isAsignado) {
      // Quitar permiso
      this.rolesService.eliminarPermiso(this.data.rolId, permiso.id!)
        .pipe(
          catchError(error => {
            console.error('Error al eliminar permiso:', error);
            return of(null);
          })
        )
        .subscribe(result => {
          if (result !== null) {
            // Actualizar UI solo si la operación fue exitosa
            this.permisosAsignados = this.permisosAsignados.filter(p => p.id !== permiso.id);
          }
        });
    } else {
      // Añadir permiso
      this.rolesService.asignarPermiso(this.data.rolId, permiso.id!)
        .pipe(
          catchError(error => {
            console.error('Error al asignar permiso:', error);
            return of(null);
          })
        )
        .subscribe(result => {
          if (result !== null) {
            // Actualizar UI solo si la operación fue exitosa
            this.permisosAsignados.push(permiso);
          }
        });
    }
  }

  cerrar(): void {
    this.dialogRef.close(true);
  }
}