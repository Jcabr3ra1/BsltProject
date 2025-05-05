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
  selector: 'app-editar-estado-dialog',
  standalone: true,
  templateUrl: './editar-estado-dialog.component.html',
  styleUrls: ['./editar-estado-dialog.component.scss'],
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
export class EditarEstadoDialogComponent implements OnInit {
  form: FormGroup;
  estadoOriginal: string = '';
  isLoading: boolean = false;
  cambioRealizado: boolean = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditarEstadoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { estado: Estado }
  ) {
    // Guardar el nombre original para referencia
    this.estadoOriginal = data.estado.nombre;
    
    // Inicializar el formulario
    this.form = this.fb.group({
      nombre: [
        data.estado.nombre, 
        [
          Validators.required, 
          Validators.minLength(3),
          Validators.maxLength(50)
        ]
      ]
    });
    
    // Configurar clases para el diálogo
    this.dialogRef.addPanelClass(['custom-dialog', 'custom-dark-dialog']);
  }

  ngOnInit(): void {
    // Observar cambios en el campo nombre para determinar si hubo cambios
    this.form.get('nombre')?.valueChanges.subscribe(valor => {
      this.cambioRealizado = valor !== this.estadoOriginal;
    });
  }

  /**
   * Formatea el ID para mostrarlo en la interfaz
   * @returns El ID formateado o "No disponible" si no hay ID
   */
  getFormattedId(): string {
    const id = this.data.estado.id;
    if (!id) return "No disponible";
    
    // Si el ID es muy largo, mostramos solo una parte
    if (id.length > 12) {
      return id.substring(0, 6) + '...' + id.substring(id.length - 6);
    }
    
    return id;
  }

  /**
   * Guarda los cambios realizados al estado
   */
  guardar(): void {
    if (this.form.invalid) {
      // Marcar todos los campos como tocados para mostrar los errores
      this.form.markAllAsTouched();
      return;
    }
    
    this.isLoading = true;
    
    // Preparar el objeto estado actualizado
    const estadoActualizado: Estado = {
      ...this.data.estado,
      nombre: this.form.value.nombre.trim()
    };
    
    // Simular un retardo para mostrar el estado de carga (para demo)
    setTimeout(() => {
      this.isLoading = false;
      this.dialogRef.close(estadoActualizado);
    }, 500);
  }

  /**
   * Cierra el diálogo sin guardar cambios
   */
  cancelar(): void {
    this.dialogRef.close();
  }
}