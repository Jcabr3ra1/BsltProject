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

import { TipoTransaccionService } from '../../services/tipo-transaccion.service';
import { TipoTransaccion } from '../../../../../../core/models/tipo_transaccion.model';
import { CrearTipoTransaccionDialogComponent } from '../../shared/dialog/crear-tipo-transaccion-dialog/crear-tipo-transaccion-dialog.component';
import { EditarTipoTransaccionDialogComponent } from '../../shared/dialog/editar-tipo-transaccion-dialog/editar-tipo-transaccion-dialog.component';

@Component({
  selector: 'app-type-of-transaction-page',
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
  templateUrl: './type-of-transaction-page.component.html',
  styleUrls: ['./type-of-transaction-page.component.scss']
})
export class TypeOfTransactionPageComponent implements OnInit, AfterViewInit {
  tiposTransaccion: TipoTransaccion[] = [];
  filteredTipos: TipoTransaccion[] = [];
  searchTerm: string = '';
  
  // Columnas de la tabla
  displayedColumns: string[] = ['descripcion', 'acciones'];
  
  dataSource = new MatTableDataSource<TipoTransaccion>([]);
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private tipoTransaccionService: TipoTransaccionService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.cargarTiposTransaccion();
  }
  
  ngAfterViewInit() {
    if (this.paginator && this.sort) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  cargarTiposTransaccion(): void {
    this.tipoTransaccionService.getTiposTransaccion().subscribe({
      next: (data) => {
        this.tiposTransaccion = data;
        this.filteredTipos = [...this.tiposTransaccion];
        this.dataSource.data = this.filteredTipos;
        
        // Volver a aplicar paginador y ordenamiento
        if (this.paginator && this.sort) {
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        }
      },
      error: (error) => {
        console.error('Error al cargar los tipos de transacción', error);
        this.mostrarError('Error al cargar los tipos de transacción');
      }
    });
  }

  abrirCrear(): void {
    const dialogRef = this.dialog.open(CrearTipoTransaccionDialogComponent, {
      width: '450px',
      panelClass: ['custom-dialog', 'custom-dark-dialog']
    });
    
    dialogRef.afterClosed().subscribe((nuevo) => {
      if (nuevo) {
        this.tipoTransaccionService.crearTipoTransaccion(nuevo).subscribe({
          next: () => {
            this.cargarTiposTransaccion();
            this.mostrarExito('Tipo de transacción creado correctamente');
          },
          error: (error) => {
            console.error('Error al crear tipo de transacción', error);
            this.mostrarError('Error al crear el tipo de transacción');
          }
        });
      }
    });
  }

  abrirEditar(tipo: TipoTransaccion): void {
    const dialogRef = this.dialog.open(EditarTipoTransaccionDialogComponent, {
      width: '450px',
      data: tipo,
      panelClass: ['custom-dialog', 'custom-dark-dialog']
    });
    
    dialogRef.afterClosed().subscribe((actualizado) => {
      const id = actualizado?.id || actualizado?._id;
      if (actualizado && id) {
        this.tipoTransaccionService.actualizarTipoTransaccion(id, actualizado)
          .subscribe({
            next: () => {
              this.cargarTiposTransaccion();
              this.mostrarExito('Tipo de transacción actualizado correctamente');
            },
            error: (error) => {
              console.error('Error al actualizar tipo de transacción', error);
              this.mostrarError('Error al actualizar el tipo de transacción');
            }
          });
      }
    });
  }

  eliminarTipo(tipo: TipoTransaccion): void {
    const id = tipo.id || tipo._id;
    if (confirm('¿Estás seguro de eliminar este tipo de transacción?') && id) {
      this.tipoTransaccionService.eliminarTipoTransaccion(id).subscribe({
        next: () => {
          this.cargarTiposTransaccion();
          this.mostrarExito('Tipo de transacción eliminado correctamente');
        },
        error: (error) => {
          console.error('Error al eliminar tipo de transacción', error);
          this.mostrarError('Error al eliminar el tipo de transacción');
        }
      });
    }
  }
  
  // Método para filtrar tipos de transacción
  filtrarTipos(): void {
    if (!this.searchTerm) {
      this.filteredTipos = [...this.tiposTransaccion];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredTipos = this.tiposTransaccion.filter(
        (tipo) => (tipo.descripcion?.toLowerCase() || '').includes(term)
      );
    }
    this.dataSource.data = this.filteredTipos;

    // Reset paginación al filtrar
    if (this.paginator) {
      this.paginator.firstPage();
    }
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