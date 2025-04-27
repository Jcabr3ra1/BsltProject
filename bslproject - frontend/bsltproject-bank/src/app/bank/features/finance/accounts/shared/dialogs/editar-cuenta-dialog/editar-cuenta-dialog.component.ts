import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
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
    MatButtonModule
  ],
  templateUrl: './editar-cuenta-dialog.component.html',
  styleUrls: ['./editar-cuenta-dialog.component.scss']
})
export class EditarCuentaDialogComponent implements OnInit {
  form!: FormGroup;
  tiposCuenta = ['Cuenta de ahorro', 'Cuenta corriente', 'Cuenta nómina', 'Otro'];
  cuenta!: Cuenta;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditarCuentaDialogComponent>,
    private cuentasService: CuentasService,
    @Inject(MAT_DIALOG_DATA) public data: Cuenta
  ) {
    this.cuenta = data;
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      tipo_cuenta: [this.data.tipo, Validators.required],
      numero_cuenta: [this.data.numero_cuenta, Validators.required],
      saldo: [this.data.saldo, Validators.required],
      meta_ahorro: [this.data.meta_ahorro],
      color: [this.data.color]
    });    
  }

  guardar() {
    if (this.form.valid) {
      const payload = {
        ...this.data,
        ...this.form.value,
        tipo: this.form.value.tipo_cuenta,
        numero_cuenta: this.form.value.numero_cuenta,
        saldo: this.form.value.saldo,
        meta_ahorro: this.form.value.meta_ahorro, // ✅ Incluido
        color: this.form.value.color
      };

      const id = this.cuenta._id || this.cuenta.id;
      if (!id) {
        console.error('❌ ID de cuenta no definido');
        return;
      }

      this.cuentasService.actualizarCuenta(id, payload).subscribe(() => {
        this.dialogRef.close(true);
      });
    }
  }

  cancelar() {
    this.dialogRef.close(false);
  }
}
