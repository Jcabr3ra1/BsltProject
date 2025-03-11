import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
// Importamos desde los archivos de barril
import { TipoMovimientoService } from '../../../core/services/finanzas';
import { TipoMovimiento } from '../../../core/models/finanzas/tipo-movimiento.model';
// Importamos los componentes pero no los incluimos en los imports del componente
// ya que se utilizan a través del servicio MatDialog
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog';
import { TipoMovimientoDialogComponent } from './tipo-movimiento-dialog';

@Component({
  selector: 'app-tipos-movimiento',
  templateUrl: './tipos-movimiento.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ]
})
export class TiposMovimientoComponent implements OnInit {
  tiposMovimiento: TipoMovimiento[] = [];
  displayedColumns: string[] = ['id', 'nombre', 'codigo_origen', 'codigo_destino', 'descripcion', 'estado', 'acciones'];
  isLoading = false;

  constructor(
    private tipoMovimientoService: TipoMovimientoService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.cargarTiposMovimiento();
  }

  cargarTiposMovimiento(): void {
    this.isLoading = true;
    this.tipoMovimientoService.getTiposMovimiento().subscribe({
      next: (data) => {
        this.tiposMovimiento = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar tipos de movimiento:', error);
        this.mostrarError('Error al cargar los tipos de movimiento');
        this.isLoading = false;
      }
    });
  }

  abrirDialogoCrear(): void {
    const dialogRef = this.dialog.open(TipoMovimientoDialogComponent, {
      width: '500px',
      data: { titulo: 'Crear Tipo de Movimiento' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.crearTipoMovimiento(result);
      }
    });
  }

  abrirDialogoEditar(tipoMovimiento: TipoMovimiento): void {
    const dialogRef = this.dialog.open(TipoMovimientoDialogComponent, {
      width: '500px',
      data: {
        titulo: 'Editar Tipo de Movimiento',
        tipoMovimiento
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.actualizarTipoMovimiento(tipoMovimiento.id, result);
      }
    });
  }

  abrirDialogoEliminar(tipoMovimiento: TipoMovimiento): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        titulo: 'Eliminar Tipo de Movimiento',
        mensaje: `¿Está seguro que desea eliminar el tipo de movimiento "${tipoMovimiento.nombre}"?`,
        botonAceptar: 'Eliminar',
        botonCancelar: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.eliminarTipoMovimiento(tipoMovimiento.id);
      }
    });
  }

  crearTipoMovimiento(tipoMovimiento: TipoMovimiento): void {
    this.isLoading = true;
    this.tipoMovimientoService.crearTipoMovimiento(tipoMovimiento).subscribe({
      next: () => {
        this.mostrarExito('Tipo de movimiento creado exitosamente');
        this.cargarTiposMovimiento();
      },
      error: (error) => {
        console.error('Error al crear tipo de movimiento:', error);
        this.mostrarError('Error al crear el tipo de movimiento');
        this.isLoading = false;
      }
    });
  }

  actualizarTipoMovimiento(id: string, tipoMovimiento: TipoMovimiento): void {
    if (!id) {
      this.mostrarError('Error: ID de tipo de movimiento no válido');
      return;
    }
    
    this.isLoading = true;
    this.tipoMovimientoService.actualizarTipoMovimiento(id, tipoMovimiento).subscribe({
      next: () => {
        this.mostrarExito('Tipo de movimiento actualizado exitosamente');
        this.cargarTiposMovimiento();
      },
      error: (error) => {
        console.error('Error al actualizar tipo de movimiento:', error);
        this.mostrarError('Error al actualizar el tipo de movimiento');
        this.isLoading = false;
      }
    });
  }

  eliminarTipoMovimiento(id: string): void {
    if (!id) {
      this.mostrarError('Error: ID de tipo de movimiento no válido');
      return;
    }
    
    this.isLoading = true;
    this.tipoMovimientoService.eliminarTipoMovimiento(id).subscribe({
      next: () => {
        this.mostrarExito('Tipo de movimiento eliminado exitosamente');
        this.cargarTiposMovimiento();
      },
      error: (error) => {
        console.error('Error al eliminar tipo de movimiento:', error);
        this.mostrarError('Error al eliminar el tipo de movimiento');
        this.isLoading = false;
      }
    });
  }

  cambiarEstado(tipoMovimiento: TipoMovimiento): void {
    if (!tipoMovimiento.id) {
      this.mostrarError('Error: ID de tipo de movimiento no válido');
      return;
    }
    
    const nuevoTipoMovimiento = { ...tipoMovimiento, estado: !tipoMovimiento.estado };
    this.actualizarTipoMovimiento(tipoMovimiento.id, nuevoTipoMovimiento);
  }

  private mostrarExito(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['success-snackbar']
    });
  }

  private mostrarError(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['error-snackbar']
    });
  }
}
