import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';
import { Estado } from '../../../../../../../core/models/estado.model';

@Component({
  selector: 'app-editar-estado-dialog',
  standalone: true,
  templateUrl: './editar-estado-dialog.component.html',
  styleUrls: ['./editar-estado-dialog.component.css'],
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
export class EditarEstadoDialogComponent implements OnInit, OnDestroy {
  form: FormGroup;
  estadoOriginal: string = '';
  isLoading: boolean = false;
  cambioRealizado: boolean = false;
  private nombreSub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditarEstadoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { estado: Estado }
  ) {
    this.estadoOriginal = data.estado.nombre;
    
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
    
    this.dialogRef.addPanelClass(['custom-dialog', 'custom-dark-dialog']);
  }

  ngOnInit(): void {
    this.nombreSub = this.form.get('nombre')?.valueChanges.subscribe(valor => {
      this.cambioRealizado = valor !== this.estadoOriginal;
    });
  }

  ngOnDestroy(): void {
    this.nombreSub?.unsubscribe();
  }

  
  getFormattedId(): string {
    const id = this.data.estado.id;
    if (!id) return "No disponible";
    
    if (id.length > 12) {
      return id.substring(0, 6) + '...' + id.substring(id.length - 6);
    }
    
    return id;
  }

  
  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    
    this.isLoading = true;
    
    const estadoActualizado: Estado = {
      ...this.data.estado,
      nombre: this.form.value.nombre.trim()
    };
    
    setTimeout(() => {
      this.isLoading = false;
      this.dialogRef.close(estadoActualizado);
    }, 500);
  }

  
  cancelar(): void {
    this.dialogRef.close();
  }
}