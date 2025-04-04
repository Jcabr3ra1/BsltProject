import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { TransaccionService } from '@core/services/finanzas/transaccion.service';
import { Transaction, TransactionType } from '@core/models/finanzas/transaccion.model';

interface DialogData {
  transaction?: Transaction;
}

@Component({
  selector: 'app-transaccion-dialog',
  templateUrl: './transaccion-dialog.component.html',
  styleUrls: ['./transaccion-dialog.component.scss'],
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
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule
  ]
})
export class TransaccionDialogComponent implements OnInit {
  transaccionForm: FormGroup;
  isLoading = false;
  error: string | null = null;
  tiposMovimiento: any[] = [];
  cuentas: any[] = [];
  bolsillos: any[] = [];

  constructor(
    private readonly dialogRef: MatDialogRef<TransaccionDialogComponent>,
    private readonly transaccionService: TransaccionService,
    private readonly fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.transaccionForm = this.fb.group({
      id: [data.transaction?.id || null],
      fecha: [data.transaction?.createdAt || new Date(), Validators.required],
      tipoMovimiento: [data.transaction?.tipo || '', Validators.required],
      cuenta: [data.transaction?.cuentaOrigen || '', Validators.required],
      bolsillo: [data.transaction?.cuentaDestino || ''],
      monto: [data.transaction?.monto || 0, [Validators.required, Validators.min(1)]],
      descripcion: [data.transaction?.descripcion || '', Validators.required]
    });
  }

  ngOnInit(): void {
    this.cargarOpciones();
  }

  cargarOpciones(): void {
    // Simular carga de datos
    this.isLoading = true;
    
    setTimeout(() => {
      this.tiposMovimiento = [
        { id: 'CUENTA_CUENTA', nombre: 'Entre Cuentas' },
        { id: 'CUENTA_BOLSILLO', nombre: 'A Bolsillo' },
        { id: 'BOLSILLO_CUENTA', nombre: 'De Bolsillo a Cuenta' }
      ];
      
      this.cuentas = [
        { id: '1', nombre: 'Cuenta de Ahorros 1234' },
        { id: '2', nombre: 'Cuenta Corriente 5678' }
      ];
      
      this.bolsillos = [
        { id: '3', nombre: 'Bolsillo Vacaciones' },
        { id: '4', nombre: 'Bolsillo Emergencias' }
      ];
      
      this.isLoading = false;
    }, 1000);
  }

  onTipoMovimientoChange(): void {
    const tipoMovimiento = this.transaccionForm.get('tipoMovimiento')?.value;
    const bolsilloControl = this.transaccionForm.get('bolsillo');
    
    if (tipoMovimiento === 'CUENTA_BOLSILLO') {
      bolsilloControl?.setValidators(Validators.required);
    } else {
      bolsilloControl?.clearValidators();
    }
    
    bolsilloControl?.updateValueAndValidity();
  }

  trackById(_: number, item: any): string {
    return item.id;
  }

  guardar(): void {
    if (this.transaccionForm.invalid) return;
    
    this.isLoading = true;
    
    // Simular guardado
    setTimeout(() => {
      this.dialogRef.close(this.transaccionForm.value);
    }, 1000);
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
