import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { Permiso } from '../../../../../../../core/models/permiso.model';

@Component({
  selector: 'app-ver-permisos-rol-dialog',
  standalone: true,
  templateUrl: './ver-permisos-rol-dialog.component.html',
  styleUrls: ['./ver-permisos-rol-dialog.component.scss'],
  imports: [
    CommonModule,
    MatDialogModule,
    MatListModule
  ]
})
export class VerPermisosRolDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<VerPermisosRolDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { permisos: Permiso[] }
  ) {}

  cerrar(): void {
    this.dialogRef.close();
  }
}
