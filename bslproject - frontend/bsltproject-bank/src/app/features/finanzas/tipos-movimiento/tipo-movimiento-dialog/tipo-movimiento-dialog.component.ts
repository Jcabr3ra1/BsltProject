import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TipoMovimiento } from '../../../../core/models/tipo-movimiento.model';

@Component({
  selector: 'app-tipo-movimiento-dialog',
  templateUrl: './tipo-movimiento-dialog.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ]
})
export class TipoMovimientoDialogComponent implements OnInit {
  tipoMovimientoForm: FormGroup;
  titulo: string;
  tipoMovimiento: TipoMovimiento | null = null;
  
  // Constantes para los tipos de origen y destino
  readonly ACCOUNT = 'ACCOUNT';
  readonly WALLET = 'WALLET';
  readonly EXTERNAL = 'EXTERNAL';
  
  // Opciones para los selectores
  tiposOrigen = [
    { valor: this.ACCOUNT, nombre: 'Cuenta' },
    { valor: this.WALLET, nombre: 'Bolsillo' },
    { valor: this.EXTERNAL, nombre: 'Externo' }
  ];
  
  tiposDestino = [
    { valor: this.ACCOUNT, nombre: 'Cuenta' },
    { valor: this.WALLET, nombre: 'Bolsillo' },
    { valor: this.EXTERNAL, nombre: 'Externo' }
  ];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<TipoMovimientoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.titulo = data.titulo || 'Tipo de Movimiento';
    this.tipoMovimiento = data.tipoMovimiento || null;
    
    this.tipoMovimientoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      codigo_origen: ['', Validators.required],
      codigo_destino: ['', Validators.required],
      descripcion: ['', Validators.maxLength(255)],
      estado: [true]
    });
  }

  ngOnInit(): void {
    if (this.tipoMovimiento) {
      this.tipoMovimientoForm.patchValue({
        nombre: this.tipoMovimiento.nombre,
        codigo_origen: this.tipoMovimiento.codigo_origen,
        codigo_destino: this.tipoMovimiento.codigo_destino,
        descripcion: this.tipoMovimiento.descripcion,
        estado: this.tipoMovimiento.estado
      });
    }
  }

  onSubmit(): void {
    if (this.tipoMovimientoForm.valid) {
      const tipoMovimiento: TipoMovimiento = {
        ...this.tipoMovimiento,
        ...this.tipoMovimientoForm.value
      };
      this.dialogRef.close(tipoMovimiento);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
