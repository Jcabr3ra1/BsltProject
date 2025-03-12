import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TipoMovimientoService } from '@core/services/finanzas/tipo-movimiento.service';
import { TipoMovimiento } from '@core/models/finanzas/tipo-movimiento.model';
import { TipoMovimientoDialogComponent } from './tipo-movimiento-dialog/tipo-movimiento-dialog.component';

@Component({
  selector: 'app-tipos-movimiento',
  templateUrl: './tipos-movimiento.component.html',
  styleUrls: ['./tipos-movimiento.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatCardModule,
    MatProgressBarModule
  ]
})
export class TiposMovimientoComponent implements OnInit {
  tiposMovimiento: TipoMovimiento[] = [];
  displayedColumns: string[] = ['nombre', 'descripcion', 'estado', 'acciones'];
  isLoading = false;
  error: string | null = null;

  constructor(
    private tipoMovimientoService: TipoMovimientoService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.cargarTiposMovimiento();
  }

  cargarTiposMovimiento(): void {
    this.isLoading = true;
    this.tipoMovimientoService.obtenerTodos().subscribe({
      next: (tipos: TipoMovimiento[]) => {
        this.tiposMovimiento = tipos;
        this.isLoading = false;
      },
      error: (error: Error) => {
        console.error('Error al cargar tipos de movimiento:', error);
        this.error = 'Error al cargar los tipos de movimiento';
        this.isLoading = false;
        this.mostrarError(this.error);
      }
    });
  }

  abrirDialogoCrear(): void {
    const dialogRef = this.dialog.open(TipoMovimientoDialogComponent, {
      width: '500px',
      data: { modo: 'crear' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.tipoMovimientoService.crear(result).subscribe({
          next: () => {
            this.mostrarExito('Tipo de movimiento creado exitosamente');
            this.cargarTiposMovimiento();
          },
          error: (error: Error) => {
            console.error('Error al crear tipo de movimiento:', error);
            this.mostrarError('Error al crear el tipo de movimiento');
          }
        });
      }
    });
  }

  editarTipoMovimiento(tipoMovimiento: TipoMovimiento): void {
    const dialogRef = this.dialog.open(TipoMovimientoDialogComponent, {
      width: '500px',
      data: { modo: 'editar', tipoMovimiento }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.tipoMovimientoService.actualizar(tipoMovimiento.id, result).subscribe({
          next: () => {
            this.mostrarExito('Tipo de movimiento actualizado exitosamente');
            this.cargarTiposMovimiento();
          },
          error: (error: Error) => {
            console.error('Error al actualizar tipo de movimiento:', error);
            this.mostrarError('Error al actualizar el tipo de movimiento');
          }
        });
      }
    });
  }

  toggleEstadoTipoMovimiento(tipoMovimiento: TipoMovimiento): void {
    this.tipoMovimientoService.toggleEstado(tipoMovimiento.id).subscribe({
      next: () => {
        this.mostrarExito('Estado actualizado exitosamente');
        this.cargarTiposMovimiento();
      },
      error: (error: Error) => {
        console.error('Error al cambiar estado:', error);
        this.mostrarError('Error al cambiar el estado');
      }
    });
  }

  eliminarTipoMovimiento(tipoMovimiento: TipoMovimiento): void {
    if (confirm('¿Está seguro de eliminar este tipo de movimiento?')) {
      this.tipoMovimientoService.eliminar(tipoMovimiento.id).subscribe({
        next: () => {
          this.mostrarExito('Tipo de movimiento eliminado exitosamente');
          this.cargarTiposMovimiento();
        },
        error: (error: Error) => {
          console.error('Error al eliminar tipo de movimiento:', error);
          this.mostrarError('Error al eliminar el tipo de movimiento');
        }
      });
    }
  }

  private mostrarExito(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      panelClass: ['snackbar-success']
    });
  }

  private mostrarError(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      panelClass: ['snackbar-error']
    });
  }
}
