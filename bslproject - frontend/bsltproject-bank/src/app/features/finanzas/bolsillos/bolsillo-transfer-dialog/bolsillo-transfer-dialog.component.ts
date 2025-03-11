import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BolsilloService } from '../../../../core/services/finanzas';
import { Bolsillo } from '../../../../core/models/bolsillo.model';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-bolsillo-transfer-dialog',
  templateUrl: './bolsillo-transfer-dialog.component.html',
  styleUrls: ['./bolsillo-transfer-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule
  ]
})
export class BolsilloTransferDialogComponent implements OnInit {
  transferForm: FormGroup;
  bolsillos: Bolsillo[] = [];
  bolsilloOrigen!: Bolsillo;
  isLoading = false;
  maxAmount: number = 0;

  constructor(
    private dialogRef: MatDialogRef<BolsilloTransferDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { bolsillo: Bolsillo },
    private formBuilder: FormBuilder,
    private bolsilloService: BolsilloService,
    private snackBar: MatSnackBar
  ) {
    this.bolsilloOrigen = data.bolsillo;
    this.maxAmount = this.bolsilloOrigen.saldo;
    this.transferForm = this.formBuilder.group({
      bolsilloDestinoId: ['', Validators.required],
      monto: ['', [Validators.required, Validators.min(0.01), Validators.max(this.maxAmount)]]
    });
  }

  ngOnInit(): void {
    this.cargarBolsillos();
  }

  get montoControl() {
    return this.transferForm.get('monto');
  }

  cargarBolsillos(): void {
    this.isLoading = true;
    this.bolsilloService.getBolsillos().subscribe({
      next: (bolsillos) => {
        this.bolsillos = bolsillos.filter(b => b.id !== this.bolsilloOrigen.id);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar bolsillos:', error);
        this.mostrarError('Error al cargar los bolsillos');
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.transferForm.valid) {
      const { bolsilloDestinoId, monto } = this.transferForm.value;
      this.isLoading = true;
      
      if (!bolsilloDestinoId || !monto) {
        this.mostrarError('Por favor complete todos los campos');
        this.isLoading = false;
        return;
      }
      
      // Al llegar aquí, sabemos que bolsilloDestinoId no es null ni undefined
      const destinoId: string = bolsilloDestinoId.toString();
      
      // Asegurarse de que bolsilloOrigen.id no sea undefined
      if (!this.bolsilloOrigen || !this.bolsilloOrigen.id) {
        this.mostrarError('Error: Bolsillo de origen no válido');
        this.isLoading = false;
        return;
      }
      
      const origenId: string = this.bolsilloOrigen.id.toString();
      
      this.bolsilloService.transferirEntreBolsillos(
        origenId,
        destinoId,
        monto
      ).subscribe({
        next: () => {
          this.mostrarExito('Transferencia realizada con éxito');
          this.dialogRef.close(true);
        },
        error: (error: any) => {
          console.error('Error en la transferencia:', error);
          this.mostrarError('Error al realizar la transferencia');
          this.isLoading = false;
        }
      });
    }
  }

  private mostrarExito(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private mostrarError(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
