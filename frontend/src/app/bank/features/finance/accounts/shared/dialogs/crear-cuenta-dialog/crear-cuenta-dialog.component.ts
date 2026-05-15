import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';

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
  styleUrls: ['./crear-cuenta-dialog.component.css']
})
export class CrearCuentaDialogComponent implements OnInit, OnDestroy {
  form: FormGroup;
  isLoading = false;
  coloresPredefinidos: string[] = [
    '#a46cf5',
    '#64b5f6',
    '#4caf50',
    '#ff5252',
    '#ffb300',
    '#607d8b',
    '#9c27b0',
    '#009688'
  ];
  private tipoSub!: Subscription;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CrearCuentaDialogComponent>
  ) {
    this.form = this.fb.group({
      tipo: ['CUENTA_AHORRO', Validators.required],
      numero_cuenta: ['', [Validators.required, Validators.pattern('[0-9\\-]*')]],
      saldo: [0, [Validators.required, Validators.min(0)]],
      meta_ahorro: [0, [Validators.required, Validators.min(0)]],
      color: ['#a46cf5', Validators.required]
    });
    
    this.dialogRef.addPanelClass(['custom-dialog', 'custom-dark-dialog']);
  }

  ngOnInit(): void {
    this.tipoSub = this.form.get('tipo')!.valueChanges.subscribe(tipo => {
      let colorPredeterminado = '';
      
      switch(tipo) {
        case 'CUENTA_AHORRO':
          colorPredeterminado = this.coloresPredefinidos[0];
          break;
        case 'CUENTA_CORRIENTE':
          colorPredeterminado = this.coloresPredefinidos[1];
          break;
        case 'CUENTA_NOMINA':
          colorPredeterminado = this.coloresPredefinidos[3];
          break;
        default:
          colorPredeterminado = this.coloresPredefinidos[5];
      }
      
      const colorActual = this.form.get('color')?.value;
      const colorExistente = this.coloresPredefinidos.includes(colorActual);
      
      if (colorExistente) {
        this.form.get('color')?.setValue(colorPredeterminado);
      }
    });
  }

  ngOnDestroy(): void {
    this.tipoSub?.unsubscribe();
  }

  seleccionarColorPredefinido(color: string): void {
    this.form.get('color')?.setValue(color);
  }

  guardar(): void {
    if (this.form.valid) {
      this.isLoading = true;
      
      const cuenta = this.form.value;
      
      cuenta.saldo = parseFloat(cuenta.saldo.toFixed(2));
      cuenta.meta_ahorro = parseFloat(cuenta.meta_ahorro.toFixed(2));
      
      setTimeout(() => {
        this.isLoading = false;
        this.dialogRef.close(cuenta);
      }, 500);
    } else {
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
    }
  }
  
  cancelar(): void {
    this.dialogRef.close(null);
  }
}