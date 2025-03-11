import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule
  ]
})
export class ConfirmDialogComponent {
  titulo: string;
  mensaje: string;
  botonAceptar: string;
  botonCancelar: string;

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.titulo = data.titulo || 'Confirmar';
    this.mensaje = data.mensaje || '¿Está seguro de realizar esta acción?';
    this.botonAceptar = data.botonAceptar || 'Aceptar';
    this.botonCancelar = data.botonCancelar || 'Cancelar';
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
