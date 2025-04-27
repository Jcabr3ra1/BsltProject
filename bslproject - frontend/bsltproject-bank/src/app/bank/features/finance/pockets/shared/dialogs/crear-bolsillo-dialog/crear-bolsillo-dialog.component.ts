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
  ],
})
export class CrearBolsilloDialogComponent {
  form: FormGroup;

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
      nombrePersonalizado: [''],
      colorPersonalizado: ['#607d8b'],
    });
  }

  getColorPorTipo(tipo: string): string {
    const colores: Record<string, string> = {
      Ahorro: '#4caf50',
      Emergencias: '#f44336',
      Viajes: '#2196f3',
      Educación: '#ff9800',
      Personalizado: '#9c27b0',
    };
    return colores[tipo] || '#607d8b';
  }

  guardar(): void {
    if (this.form.valid) {
      const tipo = this.form.value.tipo;

      const nombreFinal =
        tipo === 'Personalizado' ? this.form.value.nombrePersonalizado : tipo;

      const colorFinal =
        tipo === 'Personalizado'
          ? this.form.value.colorPersonalizado
          : this.getColorPorTipo(tipo);

      this.dialogRef.close({
        nombre: nombreFinal,
        color: colorFinal,
        saldo: this.form.value.saldo,
      });
    }
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
