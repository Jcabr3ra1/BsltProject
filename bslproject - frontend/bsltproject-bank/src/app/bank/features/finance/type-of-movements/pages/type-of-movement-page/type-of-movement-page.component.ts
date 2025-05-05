import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { MovementTypeService } from '../../services/movement-type.service';
import { TipoMovimiento } from '../../../../../../core/models/movement-type.model';
import { CrearTipoMovimientoDialogComponent } from '../../shared/dialogs/crear-tipo-movimiento-dialog/crear-tipo-movimiento-dialog.component';
import { EditarTipoMovimientoDialogComponent } from '../../shared/dialogs/editar-tipo-movimiento-dialog/editar-tipo-movimiento-dialog.component';

@Component({
  selector: 'app-type-of-movement-page',
  standalone: true,
  imports: [
    CommonModule, 
    MatTableModule, 
    MatIconModule, 
    MatButtonModule,
    MatPaginatorModule,
    MatSortModule,
    MatTooltipModule,
    MatSnackBarModule,
    FormsModule
  ],
  templateUrl: './type-of-movement-page.component.html',
  styleUrls: ['./type-of-movement-page.component.scss'],
})
export class TypeOfMovementPageComponent implements OnInit, AfterViewInit {
  tiposMovimiento: TipoMovimiento[] = [];
  filteredTipos: TipoMovimiento[] = [];
  searchTerm: string = '';
  
  displayedColumns: string[] = [
    'codigo_origen',
    'codigo_destino',
    'descripcion',
    'tipo_transaccion',
    'acciones',
  ];
  
  dataSource = new MatTableDataSource<TipoMovimiento>([]);
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private movementTypeService: MovementTypeService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.cargarTiposMovimiento();
  }
  
  ngAfterViewInit() {
    if (this.paginator && this.sort) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  cargarTiposMovimiento(): void {
    this.movementTypeService.getTiposMovimiento().subscribe({
      next: (data) => {
        this.tiposMovimiento = data;
        this.filteredTipos = [...this.tiposMovimiento];
        this.dataSource.data = this.filteredTipos;
        
        // Volver a aplicar paginador y ordenamiento
        if (this.paginator && this.sort) {
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        }
      },
      error: (error) => {
        console.error('Error al cargar los tipos de movimiento', error);
        this.mostrarError('Error al cargar los tipos de movimiento');
      },
    });
  }

  abrirCrear(): void {
    const dialogRef = this.dialog.open(CrearTipoMovimientoDialogComponent, {
      width: '450px',
      panelClass: ['custom-dialog', 'custom-dark-dialog']
    });

    dialogRef.afterClosed().subscribe((nuevo) => {
      if (nuevo) {
        this.movementTypeService.crearTipoMovimiento(nuevo).subscribe({
          next: () => {
            this.cargarTiposMovimiento();
            this.mostrarExito('Tipo de movimiento creado correctamente');
          },
          error: (error) => {
            console.error('Error al crear tipo de movimiento', error);
            this.mostrarError('Error al crear el tipo de movimiento');
          }
        });
      }
    });
  }

  abrirEditar(tipo: TipoMovimiento): void {
    const dialogRef = this.dialog.open(EditarTipoMovimientoDialogComponent, {
      width: '450px',
      data: tipo,
      panelClass: ['custom-dialog', 'custom-dark-dialog']
    });

    dialogRef.afterClosed().subscribe((actualizado) => {
      if (actualizado) {
        this.movementTypeService.actualizarTipoMovimiento(
          actualizado.id!, 
          actualizado
        ).subscribe({
          next: () => {
            this.cargarTiposMovimiento();
            this.mostrarExito('Tipo de movimiento actualizado correctamente');
          },
          error: (error) => {
            console.error('Error al actualizar tipo de movimiento', error);
            this.mostrarError('Error al actualizar el tipo de movimiento');
          }
        });
      }
    });
  }

  eliminarTipo(id: string | undefined): void {
    const confirmacion = confirm(
      '¿Estás seguro de eliminar este tipo de movimiento?'
    );

    if (confirmacion && id) {
      this.movementTypeService.eliminarTipoMovimiento(id).subscribe({
        next: () => {
          this.cargarTiposMovimiento();
          this.mostrarExito('Tipo de movimiento eliminado correctamente');
        },
        error: (error) => {
          console.error('Error al eliminar tipo de movimiento', error);
          this.mostrarError('Error al eliminar el tipo de movimiento');
        }
      });
    } else if (!id) {
      this.mostrarError('No se pudo eliminar. ID inválido.');
    }
  }

  // Método para filtrar tipos de movimiento
  filtrarTipos(): void {
    if (!this.searchTerm) {
      this.filteredTipos = [...this.tiposMovimiento];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredTipos = this.tiposMovimiento.filter(
        (tipo) =>
          (tipo.codigo_origen?.toLowerCase() || '').includes(term) ||
          (tipo.codigo_destino?.toLowerCase() || '').includes(term) ||
          (tipo.descripcion?.toLowerCase() || '').includes(term)
      );
    }
    this.dataSource.data = this.filteredTipos;

    // Reset paginación al filtrar
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  // Métodos para determinar el tipo de transacción
  esIngreso(tipo: TipoMovimiento): boolean {
    return tipo.codigo_origen === '0' && tipo.codigo_destino !== '0';
  }

  esGasto(tipo: TipoMovimiento): boolean {
    return tipo.codigo_origen !== '0' && tipo.codigo_destino === '0';
  }

  esTransferencia(tipo: TipoMovimiento): boolean {
    return tipo.codigo_origen !== '0' && tipo.codigo_destino !== '0';
  }

  getTipoTransaccion(tipo: TipoMovimiento): string {
    if (this.esIngreso(tipo)) return 'Ingreso';
    if (this.esGasto(tipo)) return 'Gasto';
    if (this.esTransferencia(tipo)) return 'Transferencia';
    return 'Otro';
  }

  // Métodos para mostrar mensajes
  mostrarError(mensaje: string, duracion: number = 5000): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: duracion,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['error-snackbar'],
    });
  }

  mostrarExito(mensaje: string, duracion: number = 3000): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: duracion,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['success-snackbar'],
    });
  }
}