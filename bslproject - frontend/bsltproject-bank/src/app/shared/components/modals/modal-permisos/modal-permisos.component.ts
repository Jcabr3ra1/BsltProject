import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-modal-permisos',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule, MatListModule, MatIconModule],
  templateUrl: './modal-permisos.component.html',
  styleUrls: ['./modal-permisos.component.scss']
})
export class ModalPermisosComponent {
  constructor(
    public dialogRef: MatDialogRef<ModalPermisosComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { nombre: string, permisos: any[] }
  ) {}

  cerrar() {
    this.dialogRef.close();
  }
}
