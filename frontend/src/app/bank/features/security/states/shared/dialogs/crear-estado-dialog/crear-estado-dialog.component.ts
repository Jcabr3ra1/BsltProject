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
  styleUrls: ['./crear-estado-dialog.component.css'],
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
    this.modoEdicion = !!data.estado;
    
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
    
    if (this.modoEdicion && data.estado) {
      this.nombreOriginal = data.estado.nombre;
    }
    
    this.dialogRef.addPanelClass(['custom-dialog', 'custom-dark-dialog']);
  }

  ngOnInit(): void {
  }

  
  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    
    this.isLoading = true;
    
    const estado: Estado = {
      ...this.data.estado, // Mantener la ID y otros campos si existe
      nombre: this.form.value.nombre.trim()
    };
    
    setTimeout(() => {
      this.isLoading = false;
      this.dialogRef.close(estado);
    }, 500);
  }

  
  cancelar(): void {
    this.dialogRef.close();
  }
}