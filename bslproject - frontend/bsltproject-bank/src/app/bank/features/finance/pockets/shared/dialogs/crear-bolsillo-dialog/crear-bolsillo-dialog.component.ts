import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

@Component({
  standalone: true,
  selector: 'app-crear-bolsillo-dialog',
  templateUrl: './crear-bolsillo-dialog.component.html',
  styleUrls: ['./crear-bolsillo-dialog.component.scss'],
  imports: [
    CommonModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule
  ],
})
export class CrearBolsilloDialogComponent {
  form: FormGroup;
  isLoading = false;

  tiposBolsillo: string[] = [
    'Ahorro',
    'Emergencias',
    'Viajes',
    'Educación',
    'Personalizado',
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CrearBolsilloDialogComponent>
  ) {
    this.form = this.fb.group({
      tipo: ['', Validators.required],
      saldo: [0, [Validators.required, Validators.min(0)]],
      nombrePersonalizado: ['', Validators.required],
      colorPersonalizado: ['#607d8b'],
    });
    
    // Configurar clases para el diálogo
    this.dialogRef.addPanelClass(['custom-dialog', 'custom-dark-dialog']);
    
    // Configurar validación condicional para nombrePersonalizado
    this.form.get('tipo')?.valueChanges.subscribe(tipo => {
      const nombreControl = this.form.get('nombrePersonalizado');
      
      if (tipo === 'Personalizado') {
        nombreControl?.setValidators([Validators.required]);
      } else {
        nombreControl?.clearValidators();
        nombreControl?.setValue('');
      }
      
      nombreControl?.updateValueAndValidity();
    });
  }

  getColorPorTipo(tipo: string): string {
    const colores: Record<string, string> = {
      Ahorro: '#4caf50',
      Emergencias: '#f44336',
      Viajes: '#2196f3',
      'Educación': '#ff9800',
      Personalizado: '#9c27b0',
    };
    return colores[tipo] || '#607d8b';
  }

  guardar(): void {
    if (this.form.valid) {
      this.isLoading = true;
      
      const tipo = this.form.value.tipo;

      const nombreFinal =
        tipo === 'Personalizado' ? this.form.value.nombrePersonalizado : tipo;

      const colorFinal =
        tipo === 'Personalizado'
          ? this.form.value.colorPersonalizado
          : this.getColorPorTipo(tipo);
      
      // Simulación de carga para demostración
      setTimeout(() => {
        this.isLoading = false;
        this.dialogRef.close({
          nombre: nombreFinal,
          color: colorFinal,
          saldo: this.form.value.saldo,
        });
      }, 500);
    } else {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
    }
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}