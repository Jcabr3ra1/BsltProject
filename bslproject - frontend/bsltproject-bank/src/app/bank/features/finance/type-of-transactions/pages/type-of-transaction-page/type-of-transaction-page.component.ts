import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';

import { TipoTransaccionService } from '../../services/tipo-transaccion.service';
import { TipoTransaccion } from '../../../../../../core/models/tipo_transaccion.model';
import { CrearTipoTransaccionDialogComponent } from '../../shared/dialog/crear-tipo-transaccion-dialog/crear-tipo-transaccion-dialog.component';
import { EditarTipoTransaccionDialogComponent } from '../../shared/dialog/editar-tipo-transaccion-dialog/editar-tipo-transaccion-dialog.component';

@Component({
  selector: 'app-type-of-transaction-page',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatIconModule, MatButtonModule],
  templateUrl: './type-of-transaction-page.component.html',
  styleUrls: ['./type-of-transaction-page.component.scss']
})
export class TypeOfTransactionPageComponent implements OnInit {
  tiposTransaccion: TipoTransaccion[] = [];
  displayedColumns: string[] = ['descripcion', 'acciones'];

  constructor(
    private tipoTransaccionService: TipoTransaccionService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.cargarTiposTransaccion();
  }

  cargarTiposTransaccion(): void {
    this.tipoTransaccionService.getTiposTransaccion().subscribe({
      next: (data) => this.tiposTransaccion = data,
      error: () => alert('Error al cargar los tipos de transacción')
    });
  }

  abrirCrear(): void {
    const dialogRef = this.dialog.open(CrearTipoTransaccionDialogComponent);
    dialogRef.afterClosed().subscribe((nuevo) => {
      if (nuevo) {
        this.tipoTransaccionService.crearTipoTransaccion(nuevo).subscribe(() => this.cargarTiposTransaccion());
      }
    });
  }

  abrirEditar(tipo: TipoTransaccion): void {
    const dialogRef = this.dialog.open(EditarTipoTransaccionDialogComponent, { data: tipo });
    dialogRef.afterClosed().subscribe((actualizado) => {
      const id = actualizado?.id || actualizado?._id;
      if (actualizado && id) {
        this.tipoTransaccionService.actualizarTipoTransaccion(id, actualizado)
          .subscribe(() => this.cargarTiposTransaccion());
      }
    });
  }

  eliminarTipo(tipo: TipoTransaccion): void {
    const id = tipo.id || tipo._id;
    if (confirm('¿Estás seguro de eliminar este tipo de transacción?') && id) {
      this.tipoTransaccionService.eliminarTipoTransaccion(id).subscribe(() => this.cargarTiposTransaccion());
    }
  }
}
