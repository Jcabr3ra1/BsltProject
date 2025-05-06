import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-crear-cuenta-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './crear-cuenta-dialog.component.html',
  styleUrls: ['./crear-cuenta-dialog.component.scss']
})
export class CrearCuentaDialogComponent implements OnInit {
  form: FormGroup;
  isLoading = false;
  coloresPredefinidos: string[] = [
    '#a46cf5', // Morado (primary)
    '#64b5f6', // Azul
    '#4caf50', // Verde
    '#ff5252', // Rojo
    '#ffb300', // Ámbar
    '#607d8b', // Gris azulado
    '#9c27b0', // Púrpura
    '#009688'  // Verde azulado
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CrearCuentaDialogComponent>
  ) {
    // Inicializar el formulario con valores predeterminados
    this.form = this.fb.group({
      tipo: ['CUENTA_AHORRO', Validators.required],
      numero_cuenta: ['', [Validators.required, Validators.pattern('[0-9\\-]*')]],
      saldo: [0, [Validators.required, Validators.min(0)]],
      meta_ahorro: [0, [Validators.required, Validators.min(0)]],
      color: ['#a46cf5', Validators.required] // Color morado por defecto
    });
    
    // Configurar clases para el diálogo
    this.dialogRef.addPanelClass(['custom-dialog', 'custom-dark-dialog']);
  }

  ngOnInit(): void {
    // Observar cambios en el tipo de cuenta para ajustar el color predeterminado
    this.form.get('tipo')?.valueChanges.subscribe(tipo => {
      let colorPredeterminado = '';
      
      switch(tipo) {
        case 'CUENTA_AHORRO':
          colorPredeterminado = this.coloresPredefinidos[0]; // Morado
          break;
        case 'CUENTA_CORRIENTE':
          colorPredeterminado = this.coloresPredefinidos[1]; // Azul
          break;
        case 'CUENTA_NOMINA':
          colorPredeterminado = this.coloresPredefinidos[3]; // Rojo
          break;
        default:
          colorPredeterminado = this.coloresPredefinidos[5]; // Gris azulado
      }
      
      // Solo cambiar el color si el usuario no lo ha modificado manualmente
      const colorActual = this.form.get('color')?.value;
      const colorExistente = this.coloresPredefinidos.includes(colorActual);
      
      if (colorExistente) {
        this.form.get('color')?.setValue(colorPredeterminado);
      }
    });
  }

  seleccionarColorPredefinido(color: string): void {
    this.form.get('color')?.setValue(color);
  }

  guardar(): void {
    if (this.form.valid) {
      this.isLoading = true;
      
      const cuenta = this.form.value;
      
      // Formatear los números antes de enviar
      cuenta.saldo = parseFloat(cuenta.saldo.toFixed(2));
      cuenta.meta_ahorro = parseFloat(cuenta.meta_ahorro.toFixed(2));
      
      // Simular un retardo para mostrar el estado de carga (para demo)
      setTimeout(() => {
        this.isLoading = false;
        this.dialogRef.close(cuenta);
      }, 500);
    } else {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
    }
  }
  
  cancelar(): void {
    this.dialogRef.close(null);
  }
}