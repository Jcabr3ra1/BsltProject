import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-crear-tipo-transaccion-dialog',
  standalone: true,
  templateUrl: './crear-tipo-transaccion-dialog.component.html',
  styleUrls: ['./crear-tipo-transaccion-dialog.component.scss'],
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
export class CrearTipoTransaccionDialogComponent {
  form: FormGroup;
  isLoading = false;

  constructor(
    private dialogRef: MatDialogRef<CrearTipoTransaccionDialogComponent>,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      descripcion: ['', [
        Validators.required, 
        Validators.minLength(3)
      ]]
    });
    
    // Configurar clases para el diálogo
    this.dialogRef.addPanelClass(['custom-dialog', 'custom-dark-dialog']);
  }

  /**
   * Guarda el tipo de transacción si el formulario es válido
   */
  guardar(): void {
    if (this.form.valid) {
      this.isLoading = true;
      
      const tipoTransaccion = {
        descripcion: this.form.value.descripcion.trim()
      };
      
      // Simular un retardo para mostrar el estado de carga (para demo)
      setTimeout(() => {
        this.isLoading = false;
        this.dialogRef.close(tipoTransaccion);
      }, 500);
    } else {
      // Marca todos los campos como tocados para mostrar errores
      this.form.markAllAsTouched();
    }
  }

  /**
   * Cierra el diálogo sin guardar cambios
   */
  cancelar(): void {
    this.dialogRef.close();
  }
}