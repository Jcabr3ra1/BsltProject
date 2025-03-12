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
import { TipoTransaccionService } from '@core/services/finanzas/tipo-transaccion.service';
import { TipoTransaccion } from '@core/models/finanzas/tipo-transaccion.model';
// Importamos los componentes pero no los incluimos en los imports del componente
// ya que se utilizan a través del servicio MatDialog
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog';
import { TipoTransaccionDialogComponent } from './tipo-transaccion-dialog/tipo-transaccion-dialog.component';

@Component({
  selector: 'app-tipos-transaccion',
  templateUrl: './tipos-transaccion.component.html',
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
    MatDialogModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule
  ]
})
export class TiposTransaccionComponent implements OnInit {
  tiposTransaccion: TipoTransaccion[] = [];
  displayedColumns: string[] = ['id', 'nombre', 'descripcion', 'requiereDestino', 'acciones'];
  isLoading = false;

  constructor(
    private tipoTransaccionService: TipoTransaccionService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.cargarTiposTransaccion();
  }

  cargarTiposTransaccion(): void {
    this.isLoading = true;
    this.tipoTransaccionService.getTiposTransaccion().subscribe({
      next: (data: TipoTransaccion[]) => {
        this.tiposTransaccion = data;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error al cargar tipos de transacción:', error);
        this.mostrarError('Error al cargar los tipos de transacción');
        this.isLoading = false;
      }
    });
  }

  abrirDialogoCrear(): void {
    const dialogRef = this.dialog.open(TipoTransaccionDialogComponent, {
      width: '600px',
      data: {
        titulo: 'Crear Tipo de Transacción'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.crearTipoTransaccion(result);
      }
    });
  }

  abrirDialogoEditar(tipoTransaccion: TipoTransaccion): void {
    const dialogRef = this.dialog.open(TipoTransaccionDialogComponent, {
      width: '600px',
      data: {
        titulo: 'Editar Tipo de Transacción',
        tipoTransaccion: tipoTransaccion
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.actualizarTipoTransaccion(tipoTransaccion.id, result);
      }
    });
  }

  abrirDialogoEliminar(tipoTransaccion: TipoTransaccion): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        titulo: 'Eliminar Tipo de Transacción',
        mensaje: `¿Está seguro que desea eliminar el tipo de transacción "${tipoTransaccion.nombre}"?`,
        botonAceptar: 'Eliminar',
        botonCancelar: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.eliminarTipoTransaccion(tipoTransaccion.id);
      }
    });
  }

  crearTipoTransaccion(tipoTransaccion: TipoTransaccion): void {
    this.isLoading = true;
    this.tipoTransaccionService.crearTipoTransaccion(tipoTransaccion).subscribe({
      next: () => {
        this.mostrarExito('Tipo de transacción creado exitosamente');
        this.cargarTiposTransaccion();
      },
      error: (error: any) => {
        console.error('Error al crear tipo de transacción:', error);
        this.mostrarError('Error al crear el tipo de transacción');
        this.isLoading = false;
      }
    });
  }

  actualizarTipoTransaccion(id: string, tipoTransaccion: TipoTransaccion): void {
    if (!id) {
      this.mostrarError('Error: ID de tipo de transacción no válido');
      return;
    }
    
    this.isLoading = true;
    this.tipoTransaccionService.actualizarTipoTransaccion(id, tipoTransaccion).subscribe({
      next: () => {
        this.mostrarExito('Tipo de transacción actualizado exitosamente');
        this.cargarTiposTransaccion();
      },
      error: (error: any) => {
        console.error('Error al actualizar tipo de transacción:', error);
        this.mostrarError('Error al actualizar el tipo de transacción');
        this.isLoading = false;
      }
    });
  }

  eliminarTipoTransaccion(id: string): void {
    if (!id) {
      this.mostrarError('Error: ID de tipo de transacción no válido');
      return;
    }
    
    this.isLoading = true;
    this.tipoTransaccionService.eliminarTipoTransaccion(id).subscribe({
      next: () => {
        this.mostrarExito('Tipo de transacción eliminado exitosamente');
        this.cargarTiposTransaccion();
      },
      error: (error: any) => {
        console.error('Error al eliminar tipo de transacción:', error);
        this.mostrarError('Error al eliminar el tipo de transacción');
        this.isLoading = false;
      }
    });
  }

  toggleRequiereDestino(tipoTransaccion: TipoTransaccion): void {
    if (!tipoTransaccion.id) {
      this.mostrarError('Error: ID de tipo de transacción no válido');
      return;
    }
    
    const nuevoTipoTransaccion = { 
      ...tipoTransaccion, 
      requiereDestino: !tipoTransaccion.requiereDestino 
    };
    this.actualizarTipoTransaccion(tipoTransaccion.id, nuevoTipoTransaccion);
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
