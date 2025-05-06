import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Permiso } from '../../../../../../../core/models/permiso.model';

@Component({
  selector: 'app-editar-permiso-dialog',
  standalone: true,
  templateUrl: './editar-permiso-dialog.component.html',
  styleUrls: ['./editar-permiso-dialog.component.scss'],
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
export class EditarPermisoDialogComponent implements OnInit {
  form: FormGroup;
  isLoading: boolean = false;
  nombreOriginal: string = '';
  descripcionOriginal: string = '';

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditarPermisoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { permiso: Permiso }
  ) {
    // Inicializar el formulario
    this.form = this.fb.group({
      nombre: [
        data.permiso.nombre, 
        [
          Validators.required, 
          Validators.minLength(3),
          Validators.maxLength(50)
        ]
      ],
      descripcion: [
        data.permiso.descripcion, 
        [
          Validators.required, 
          Validators.minLength(5),
          Validators.maxLength(200)
        ]
      ]
    });
    
    // Guardar los valores originales
    this.nombreOriginal = data.permiso.nombre;
    this.descripcionOriginal = data.permiso.descripcion;
    
    // Configurar clases para el diálogo
    this.dialogRef.addPanelClass(['custom-dialog', 'custom-dark-dialog']);
  }

  ngOnInit(): void {
    // Inicialización adicional si es necesaria
  }

  /**
   * Formatea el ID para mostrarlo en la interfaz
   * @returns El ID formateado o "No disponible" si no hay ID
   */
  getFormattedId(): string {
    const id = this.data.permiso?.id;
    if (!id) return "No disponible";
    
    // Si el ID es muy largo, mostramos solo una parte
    if (id.length > 12) {
      return id.substring(0, 6) + '...' + id.substring(id.length - 6);
    }
    
    return id;
  }

  /**
   * Obtiene la fecha de creación formateada
   * @returns Fecha formateada
   */
  getFechaCreacion(): string {
    // Aquí podrías obtener la fecha real del permiso
    // Para demostración, usamos una fecha ficticia
    return '10/04/2023';
  }

  /**
   * Obtiene la fecha de última modificación formateada
   * @returns Fecha formateada
   */
  getUltimaModificacion(): string {
    // Aquí podrías obtener la fecha real de última modificación
    // Para demostración, usamos una fecha ficticia
    return '18/02/2024';
  }

  /**
   * Guarda los cambios del permiso
   */
  guardar(): void {
    if (this.form.invalid) {
      // Marcar todos los campos como tocados para mostrar los errores
      this.form.markAllAsTouched();
      return;
    }
    
    this.isLoading = true;
    
    // Crear el objeto permiso actualizado para enviar
    const permisoActualizado: Permiso = {
      ...this.data.permiso,
      nombre: this.form.value.nombre.trim(),
      descripcion: this.form.value.descripcion.trim()
    };
    
    // Simular un retardo para mostrar el estado de carga (para demo)
    setTimeout(() => {
      this.isLoading = false;
      this.dialogRef.close(permisoActualizado);
    }, 500);
  }

  /**
   * Cierra el diálogo sin guardar cambios
   */
  cancelar(): void {
    this.dialogRef.close();
  }
}