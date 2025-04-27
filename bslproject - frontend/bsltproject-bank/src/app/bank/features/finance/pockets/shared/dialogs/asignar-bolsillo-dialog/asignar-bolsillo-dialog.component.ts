import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { CuentasService } from '../../../../accounts/services/cuentas.service';

@Component({
  standalone: true,
  selector: 'app-asignar-bolsillo-dialog',
  templateUrl: './asignar-bolsillo-dialog.component.html',
  styleUrls: ['./asignar-bolsillo-dialog.component.scss'],
  imports: [
    CommonModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule
  ]
})
export class AsignarBolsilloDialogComponent implements OnInit {
  form: FormGroup;
  cuentasDisponibles: any[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { id_bolsillo: string },
    private dialogRef: MatDialogRef<AsignarBolsilloDialogComponent>,
    private fb: FormBuilder,
    private cuentasService: CuentasService
  ) {
    this.form = this.fb.group({
      id_cuenta: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.cuentasService.getCuentas().subscribe((cuentas) => {
      this.cuentasDisponibles = cuentas.filter(c => !c.id_bolsillo);
    });    
  }

  guardar(): void {
    if (this.form.valid) {
      this.dialogRef.close({
        id_bolsillo: this.data.id_bolsillo,
        id_cuenta: this.form.value.id_cuenta
      });
    }
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
