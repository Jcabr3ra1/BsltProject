import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Transaccion } from '../../../../../../../core/models/transaccion.model';

@Component({
  selector: 'app-editar-transaccion-dialog',
  standalone: true,
  templateUrl: './editar-transaccion-dialog.component.html',
  styleUrls: ['./editar-transaccion-dialog.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule
  ]
})
export class EditarTransaccionDialogComponent {
  form: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<EditarTransaccionDialogComponent>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: Transaccion
  ) {
    this.form = this.fb.group({
      descripcion: [data.descripcion, Validators.required],
      fecha_transaccion: [new Date(data.fecha_transaccion), Validators.required]
    });
  }

  guardar(): void {
    if (this.form.valid) {
      const actualizada = {
        id: this.data.id || this.data._id,
        ...this.form.value,
        fecha_transaccion: this.form.value.fecha_transaccion.toISOString()
      };
      this.dialogRef.close(actualizada);
    }
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
