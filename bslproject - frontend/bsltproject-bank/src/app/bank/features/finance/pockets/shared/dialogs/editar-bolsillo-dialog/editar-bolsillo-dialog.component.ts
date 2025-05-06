import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  standalone: true,
  selector: 'app-editar-bolsillo-dialog',
  templateUrl: './editar-bolsillo-dialog.component.html',
  styleUrls: ['./editar-bolsillo-dialog.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class EditarBolsilloDialogComponent {
  form: FormGroup;
  tiposBolsillo: string[] = ['Ahorro', 'Emergencias', 'Viajes', 'Educación', 'Personalizado'];
  color: string = '';
  isLoading = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<EditarBolsilloDialogComponent>,
    private fb: FormBuilder
  ) {
    const esPersonalizado = !this.tiposBolsillo.includes(data.nombre);

    this.form = this.fb.group({
      tipo: [esPersonalizado ? 'Personalizado' : data.nombre, Validators.required],
      saldo: [data.saldo, [Validators.required, Validators.min(0)]],
      nombrePersonalizado: [esPersonalizado ? data.nombre : '', Validators.required],
      colorPersonalizado: [esPersonalizado ? data.color : '#607d8b']
    });

    this.color = esPersonalizado ? data.color : this.getColorPorTipo(data.nombre);
    
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
      Personalizado: '#9c27b0'
    };
    return colores[tipo] || '#607d8b';
  }

  guardar(): void {
    if (this.form.valid) {
      this.isLoading = true;
      
      const tipo = this.form.value.tipo;
  
      const nombreFinal = tipo === 'Personalizado'
        ? this.form.value.nombrePersonalizado
        : tipo;
  
      const colorFinal = tipo === 'Personalizado'
        ? this.form.value.colorPersonalizado
        : this.getColorPorTipo(tipo);
      
      // Simulación de carga para demostración
      setTimeout(() => {
        this.isLoading = false;
        this.dialogRef.close({
          id: this.data.id, // Aseguramos que el ID venga desde la apertura del diálogo
          nombre: nombreFinal,
          color: colorFinal,
          saldo: this.form.value.saldo
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