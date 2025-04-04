import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { TipoMovimientoService } from '@core/services/finanzas/tipo-movimiento.service';
import { TipoMovimiento } from '@core/models/finanzas/tipo-movimiento.model';
import { TipoMovimientoDialogComponent } from './tipo-movimiento-dialog/tipo-movimiento-dialog.component';
import { MatDividerModule } from '@angular/material/divider';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';

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
    MatProgressBarModule,
    MatBadgeModule,
    MatDividerModule
  ]
})
export class TiposMovimientoComponent implements OnInit {
  tiposMovimiento: TipoMovimiento[] = [];
  displayedColumns: string[] = ['nombre', 'codigo_origen', 'codigo_destino', 'descripcion', 'activo', 'acciones'];
  isLoading = false;
  error: string | null = null;

  constructor(
    private readonly tipoMovimientoService: TipoMovimientoService,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Diagnóstico: verificar el token antes de cargar los datos
    const token = localStorage.getItem('token');
    console.log('TiposMovimientoComponent - Token existe:', !!token);
    if (token) {
      try {
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        console.log('TiposMovimientoComponent - Contenido del token:', tokenData);
        console.log('TiposMovimientoComponent - Roles en el token:', tokenData.roles || 'No hay roles');
        console.log('TiposMovimientoComponent - Fecha de expiración:', new Date(tokenData.exp * 1000).toLocaleString());
        console.log('TiposMovimientoComponent - Token expirado:', Date.now() > tokenData.exp * 1000);
      } catch (e) {
        console.error('TiposMovimientoComponent - Error al decodificar el token:', e);
      }
    }
    
    this.cargarTiposMovimiento();
  }

  cargarTiposMovimiento(): void {
    this.isLoading = true;
    this.error = null;
    
    this.tipoMovimientoService.obtenerTodos().subscribe({
      next: (tipos: TipoMovimiento[]) => {
        this.tiposMovimiento = tipos;
        this.isLoading = false;
      },
      error: (error: Error) => {
        console.error('Error al cargar tipos de movimiento:', error);
        this.error = 'Error al cargar los tipos de movimiento. Por favor, intente nuevamente.';
        this.isLoading = false;
      }
    });
  }

  abrirDialogoCrear(): void {
    const dialogConfig: MatDialogConfig = {
      width: '600px',
      panelClass: 'dialog-responsive',
      disableClose: true,
      data: { modo: 'crear' }
    };

    const dialogRef = this.dialog.open(TipoMovimientoDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        this.tipoMovimientoService.crear(result).subscribe({
          next: () => {
            this.mostrarExito('Tipo de movimiento creado exitosamente');
            this.cargarTiposMovimiento();
          },
          error: (error: Error) => {
            console.error('Error al crear tipo de movimiento:', error);
            this.mostrarError('Error al crear el tipo de movimiento');
            this.isLoading = false;
          }
        });
      }
    });
  }

  editarTipoMovimiento(tipoMovimiento: TipoMovimiento): void {
    const dialogConfig: MatDialogConfig = {
      width: '600px',
      panelClass: 'dialog-responsive',
      disableClose: true,
      data: { 
        modo: 'editar', 
        tipoMovimiento 
      }
    };

    const dialogRef = this.dialog.open(TipoMovimientoDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        this.tipoMovimientoService.actualizar(tipoMovimiento.id, result).subscribe({
          next: () => {
            this.mostrarExito('Tipo de movimiento actualizado exitosamente');
            this.cargarTiposMovimiento();
          },
          error: (error: Error) => {
            console.error('Error al actualizar tipo de movimiento:', error);
            this.mostrarError('Error al actualizar el tipo de movimiento');
            this.isLoading = false;
          }
        });
      }
    });
  }

  toggleEstadoTipoMovimiento(tipoMovimiento: TipoMovimiento): void {
    this.isLoading = true;
    const nuevoEstado = !tipoMovimiento.activo;
    const accion = nuevoEstado ? 'activar' : 'desactivar';
    
    this.tipoMovimientoService.toggleEstado(tipoMovimiento.id).subscribe({
      next: () => {
        this.mostrarExito(`Tipo de movimiento ${accion === 'activar' ? 'activado' : 'desactivado'} exitosamente`);
        this.cargarTiposMovimiento();
      },
      error: (error: Error) => {
        console.error(`Error al ${accion} tipo de movimiento:`, error);
        this.mostrarError(`Error al ${accion} el tipo de movimiento`);
        this.isLoading = false;
      }
    });
  }

  confirmarEliminar(tipoMovimiento: TipoMovimiento): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmar eliminación',
        message: `¿Está seguro de eliminar el tipo de movimiento "${tipoMovimiento.nombre}"?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.eliminarTipoMovimiento(tipoMovimiento);
      }
    });
  }

  private eliminarTipoMovimiento(tipoMovimiento: TipoMovimiento): void {
    this.isLoading = true;
    
    this.tipoMovimientoService.eliminar(tipoMovimiento.id).subscribe({
      next: () => {
        this.mostrarExito('Tipo de movimiento eliminado exitosamente');
        this.cargarTiposMovimiento();
      },
      error: (error: Error) => {
        console.error('Error al eliminar tipo de movimiento:', error);
        this.mostrarError('Error al eliminar el tipo de movimiento');
        this.isLoading = false;
      }
    });
  }

  private mostrarExito(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      panelClass: ['snackbar-success'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  private mostrarError(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 5000,
      panelClass: ['snackbar-error'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }
}
