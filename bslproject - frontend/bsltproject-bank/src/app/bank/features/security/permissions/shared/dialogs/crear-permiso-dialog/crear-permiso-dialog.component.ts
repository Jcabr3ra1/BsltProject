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
  selector: 'app-crear-permiso-dialog',
  standalone: true,
  templateUrl: './crear-permiso-dialog.component.html',
  styleUrls: ['./crear-permiso-dialog.component.scss'],
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
export class CrearPermisoDialogComponent implements OnInit {
  form: FormGroup;
  isLoading: boolean = false;
  nombreOriginal: string = '';
  descripcionOriginal: string = '';

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CrearPermisoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { permiso?: Permiso }
  ) {
    // Inicializar el formulario
    this.form = this.fb.group({
      nombre: [
        data.permiso?.nombre || '', 
        [
          Validators.required, 
          Validators.minLength(3),
          Validators.maxLength(50)
        ]
      ],
      descripcion: [
        data.permiso?.descripcion || '', 
        [
          Validators.required, 
          Validators.minLength(5),
          Validators.maxLength(200)
        ]
      ]
    });
    
    // Guardar los valores originales si estamos en modo edición
    if (data.permiso) {
      this.nombreOriginal = data.permiso.nombre;
      this.descripcionOriginal = data.permiso.descripcion;
    }
    
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
   * Obtiene una fecha de creación formateada (simulada)
   * @returns Fecha formateada
   */
  getFechaCreacion(): string {
    // Aquí podrías obtener la fecha real del permiso si la tienes
    // Para demostración, usamos una fecha ficticia
    return '10/04/2023';
  }

  /**
   * Guarda el permiso (crear nuevo o actualizar existente)
   */
  guardar(): void {
    if (this.form.invalid) {
      // Marcar todos los campos como tocados para mostrar los errores
      this.form.markAllAsTouched();
      return;
    }
    
    this.isLoading = true;
    
    // Crear el objeto permiso para enviar
    const permiso: Permiso = {
      ...this.data.permiso, // Mantener ID y otros campos si existe
      nombre: this.form.value.nombre.trim(),
      descripcion: this.form.value.descripcion.trim()
    };
    
    // Simular un retardo para mostrar el estado de carga (para demo)
    setTimeout(() => {
      this.isLoading = false;
      this.dialogRef.close(permiso);
    }, 500);
  }

  /**
   * Cierra el diálogo sin guardar cambios
   */
  cancelar(): void {
    this.dialogRef.close();
  }
}