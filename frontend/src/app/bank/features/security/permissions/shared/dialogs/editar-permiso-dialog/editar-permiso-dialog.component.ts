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
  styleUrls: ['./editar-permiso-dialog.component.css'],
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
    
    this.nombreOriginal = data.permiso.nombre;
    this.descripcionOriginal = data.permiso.descripcion;
    
    this.dialogRef.addPanelClass(['custom-dialog', 'custom-dark-dialog']);
  }

  ngOnInit(): void {
  }

  
  getFormattedId(): string {
    const id = this.data.permiso?.id;
    if (!id) return "No disponible";
    
    if (id.length > 12) {
      return id.substring(0, 6) + '...' + id.substring(id.length - 6);
    }
    
    return id;
  }

  
  getFechaCreacion(): string {
    return '10/04/2023';
  }

  
  getUltimaModificacion(): string {
    return '18/02/2024';
  }

  
  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    
    this.isLoading = true;
    
    const permisoActualizado: Permiso = {
      ...this.data.permiso,
      nombre: this.form.value.nombre.trim(),
      descripcion: this.form.value.descripcion.trim()
    };
    
    setTimeout(() => {
      this.isLoading = false;
      this.dialogRef.close(permisoActualizado);
    }, 500);
  }

  
  cancelar(): void {
    this.dialogRef.close();
  }
}