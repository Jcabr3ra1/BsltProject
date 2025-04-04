import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { TipoMovimiento } from '@core/models/finanzas/tipo-movimiento.model';

interface TipoOption {
  valor: string;
  nombre: string;
}

@Component({
  selector: 'app-tipo-movimiento-dialog',
  templateUrl: './tipo-movimiento-dialog.component.html',
  styleUrls: ['./tipo-movimiento-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule
  ]
})
export class TipoMovimientoDialogComponent implements OnInit {
  tipoMovimientoForm: FormGroup;
  titulo: string;
  tipoMovimiento: TipoMovimiento | null = null;
  isSubmitting = false;
  
  // Constantes para los tipos de origen y destino
  readonly ACCOUNT = 'ACCOUNT';
  readonly WALLET = 'WALLET';
  readonly EXTERNAL = 'EXTERNAL';
  
  // Opciones para los selectores
  tiposOrigen: TipoOption[] = [
    { valor: this.ACCOUNT, nombre: 'Cuenta' },
    { valor: this.WALLET, nombre: 'Bolsillo' },
    { valor: this.EXTERNAL, nombre: 'Externo' }
  ];
  
  tiposDestino: TipoOption[] = [
    { valor: this.ACCOUNT, nombre: 'Cuenta' },
    { valor: this.WALLET, nombre: 'Bolsillo' },
    { valor: this.EXTERNAL, nombre: 'Externo' }
  ];

  constructor(
    private readonly fb: FormBuilder,
    public dialogRef: MatDialogRef<TipoMovimientoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.titulo = data.modo === 'crear' ? 'Crear Tipo de Movimiento' : 'Editar Tipo de Movimiento';
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
    if (this.data.modo === 'editar' && this.tipoMovimiento) {
      this.tipoMovimientoForm.patchValue({
        nombre: this.tipoMovimiento.nombre,
        codigo_origen: this.tipoMovimiento.codigoOrigen,
        codigo_destino: this.tipoMovimiento.codigoDestino,
        descripcion: this.tipoMovimiento.descripcion,
        estado: this.tipoMovimiento.activo
      });
    }
  }

  onSubmit(): void {
    if (this.tipoMovimientoForm.valid) {
      this.isSubmitting = true;
      
      const formValues = this.tipoMovimientoForm.value;
      const tipoMovimiento = {
        ...(this.tipoMovimiento ? { id: this.tipoMovimiento.id } : {}),
        nombre: formValues.nombre,
        codigoOrigen: formValues.codigo_origen,
        codigoDestino: formValues.codigo_destino,
        descripcion: formValues.descripcion,
        activo: formValues.estado
      };
      
      this.dialogRef.close(tipoMovimiento);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
  
  // Método para optimizar el tracking en listas ngFor
  trackByValue(index: number, item: TipoOption): string {
    return item.valor;
  }
}
