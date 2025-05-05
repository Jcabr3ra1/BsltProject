import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableDataSource } from '@angular/material/table';

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
    MatTooltipModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatSelectModule
  ],
})
export class PermissionPageComponent implements OnInit {
  permisos: Permiso[] = [];
  dataSource = new MatTableDataSource<Permiso>([]);
  cargando: boolean = true;
  pageSizeOptions: number[] = [5, 10, 25, 50];
  paginaActual: number = 0;
  tamanoActual: number = 5;

  @ViewChild(MatPaginator) paginador!: MatPaginator;

  constructor(
    private permisosService: PermisosService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.obtenerPermisos();
  }

  ngAfterViewInit() {
    if (this.paginador) {
      this.dataSource.paginator = this.paginador;
      
      // Suscribirse a los cambios de página
      this.paginador.page.subscribe(() => {
        this.paginaActual = this.paginador.pageIndex;
        this.tamanoActual = this.paginador.pageSize;
        this.getInfoPaginacion(); // Actualizar la información de paginación
      });
    }
  }

  obtenerPermisos(): void {
    this.cargando = true;
    this.permisosService.getPermisos().subscribe({
      next: (data) => {
        this.permisos = data;
        this.dataSource.data = this.permisos;
        this.cargando = false;
        
        // Actualizamos el paginador después de cargar los datos
        setTimeout(() => {
          if (this.paginador) {
            this.dataSource.paginator = this.paginador;
          }
        });
      },
      error: (error) => {
        console.error('❌ Error al obtener permisos', error);
        this.cargando = false;
      },
    });
  }

  cambiarTamanoPagina(event: any): void {
    this.tamanoActual = event.value;
    this.paginaActual = 0;
    
    if (this.paginador) {
      this.paginador.pageSize = this.tamanoActual;
      this.paginador.pageIndex = 0;
      this.dataSource._updateChangeSubscription();
    }
  }
  
  irAPrimeraPagina(): void {
    this.paginaActual = 0;
    if (this.paginador) {
      this.paginador.firstPage();
    }
  }
  
  irAPaginaAnterior(): void {
    if (this.paginaActual > 0) {
      this.paginaActual--;
      if (this.paginador) {
        this.paginador.previousPage();
      }
    }
  }
  
  irAPaginaSiguiente(): void {
    if (this.paginaActual < this.getTotalPaginas() - 1) {
      this.paginaActual++;
      if (this.paginador) {
        this.paginador.nextPage();
      }
    }
  }
  
  irAUltimaPagina(): void {
    this.paginaActual = this.getTotalPaginas() - 1;
    if (this.paginador) {
      this.paginador.lastPage();
    }
  }
  
  puedeRetroceder(): boolean {
    return this.paginaActual > 0;
  }
  
  puedeAvanzar(): boolean {
    return this.paginaActual < this.getTotalPaginas() - 1;
  }
  
  getTotalPaginas(): number {
    return Math.ceil(this.permisos.length / this.tamanoActual);
  }
  
  getInfoPaginacion(): string {
    if (this.permisos.length === 0) return '0 - 0 de 0';
    
    const inicio = this.paginaActual * this.tamanoActual + 1;
    const fin = Math.min((this.paginaActual + 1) * this.tamanoActual, this.permisos.length);
    return `${inicio} - ${fin} de ${this.permisos.length}`;
  }

  abrirCrearPermiso(): void {
    const dialogRef = this.dialog.open(CrearPermisoDialogComponent, {
      width: '450px',
      data: {},
      panelClass: ['custom-dialog', 'custom-dark-dialog']
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
      width: '450px',
      data: { permiso },
      panelClass: ['custom-dialog', 'custom-dark-dialog']
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