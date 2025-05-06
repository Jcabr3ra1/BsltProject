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
  esAdmin: boolean = false;
  coloresPredefinidos: string[] = [
    '#a46cf5', '#64b5f6', '#4caf50', '#ff5252',
    '#ffb300', '#607d8b', '#9c27b0', '#009688'
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditarCuentaDialogComponent>,
    private cuentasService: CuentasService,
    @Inject(MAT_DIALOG_DATA) public data: Cuenta
  ) {
    this.cuenta = data;
    this.dialogRef.addPanelClass(['custom-dialog', 'custom-dark-dialog']);
  }

  ngOnInit(): void {
    // Detectar rol del usuario desde localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const roles = Array.isArray(user.roles) ? user.roles.map((r: any) => typeof r === 'string' ? r : r.nombre) : [];
    this.esAdmin = roles.includes('ADMIN');

    this.inicializarFormulario();

    // Ajustar el color según tipo de cuenta
    this.form.get('tipo_cuenta')?.valueChanges.subscribe(tipo => {
      this.ajustarColorPorTipo(tipo);
    });

    // Si NO es admin, desactivar campos
    if (!this.esAdmin) {
      this.form.get('tipo_cuenta')?.disable();
      this.form.get('numero_cuenta')?.disable();
      this.form.get('saldo')?.disable();
    }
  }

  inicializarFormulario(): void {
    this.form = this.fb.group({
      tipo_cuenta: [this.data.tipo, Validators.required],
      numero_cuenta: [this.data.numero_cuenta, [Validators.required, Validators.pattern('[0-9\\-]*')]],
      saldo: [this.data.saldo, [Validators.required, Validators.min(0)]],
      meta_ahorro: [this.data.meta_ahorro || 0, [Validators.min(0)]],
      color: [this.data.color || '#a46cf5', Validators.required]
    });
  }

  ajustarColorPorTipo(tipo: string): void {
    const colorActual = this.form.get('color')?.value;
    const colorExistente = this.coloresPredefinidos.includes(colorActual);
    if (!colorExistente) return;

    let colorPredeterminado = '';
    switch (tipo) {
      case 'CUENTA_AHORRO': colorPredeterminado = this.coloresPredefinidos[0]; break;
      case 'CUENTA_CORRIENTE': colorPredeterminado = this.coloresPredefinidos[1]; break;
      case 'CUENTA_NOMINA': colorPredeterminado = this.coloresPredefinidos[3]; break;
      default: colorPredeterminado = this.coloresPredefinidos[5];
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

      const id = this.cuenta._id || this.cuenta.id;
      if (!id) {
        this.cargando = false;
        return;
      }

      const payload: any = {
        ...this.data,
        meta_ahorro: parseFloat((this.form.value.meta_ahorro || 0).toFixed(2)),
        color: this.form.value.color
      };

      if (this.esAdmin) {
        payload.tipo = this.form.value.tipo_cuenta;
        payload.numero_cuenta = this.form.value.numero_cuenta;
        payload.saldo = parseFloat(this.form.value.saldo.toFixed(2));
      }

      this.cuentasService.actualizarCuenta(id, payload).subscribe({
        next: () => {
          this.cargando = false;
          this.dialogRef.close(true);
        },
        error: () => {
          this.cargando = false;
        }
      });
    } else {
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
    }
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }
}
