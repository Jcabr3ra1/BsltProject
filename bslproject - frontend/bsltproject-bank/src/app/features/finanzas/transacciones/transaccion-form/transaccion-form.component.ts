import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { TransaccionService } from '@core/services/finanzas/transaccion.service';
import { Transaction, TransactionType } from '@core/models/finanzas/transaccion.model';
import { TipoTransaccion } from '@core/models/finanzas/tipo-transaccion.model';
import { Account, AccountType } from '@core/models/finanzas/cuenta.model';
import { CatalogoService } from '@core/services/common/catalogo.service';

interface DialogData {
  tipo?: string; 
  transaction?: Transaction;
  readonly?: boolean;
}

@Component({
  selector: 'app-transaccion-form',
  templateUrl: './transaccion-form.component.html',
  styleUrls: ['./transaccion-form.component.scss'],
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
    MatProgressSpinnerModule
  ]
})
export class TransaccionFormComponent implements OnInit {
  transaccionForm: FormGroup;
  loading = false;
  error: string | null = null;
  cuentasOrigen: Account[] = [];
  cuentasDestino: Account[] = [];
  tiposTransaccion: TipoTransaccion[] = [];
  roles: any[] = [];
  estados: any[] = [];
  tipoTransaccionId: string = '';

  readonly TransactionType = TransactionType;

  constructor(
    private fb: FormBuilder,
    private transaccionService: TransaccionService,
    private catalogoService: CatalogoService,
    private dialogRef: MatDialogRef<TransaccionFormComponent>,
    @Inject(MAT_DIALOG_DATA) private data: DialogData
  ) {
    this.transaccionForm = this.fb.group({
      tipo: [data.tipo || '', Validators.required],
      cuentaOrigen: ['', Validators.required],
      cuentaDestino: ['', Validators.required],
      monto: ['', [Validators.required, Validators.min(1000)]],
      descripcion: ['', [Validators.required, Validators.maxLength(200)]]
    });

    if (data.readonly) {
      this.transaccionForm.disable();
    }

    if (data.transaction) {
      this.transaccionForm.patchValue(data.transaction);
      this.tipoTransaccionId = data.transaction.tipo ?? '';
    } else if (data.tipo) {
      this.tipoTransaccionId = data.tipo;
    }

    this.transaccionForm.get('tipo')?.valueChanges.subscribe(tipo => {
      this.tipoTransaccionId = tipo;
      this.updateFormValidators();
      this.loadAccounts();
    });
  }

  ngOnInit(): void {
    this.loadCatalogos();
    this.loadAccounts();
  }

  loadCatalogos(): void {
    this.loading = true;
    this.catalogoService.cargarTodosCatalogos().subscribe({
      next: () => {
        // Obtener tipos de transacción
        this.tiposTransaccion = this.catalogoService.getTiposTransaccion();
        console.log('Tipos de transacción cargados:', this.tiposTransaccion);
        
        // Obtener roles
        this.roles = this.catalogoService.getRoles();
        console.log('Roles cargados:', this.roles);
        
        // Obtener estados
        this.estados = this.catalogoService.getEstados();
        console.log('Estados cargados:', this.estados);
        
        this.loading = false;
      },
      error: (error: any) => {
        this.error = 'Error al cargar catálogos: ' + error.message;
        console.error('Error al cargar catálogos:', error);
        this.loading = false;
      }
    });
  }

  updateFormValidators(): void {
    const cuentaOrigenControl = this.transaccionForm.get('cuentaOrigen');
    const cuentaDestinoControl = this.transaccionForm.get('cuentaDestino');

    if (cuentaOrigenControl && cuentaDestinoControl) {
      cuentaOrigenControl.clearValidators();
      cuentaDestinoControl.clearValidators();

      if (this.needsOrigen()) {
        cuentaOrigenControl.setValidators(Validators.required);
      }

      if (this.needsDestino()) {
        cuentaDestinoControl.setValidators(Validators.required);
      }

      cuentaOrigenControl.updateValueAndValidity();
      cuentaDestinoControl.updateValueAndValidity();
    }
  }

