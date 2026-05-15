import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Permiso } from '../../../../../../../core/models/permiso.model';

@Component({
  selector: 'app-ver-permisos-rol-dialog',
  standalone: true,
  templateUrl: './ver-permisos-rol-dialog.component.html',
  styleUrls: ['./ver-permisos-rol-dialog.component.css'],
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class VerPermisosRolDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<VerPermisosRolDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { permisos: Permiso[] }
  ) {
    this.dialogRef.addPanelClass(['custom-dialog', 'custom-dark-dialog']);
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}