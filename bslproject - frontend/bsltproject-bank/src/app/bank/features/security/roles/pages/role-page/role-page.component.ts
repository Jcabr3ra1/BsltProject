import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

import { RolesService } from '../../services/roles.service';
import { Rol } from '../../../../../../core/models/rol.model';

// Importar los diálogos necesarios
import { MatDialog } from '@angular/material/dialog';
import { CrearRolDialogComponent } from '../../shaders/dialogs/crear-rol-dialog/crear-rol-dialog.component';
import { AsignarPermisoRolDialogComponent } from '../../shaders/dialogs/asignar-permiso-rol-dialog/asignar-permiso-rol-dialog.component';
import { VerPermisosRolDialogComponent } from '../../shaders/dialogs/ver-permisos-rol-dialog/ver-permisos-rol-dialog.component';

@Component({
  selector: 'app-role-page',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatSelectModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    FormsModule
  ],
  templateUrl: './role-page.component.html',
  styleUrls: ['./role-page.component.scss']
})
export class RolePageComponent implements OnInit {
  roles: Rol[] = [];
  filteredRoles: Rol[] = [];
  cargando: boolean = true;
  searchTerm: string = '';
  
  // Array para manejar qué roles tienen sus permisos expandidos
  expandedRoles: string[] = [];
  
  // Paginación personalizada
  pageSize: number = 5;
  pageIndex: number = 0;
  pageSizeOptions: number[] = [5, 10, 25];
  
  // Variable para mensaje de paginación
  get paginationLabel(): string {
    const start = this.pageIndex * this.pageSize + 1;
    const end = Math.min((this.pageIndex + 1) * this.pageSize, this.filteredRoles.length);
    return `${start} - ${end} de ${this.filteredRoles.length}`;
  }
  
  get paginatedRoles(): Rol[] {
    const startIndex = this.pageIndex * this.pageSize;
    return this.filteredRoles.slice(startIndex, startIndex + this.pageSize);
  }

  constructor(
    private rolesService: RolesService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.obtenerRoles();
  }

  obtenerRoles(): void {
    this.cargando = true;
    this.rolesService.getRoles()
      .pipe(
        catchError(error => {
          console.error('Error al obtener roles:', error);
          return of([]);
        }),
        finalize(() => {
          this.cargando = false;
        })
      )
      .subscribe(data => {
        this.roles = data;
        this.filteredRoles = [...this.roles];
        // Cerrar todos los paneles expandidos al cargar nuevos datos
        this.closeAllExpanded();
      });
  }
  
  /**
   * Alterna la visibilidad de la lista de permisos para un rol
   * @param roleId El ID del rol
   */
  togglePermisosList(roleId: string): void {
    // Detener la propagación del evento para evitar acciones no deseadas
    event?.stopPropagation();
    
    // Comprobar si el rol ya está expandido
    const index = this.expandedRoles.indexOf(roleId);
    
    if (index === -1) {
      // Si no está expandido, añadirlo a la lista
      this.expandedRoles.push(roleId);
    } else {
      // Si ya está expandido, quitarlo de la lista
      this.expandedRoles.splice(index, 1);
    }
  }
  
  /**
   * Comprueba si un rol tiene sus permisos expandidos
   * @param roleId El ID del rol
   * @returns true si los permisos están expandidos, false en caso contrario
   */
  isExpanded(roleId: string): boolean {
    return this.expandedRoles.includes(roleId);
  }
  
  /**
   * Cierra todos los paneles de permisos expandidos
   */
  closeAllExpanded(): void {
    this.expandedRoles = [];
  }
  
  // Métodos de paginación
  onPageSizeChange(): void {
    this.pageIndex = 0; // Resetear a la primera página
    this.closeAllExpanded(); // Cerrar paneles expandidos
  }
  
  firstPage(): void {
    this.pageIndex = 0;
    this.closeAllExpanded();
  }
  
  previousPage(): void {
    this.pageIndex = Math.max(0, this.pageIndex - 1);
    this.closeAllExpanded();
  }
  
  nextPage(): void {
    const maxIndex = Math.ceil(this.filteredRoles.length / this.pageSize) - 1;
    this.pageIndex = Math.min(maxIndex, this.pageIndex + 1);
    this.closeAllExpanded();
  }
  
  lastPage(): void {
    this.pageIndex = Math.ceil(this.filteredRoles.length / this.pageSize) - 1;
    this.closeAllExpanded();
  }

  // Filtrado de roles
  filtrarRoles(): void {
    if (!this.searchTerm) {
      this.filteredRoles = [...this.roles];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredRoles = this.roles.filter(rol => 
        rol.nombre.toLowerCase().includes(term) || 
        rol.permisos?.some(p => p.nombre.toLowerCase().includes(term))
      );
    }
    this.pageIndex = 0; // Resetear a la primera página
    this.closeAllExpanded(); // Cerrar todos los paneles expandidos al filtrar
  }

  // Métodos para acciones de la tabla
  abrirCrearRol(): void {
    const dialogRef = this.dialog.open(CrearRolDialogComponent, {
      width: '450px',
      data: {},
      panelClass: ['custom-dialog', 'custom-dark-dialog'],
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.obtenerRoles();
      }
    });
  }
  
  verDetalles(rol: Rol): void {
    this.abrirVerPermisos(rol);
  }
  
  editarRol(rol: Rol): void {
    // Detener propagación del evento
    event?.stopPropagation();
    
    const dialogRef = this.dialog.open(CrearRolDialogComponent, {
      width: '450px',
      data: { rol },
      panelClass: ['custom-dialog', 'custom-dark-dialog']
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.obtenerRoles();
      }
    });
  }
  
  eliminarRol(id: string): void {
    // Detener propagación del evento
    event?.stopPropagation();
    
    if (confirm('¿Estás seguro de que deseas eliminar este rol?')) {
      this.cargando = true;
      this.rolesService.eliminarRol(id)
        .pipe(
          catchError(error => {
            console.error('Error al eliminar rol:', error);
            return of(null);
          }),
          finalize(() => {
            this.cargando = false;
            this.obtenerRoles();
          })
        )
        .subscribe();
    }
  }
  
  abrirVerPermisos(rol: Rol): void {
    // Detener propagación del evento
    event?.stopPropagation();
    
    this.dialog.open(VerPermisosRolDialogComponent, {
      width: '500px',
      data: { permisos: rol.permisos || [] },
      panelClass: ['custom-dialog', 'custom-dark-dialog']
    });
  }
  
  gestionarPermisos(rol: Rol): void {
    // Detener propagación del evento
    event?.stopPropagation();
    
    const dialogRef = this.dialog.open(AsignarPermisoRolDialogComponent, {
      width: '600px',
      data: { rolId: rol.id },
      panelClass: ['custom-dialog', 'custom-dark-dialog']
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.obtenerRoles();
      }
    });
  }
}