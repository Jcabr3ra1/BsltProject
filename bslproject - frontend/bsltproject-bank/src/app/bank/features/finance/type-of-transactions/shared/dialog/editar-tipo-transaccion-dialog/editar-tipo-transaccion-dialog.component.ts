import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { TipoTransaccion } from '../../../../../../../core/models/tipo_transaccion.model';

@Component({
  selector: 'app-editar-tipo-transaccion-dialog',
  standalone: true,
  templateUrl: './editar-tipo-transaccion-dialog.component.html',
  styleUrls: ['./editar-tipo-transaccion-dialog.component.scss'],
  imports: [
    CommonModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ]
})
export class EditarTipoTransaccionDialogComponent {
  form: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: TipoTransaccion,
    private dialogRef: MatDialogRef<EditarTipoTransaccionDialogComponent>,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      descripcion: [data.descripcion, Validators.required]
    });
  }

  guardar(): void {
    if (this.form.valid) {
      const actualizado = {
        id: this.data.id || this.data._id,
        ...this.form.value
      };
      this.dialogRef.close(actualizado);
    }
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
