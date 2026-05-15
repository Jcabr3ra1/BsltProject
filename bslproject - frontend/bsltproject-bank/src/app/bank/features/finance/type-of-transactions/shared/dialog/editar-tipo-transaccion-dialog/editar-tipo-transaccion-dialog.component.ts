import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TipoTransaccion } from '../../../../../../../core/models/tipo_transaccion.model';

@Component({
  selector: 'app-editar-tipo-transaccion-dialog',
  standalone: true,
  templateUrl: './editar-tipo-transaccion-dialog.component.html',
  styleUrls: ['./editar-tipo-transaccion-dialog.component.css'],
  imports: [
    CommonModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ]
})
export class EditarTipoTransaccionDialogComponent implements OnInit {
  form: FormGroup;
  descripcionOriginal: string = '';
  isLoading = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: TipoTransaccion,
    private dialogRef: MatDialogRef<EditarTipoTransaccionDialogComponent>,
    private fb: FormBuilder
  ) {
    this.descripcionOriginal = data.descripcion;
    
    this.form = this.fb.group({
      descripcion: [data.descripcion, [
        Validators.required, 
        Validators.minLength(3)
      ]]
    });
    
    this.dialogRef.addPanelClass(['custom-dialog', 'custom-dark-dialog']);
  }

  ngOnInit(): void {
  }

  
  guardar(): void {
    if (this.form.valid) {
      this.isLoading = true;
      
      const actualizado = {
        id: this.data.id || this.data._id,
        descripcion: this.form.value.descripcion.trim()
      };
      
      setTimeout(() => {
        this.isLoading = false;
        this.dialogRef.close(actualizado);
      }, 500);
    } else {
      this.form.markAllAsTouched();
    }
  }

  
  getFormattedId(): string {
    const id = this.data.id || this.data._id;
    if (!id) return "No disponible";
    
    if (id.length > 12) {
      return id.substring(0, 6) + '...' + id.substring(id.length - 6);
    }
    
    return id;
  }

  
  cancelar(): void {
    this.dialogRef.close();
  }
}