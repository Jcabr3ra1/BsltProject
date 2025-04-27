import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';

import { MovementTypeService } from '../../services/movement-type.service';
import { TipoMovimiento } from '../../../../../../core/models/movement-type.model';
import { CrearTipoMovimientoDialogComponent } from '../../shared/dialogs/crear-tipo-movimiento-dialog/crear-tipo-movimiento-dialog.component';
import { EditarTipoMovimientoDialogComponent } from '../../shared/dialogs/editar-tipo-movimiento-dialog/editar-tipo-movimiento-dialog.component';

@Component({
  selector: 'app-type-of-movement-page',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatIconModule, MatButtonModule],
  templateUrl: './type-of-movement-page.component.html',
  styleUrls: ['./type-of-movement-page.component.scss'],
})
export class TypeOfMovementPageComponent implements OnInit {
  tiposMovimiento: TipoMovimiento[] = [];
  displayedColumns: string[] = [
    'codigo_origen',
    'codigo_destino',
    'descripcion',
    'acciones',
  ];

  constructor(
    private movementTypeService: MovementTypeService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.cargarTiposMovimiento();
  }

  cargarTiposMovimiento(): void {
    this.movementTypeService.getTiposMovimiento().subscribe({
      next: (data) => (this.tiposMovimiento = data),
      error: () => alert('Error al cargar los tipos de movimiento'),
    });
  }

  abrirCrear(): void {
    const dialogRef = this.dialog.open(CrearTipoMovimientoDialogComponent);

    dialogRef.afterClosed().subscribe((nuevo) => {
      if (nuevo) {
        this.movementTypeService
          .crearTipoMovimiento(nuevo)
          .subscribe(() => this.cargarTiposMovimiento());
      }
    });
  }

  abrirEditar(tipo: TipoMovimiento): void {
    const dialogRef = this.dialog.open(EditarTipoMovimientoDialogComponent, {
      data: tipo,
    });

    dialogRef.afterClosed().subscribe((actualizado) => {
      if (actualizado) {
        this.movementTypeService
          .actualizarTipoMovimiento(actualizado.id!, actualizado)
          .subscribe(() => this.cargarTiposMovimiento());
      }
    });
  }

  eliminarTipo(id: string | undefined): void {
    const confirmacion = confirm(
      '¿Estás seguro de eliminar este tipo de movimiento?'
    );

    if (confirmacion && id) {
      this.movementTypeService
        .eliminarTipoMovimiento(id)
        .subscribe(() => this.cargarTiposMovimiento());
    } else {
      alert('❌ No se pudo eliminar. ID inválido.');
    }
  }
}
