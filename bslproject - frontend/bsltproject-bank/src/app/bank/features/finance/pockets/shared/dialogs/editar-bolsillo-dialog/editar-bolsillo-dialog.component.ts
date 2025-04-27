import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

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
  ]
})
export class EditarBolsilloDialogComponent {
  form: FormGroup;
  tiposBolsillo: string[] = ['Ahorro', 'Emergencias', 'Viajes', 'Educación', 'Personalizado'];
  color: string = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<EditarBolsilloDialogComponent>,
    private fb: FormBuilder
  ) {
    const esPersonalizado = !this.tiposBolsillo.includes(data.nombre);

    this.form = this.fb.group({
      tipo: [esPersonalizado ? 'Personalizado' : data.nombre, Validators.required],
      saldo: [data.saldo, [Validators.required, Validators.min(0)]],
      nombrePersonalizado: [esPersonalizado ? data.nombre : ''],
      colorPersonalizado: [esPersonalizado ? data.color : '#607d8b']
    });

    this.color = esPersonalizado ? data.color : this.getColorPorTipo(data.nombre);
  }

  getColorPorTipo(tipo: string): string {
    const colores: Record<string, string> = {
      Ahorro: '#4caf50',
      Emergencias: '#f44336',
      Viajes: '#2196f3',
      Educación: '#ff9800',
      Personalizado: '#9c27b0'
    };
    return colores[tipo] || '#607d8b';
  }

  guardar(): void {
    const tipo = this.form.value.tipo;
  
    const nombreFinal = tipo === 'Personalizado'
      ? this.form.value.nombrePersonalizado
      : tipo;
  
    const colorFinal = tipo === 'Personalizado'
      ? this.form.value.colorPersonalizado
      : this.getColorPorTipo(tipo);
  
    this.dialogRef.close({
      id: this.data.id, // 👈 ¡esto debe venir desde la apertura del diálogo!
      nombre: nombreFinal,
      color: colorFinal,
      saldo: this.form.value.saldo
    });
  }
  
  
  cancelar(): void {
    this.dialogRef.close();
  }
}
