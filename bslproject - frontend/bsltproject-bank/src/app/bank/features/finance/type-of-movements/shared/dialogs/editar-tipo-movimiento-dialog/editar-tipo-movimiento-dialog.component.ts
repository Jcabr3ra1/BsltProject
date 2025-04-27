import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { TipoMovimiento } from '../../../../../../../core/models/movement-type.model';

@Component({
  selector: 'app-editar-tipo-movimiento-dialog',
  standalone: true,
  templateUrl: './editar-tipo-movimiento-dialog.component.html',
  styleUrls: ['./editar-tipo-movimiento-dialog.component.scss'],
  imports: [
    CommonModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ]
})
export class EditarTipoMovimientoDialogComponent {
  form: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: TipoMovimiento,
    private dialogRef: MatDialogRef<EditarTipoMovimientoDialogComponent>,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      codigo_origen: [data.codigo_origen, Validators.required],
      codigo_destino: [data.codigo_destino, Validators.required],
      descripcion: [data.descripcion, Validators.required]
    });
  }

  guardar(): void {
    if (this.form.valid) {
      const actualizado = {
        id: this.data.id || this.data._id, // asegura compatibilidad con Mongo
        ...this.form.value
      };
  
      this.dialogRef.close(actualizado);
    }
  }
  

  cancelar(): void {
    this.dialogRef.close();
  }
}
