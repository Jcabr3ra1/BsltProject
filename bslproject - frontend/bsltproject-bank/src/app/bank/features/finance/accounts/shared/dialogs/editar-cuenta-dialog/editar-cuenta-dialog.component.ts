import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CuentasService } from '../../../services/cuentas.service';
import { Cuenta } from '../../../../../../../core/models/cuenta.model';

@Component({
  selector: 'app-editar-cuenta-dialog',
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
  templateUrl: './editar-cuenta-dialog.component.html',
  styleUrls: ['./editar-cuenta-dialog.component.scss']
})
export class EditarCuentaDialogComponent implements OnInit {
  form!: FormGroup;
  cuenta!: Cuenta;
  cargando: boolean = false;
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
    private dialogRef: MatDialogRef<EditarCuentaDialogComponent>,
    private cuentasService: CuentasService,
    @Inject(MAT_DIALOG_DATA) public data: Cuenta
  ) {
    this.cuenta = data;
    
    // Configurar clases para el diálogo
    this.dialogRef.addPanelClass(['custom-dialog', 'custom-dark-dialog']);
  }

  ngOnInit(): void {
    this.inicializarFormulario();
    
    // Observar cambios en el tipo de cuenta para ajustar el color
    this.form.get('tipo_cuenta')?.valueChanges.subscribe(tipo => {
      this.ajustarColorPorTipo(tipo);
    });
  }

  inicializarFormulario(): void {
    this.form = this.fb.group({
      tipo_cuenta: [this.data.tipo, Validators.required],
      numero_cuenta: [
        this.data.numero_cuenta, 
        [Validators.required, Validators.pattern('[0-9\\-]*')]
      ],
      saldo: [
        this.data.saldo, 
        [Validators.required, Validators.min(0)]
      ],
      meta_ahorro: [
        this.data.meta_ahorro || 0, 
        [Validators.min(0)]
      ],
      color: [
        this.data.color || '#a46cf5', 
        Validators.required
      ]
    });
  }

  ajustarColorPorTipo(tipo: string): void {
    // Si el usuario ya modificó el color manualmente, no lo cambiamos
    const colorActual = this.form.get('color')?.value;
    const colorExistente = this.coloresPredefinidos.includes(colorActual);
    
    if (!colorExistente) return;
    
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
    
    this.form.get('color')?.setValue(colorPredeterminado);
  }

  seleccionarColorPredefinido(color: string): void {
    this.form.get('color')?.setValue(color);
    this.form.get('color')?.markAsDirty();
  }

  guardar(): void {
    if (this.form.valid) {
      this.cargando = true;
      
      const payload = {
        ...this.data,
        tipo: this.form.value.tipo_cuenta,
        numero_cuenta: this.form.value.numero_cuenta,
        saldo: parseFloat(this.form.value.saldo.toFixed(2)),
        meta_ahorro: parseFloat((this.form.value.meta_ahorro || 0).toFixed(2)),
        color: this.form.value.color
      };

      const id = this.cuenta._id || this.cuenta.id;
      if (!id) {
        console.error('❌ ID de cuenta no definido');
        this.cargando = false;
        return;
      }

      this.cuentasService.actualizarCuenta(id, payload).subscribe({
        next: () => {
          this.cargando = false;
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('❌ Error al actualizar cuenta', error);
          this.cargando = false;
        }
      });
    } else {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
    }
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }
}