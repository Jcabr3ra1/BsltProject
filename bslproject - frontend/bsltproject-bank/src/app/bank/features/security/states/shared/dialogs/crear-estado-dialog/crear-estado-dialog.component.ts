import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Estado } from '../../../../../../../core/models/estado.model';

@Component({
  selector: 'app-crear-estado-dialog',
  standalone: true,
  templateUrl: './crear-estado-dialog.component.html',
  styleUrls: ['./crear-estado-dialog.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class CrearEstadoDialogComponent implements OnInit {
  form: FormGroup;
  modoEdicion = false;
  isLoading = false;
  nombreOriginal = '';

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CrearEstadoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { estado?: Estado }
  ) {
    // Configurar modo edición si se proporciona un estado
    this.modoEdicion = !!data.estado;
    
    // Inicializar el formulario
    this.form = this.fb.group({
      nombre: [
        data.estado?.nombre || '', 
        [
          Validators.required, 
          Validators.minLength(3),
          Validators.maxLength(50)
        ]
      ]
    });
    
    // Guardar el nombre original para comparaciones
    if (this.modoEdicion && data.estado) {
      this.nombreOriginal = data.estado.nombre;
    }
    
    // Configurar clases para el diálogo
    this.dialogRef.addPanelClass(['custom-dialog', 'custom-dark-dialog']);
  }

  ngOnInit(): void {
    // Cualquier inicialización adicional puede ir aquí
  }

  /**
   * Guarda el estado (crear nuevo o actualizar existente)
   */
  guardar(): void {
    if (this.form.invalid) {
      // Marcar todos los campos como tocados para mostrar los errores
      this.form.markAllAsTouched();
      return;
    }
    
    this.isLoading = true;
    
    // Preparar el objeto estado para crear/actualizar
    const estado: Estado = {
      ...this.data.estado, // Mantener la ID y otros campos si existe
      nombre: this.form.value.nombre.trim()
    };
    
    // Simular un retardo para mostrar el estado de carga (para demo)
    setTimeout(() => {
      this.isLoading = false;
      this.dialogRef.close(estado);
    }, 500);
  }

  /**
   * Cierra el diálogo sin guardar cambios
   */
  cancelar(): void {
    this.dialogRef.close();
  }
}