  loadAccounts(): void {
    if (!this.tipoTransaccionId) return;
    
    this.loading = true;
    this.error = null;
    console.log('Iniciando carga de cuentas para tipo de transacción:', this.tipoTransaccionId);
    
    this.transaccionService.getAccounts().subscribe({
      next: (accounts: Account[]) => {
        console.log('Cuentas obtenidas del servicio:', accounts);
        
        if (accounts.length === 0) {
          console.warn('No se encontraron cuentas disponibles');
        }
        
        if (this.needsOrigen()) {
          this.cuentasOrigen = accounts.filter(account => 
            this.tipoTransaccionId === TransactionType.CUENTA_BOLSILLO ? 
            account.tipo === AccountType.BOLSILLO : 
            this.isCuentaRegular(account.tipo)
          );
          console.log('Cuentas de origen filtradas:', this.cuentasOrigen);
          
          if (this.cuentasOrigen.length === 0) {
            console.warn('No hay cuentas de origen disponibles para el tipo de transacción seleccionado');
          }
        } else {
          this.cuentasOrigen = [];
        }

        if (this.needsDestino()) {
          this.cuentasDestino = accounts.filter(account => 
            this.tipoTransaccionId === TransactionType.CUENTA_BOLSILLO ? 
            account.tipo === AccountType.BOLSILLO : 
            this.isCuentaRegular(account.tipo)
          );
          console.log('Cuentas de destino filtradas:', this.cuentasDestino);
          
          if (this.cuentasDestino.length === 0) {
            console.warn('No hay cuentas de destino disponibles para el tipo de transacción seleccionado');
          }
        } else {
          this.cuentasDestino = [];
        }

        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error al cargar las cuentas:', error);
        this.error = 'Error al cargar las cuentas. Por favor, intente nuevamente.';
        this.loading = false;
        this.cuentasOrigen = [];
        this.cuentasDestino = [];
      }
    });
  }

  needsOrigen(): boolean {
    return this.tipoTransaccionId === TransactionType.CUENTA_CUENTA ||
           this.tipoTransaccionId === TransactionType.CUENTA_BOLSILLO ||
           this.tipoTransaccionId === TransactionType.BOLSILLO_CUENTA ||
           this.tipoTransaccionId === TransactionType.CUENTA_BANCO;
  }

  needsDestino(): boolean {
    return this.tipoTransaccionId === TransactionType.CUENTA_CUENTA ||
           this.tipoTransaccionId === TransactionType.CUENTA_BOLSILLO ||
           this.tipoTransaccionId === TransactionType.BOLSILLO_CUENTA ||
           this.tipoTransaccionId === TransactionType.BANCO_CUENTA ||
           this.tipoTransaccionId === TransactionType.BANCO_BOLSILLO;
  }

  /**
   * Verifica si un tipo de cuenta es una cuenta regular (no bolsillo)
   */
  isCuentaRegular(tipo: string): boolean {
    return tipo === AccountType.CUENTA_CORRIENTE || tipo === AccountType.CUENTA_AHORRO;
  }

  getTitulo(): string {
    if (this.data.readonly) {
      return 'Detalles de Transacción';
    }
    
    if (this.data.transaction) {
      return 'Editar Transacción';
    }

    const tipoNombre = this.catalogoService.getNombreTipoTransaccion(this.tipoTransaccionId);
    return `Nueva Transacción: ${tipoNombre}`;
  }

  getErrorMessage(field: string): string {
    const control = this.transaccionForm.get(field);
    if (!control) return '';
    
    if (control.hasError('required')) {
      return 'Este campo es obligatorio';
    }
    if (control.hasError('min')) {
      return `El valor mínimo es ${control.errors?.['min'].min}`;
    }
    if (control.hasError('maxlength')) {
      return `Máximo ${control.errors?.['maxlength'].requiredLength} caracteres`;
    }
    return 'Campo inválido';
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.transaccionForm.invalid) {
      this.transaccionForm.markAllAsTouched();
      return;
    }

    const transaccionData = this.transaccionForm.value;
    
    this.loading = true;
    
    if (this.data.transaction) {
      // Como no hay método updateTransaction, usamos createTransaction
      // En un caso real, deberíamos implementar updateTransaction en el servicio
      this.transaccionService.createTransaction({
        ...transaccionData,
        id: this.data.transaction.id
      } as Transaction).subscribe({
        next: (transaction: Transaction) => {
          this.dialogRef.close(transaction);
        },
        error: (error: any) => {
          this.error = error.message;
          this.loading = false;
        }
      });
    } else {
      this.transaccionService.createTransaction(transaccionData as Transaction).subscribe({
        next: (transaction: Transaction) => {
          this.dialogRef.close(transaction);
        },
        error: (error: any) => {
          this.error = error.message;
          this.loading = false;
        }
      });
    }
  }
}
