import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { 
  CuentaService, 
  BolsilloService, 
  TipoTransaccionService, 
  TipoMovimientoService, 
  TransaccionService 
} from '../../../../core/services/finanzas';
import { 
  Cuenta, 
  Bolsillo, 
  TipoTransaccion, 
  TipoMovimiento 
} from '../../../../core/models';

interface DialogData {
  cuentaId?: string;
  bolsilloId?: string;
}

@Component({
  selector: 'app-transaccion-dialog',
  templateUrl: './transaccion-dialog.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  styles: [`
    .mat-mdc-dialog-content {
      max-height: 70vh;
      overflow-y: auto;
    }
    .loading-spinner {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100px;
    }
    mat-form-field {
      width: 100%;
    }
    .mat-mdc-form-field {
      margin-bottom: 16px;
    }
  `]
})
export class TransaccionDialogComponent implements OnInit {
  transaccionForm: FormGroup;
  cuentas: Cuenta[] = [];
  bolsillos: Bolsillo[] = [];
  tiposTransaccion: TipoTransaccion[] = [];
  tiposMovimiento: TipoMovimiento[] = [];
  isLoading = false;
  maxAmount = 0;
  
  // Códigos para los tipos de movimiento
  readonly ACCOUNT = 'ACCOUNT';
  readonly WALLET = 'WALLET';
  readonly BANK = 'BANK';
  
  // Tipo de movimiento seleccionado
  tipoMovimientoSeleccionado: TipoMovimiento | null = null;

  constructor(
    private dialogRef: MatDialogRef<TransaccionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private fb: FormBuilder,
    private cuentaService: CuentaService,
    private bolsilloService: BolsilloService,
    private tipoTransaccionService: TipoTransaccionService,
    private tipoMovimientoService: TipoMovimientoService,
    private transaccionService: TransaccionService,
    private snackBar: MatSnackBar
  ) {
    this.transaccionForm = this.fb.group({
      id_tipo_movimiento: ['', Validators.required],
      monto: ['', [Validators.required, Validators.min(0.01)]],
      descripcion: [''],
      // Campos opcionales que se mostrarán según el tipo de movimiento
      id_cuenta_origen: [data.cuentaId || ''],
      id_cuenta_destino: [''],
      id_bolsillo_origen: [data.bolsilloId || ''],
      id_bolsillo_destino: ['']
    });
  }

  ngOnInit(): void {
    this.isLoading = true;
    
    // Cargar tipos de movimiento antes que nada
    this.loadTiposMovimiento();
    
    // Inicializar el formulario
    this.initForm();
    
    // Cargar datos necesarios
    Promise.all([
      this.loadCuentas(),
      this.loadBolsillos()
    ]).then(() => {
      this.isLoading = false;
      
      // Configurar suscripciones a cambios en el formulario
      this.setupFormSubscriptions();
    }).catch(error => {
      console.error('Error al cargar datos:', error);
      this.isLoading = false;
    });
  }
  
  loadTiposMovimiento(): void {
    console.log('Cargando tipos de movimiento...');
    
    this.tipoMovimientoService.getTiposMovimiento().subscribe({
      next: (data) => {
        console.log('Tipos de movimiento cargados:', data);
        if (data && data.length > 0) {
          this.tiposMovimiento = data;
        } else {
          console.log('No se encontraron tipos de movimiento, cargando datos de prueba.');
          this.tiposMovimiento = this.getTiposMovimientoPrueba();
        }
        
        // Actualizar el tipo de movimiento seleccionado si ya hay uno en el formulario
        const idTipoMovimiento = this.transaccionForm?.get('id_tipo_movimiento')?.value;
        if (idTipoMovimiento) {
          this.actualizarTipoMovimientoSeleccionado(idTipoMovimiento);
        }
      },
      error: (error) => {
        console.error('Error al cargar tipos de movimiento:', error);
        console.log('Cargando tipos de movimiento de prueba...');
        this.tiposMovimiento = this.getTiposMovimientoPrueba();
        
        // Actualizar el tipo de movimiento seleccionado si ya hay uno en el formulario
        const idTipoMovimiento = this.transaccionForm?.get('id_tipo_movimiento')?.value;
        if (idTipoMovimiento) {
          this.actualizarTipoMovimientoSeleccionado(idTipoMovimiento);
        }
      }
    });
  }

  initForm(): void {
    // Inicializar el formulario con valores predeterminados
  }

  setupFormSubscriptions(): void {
    // Configurar suscripciones a cambios en el formulario
    this.transaccionForm.get('id_tipo_movimiento')?.valueChanges.subscribe(tipoMovimientoId => {
      if (tipoMovimientoId) {
        this.tipoMovimientoSeleccionado = this.tiposMovimiento.find(tm => tm.id === tipoMovimientoId) || null;
        console.log('Tipo de movimiento seleccionado:', this.tipoMovimientoSeleccionado);
        this.actualizarCamposRequeridos();
        this.actualizarValidadores();
      }
    });
  }

  loadCuentas(): Promise<void> {
    return new Promise((resolve) => {
      this.cuentaService.getCuentas().subscribe({
        next: (data) => {
          this.cuentas = data;
          if (this.data.cuentaId) {
            const cuentaOrigen = data.find(c => c.id === this.data.cuentaId);
            if (cuentaOrigen) {
              this.maxAmount = cuentaOrigen.saldo;
            }
          }
          resolve();
        },
        error: (error) => {
          console.error('Error al cargar cuentas:', error);
          this.mostrarError('Error al cargar las cuentas');
          resolve();
        }
      });
    });
  }

  loadBolsillos(): Promise<void> {
    return new Promise((resolve) => {
      this.bolsilloService.getBolsillos().subscribe({
        next: (data) => {
          this.bolsillos = data;
          if (this.data.bolsilloId) {
            const bolsilloOrigen = data.find(b => b.id === this.data.bolsilloId);
            if (bolsilloOrigen) {
              this.maxAmount = bolsilloOrigen.saldo;
            }
          }
          resolve();
        },
        error: (error) => {
          console.error('Error al cargar bolsillos:', error);
          this.mostrarError('Error al cargar los bolsillos');
          resolve();
        }
      });
    });
  }

  getTiposMovimientoPrueba(): TipoMovimiento[] {
    return [
      {
        id: '1',
        nombre: 'Transferencia entre cuentas',
        descripcion: 'Transferencia de dinero entre cuentas propias',
        codigoOrigen: 'ACCOUNT',
        codigoDestino: 'ACCOUNT',
        afectaSaldo: true,
        requiereDestino: true
      },
      {
        id: '2',
        nombre: 'Transferencia a bolsillo',
        descripcion: 'Transferencia de dinero desde una cuenta a un bolsillo',
        codigoOrigen: 'ACCOUNT',
        codigoDestino: 'WALLET',
        afectaSaldo: true,
        requiereDestino: true
      },
      {
        id: '3',
        nombre: 'Transferencia desde bolsillo',
        descripcion: 'Transferencia de dinero desde un bolsillo a una cuenta',
        codigoOrigen: 'WALLET',
        codigoDestino: 'ACCOUNT',
        afectaSaldo: true,
        requiereDestino: true
      },
      {
        id: '4',
        nombre: 'Depósito',
        descripcion: 'Ingreso de dinero a una cuenta',
        codigoOrigen: 'EXTERNAL',
        codigoDestino: 'ACCOUNT',
        afectaSaldo: true,
        requiereDestino: false
      },
      {
        id: '5',
        nombre: 'Retiro',
        descripcion: 'Retiro de dinero de una cuenta',
        codigoOrigen: 'ACCOUNT',
        codigoDestino: 'EXTERNAL',
        afectaSaldo: true,
        requiereDestino: false
      }
    ];
  }

  actualizarTipoMovimientoSeleccionado(tipoMovimientoId: string): void {
    this.tipoMovimientoSeleccionado = this.tiposMovimiento.find(tm => tm.id === tipoMovimientoId) || null;
    if (this.tipoMovimientoSeleccionado) {
      console.log('Tipo de movimiento seleccionado:', this.tipoMovimientoSeleccionado);
    } else {
      console.warn('No se encontró el tipo de movimiento con ID:', tipoMovimientoId);
    }
    this.actualizarCamposRequeridos();
    this.actualizarValidadores();
  }

  actualizarCamposRequeridos(): void {
    if (!this.tipoMovimientoSeleccionado) return;
    
    const origen = this.tipoMovimientoSeleccionado.codigoOrigen.toUpperCase();
    const destino = this.tipoMovimientoSeleccionado.codigoDestino.toUpperCase();
    
    // Resetear validadores
    this.transaccionForm.get('id_cuenta_origen')?.clearValidators();
    this.transaccionForm.get('id_cuenta_destino')?.clearValidators();
    this.transaccionForm.get('id_bolsillo_origen')?.clearValidators();
    this.transaccionForm.get('id_bolsillo_destino')?.clearValidators();
    
    // Aplicar validadores según el tipo de movimiento
    if (origen === this.ACCOUNT) {
      this.transaccionForm.get('id_cuenta_origen')?.setValidators([Validators.required]);
    } else if (origen === this.WALLET) {
      this.transaccionForm.get('id_bolsillo_origen')?.setValidators([Validators.required]);
    }
    
    if (destino === this.ACCOUNT && this.tipoMovimientoSeleccionado.requiereDestino) {
      this.transaccionForm.get('id_cuenta_destino')?.setValidators([Validators.required]);
    } else if (destino === this.WALLET && this.tipoMovimientoSeleccionado.requiereDestino) {
      this.transaccionForm.get('id_bolsillo_destino')?.setValidators([Validators.required]);
    }
    
    // Actualizar validadores
    this.transaccionForm.get('id_cuenta_origen')?.updateValueAndValidity();
    this.transaccionForm.get('id_cuenta_destino')?.updateValueAndValidity();
    this.transaccionForm.get('id_bolsillo_origen')?.updateValueAndValidity();
    this.transaccionForm.get('id_bolsillo_destino')?.updateValueAndValidity();
  }

  actualizarValidadores(): void {
    if (!this.tipoMovimientoSeleccionado) return;
    
    const origen = this.tipoMovimientoSeleccionado.codigoOrigen.toUpperCase();
    
    // Actualizar el validador de monto según el origen
    if (origen === this.ACCOUNT && this.transaccionForm.get('id_cuenta_origen')?.value) {
      const cuentaId = this.transaccionForm.get('id_cuenta_origen')?.value;
      const cuenta = this.cuentas.find(c => c.id === cuentaId);
      if (cuenta) {
        this.maxAmount = cuenta.saldo;
      }
    } else if (origen === this.WALLET && this.transaccionForm.get('id_bolsillo_origen')?.value) {
      const bolsilloId = this.transaccionForm.get('id_bolsillo_origen')?.value;
      const bolsillo = this.bolsillos.find(b => b.id === bolsilloId);
      if (bolsillo) {
        this.maxAmount = bolsillo.saldo;
      }
    } else if (origen === this.BANK) {
      // Para consignaciones desde el banco, no hay límite de monto
      this.maxAmount = Number.MAX_SAFE_INTEGER;
    }
    
    // Actualizar validador de monto
    if (origen !== this.BANK) {
      this.transaccionForm.get('monto')?.setValidators([
        Validators.required,
        Validators.min(0.01),
        Validators.max(this.maxAmount)
      ]);
    } else {
      this.transaccionForm.get('monto')?.setValidators([
        Validators.required,
        Validators.min(0.01)
      ]);
    }
    
    this.transaccionForm.get('monto')?.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.transaccionForm.valid && this.tipoMovimientoSeleccionado) {
      const formValue = this.transaccionForm.value;
      this.isLoading = true;
      
      const origen = this.tipoMovimientoSeleccionado.codigoOrigen.toUpperCase();
      const destino = this.tipoMovimientoSeleccionado.codigoDestino.toUpperCase();
      
      // Determinar el tipo de transacción y llamar al método correspondiente
      if (origen === this.ACCOUNT && destino === this.ACCOUNT) {
        this.realizarTransferenciaCuentaCuenta(formValue);
      } else if (origen === this.ACCOUNT && destino === this.WALLET) {
        this.realizarTransferenciaCuentaBolsillo(formValue);
      } else if (origen === this.WALLET && destino === this.ACCOUNT) {
        this.realizarRetiroBolsilloCuenta(formValue);
      } else if (origen === this.BANK && destino === this.ACCOUNT) {
        this.realizarConsignacionBancoCuenta(formValue);
      } else if (origen === this.BANK && destino === this.WALLET) {
        this.realizarConsignacionBancoBolsillo(formValue);
      } else if (origen === this.ACCOUNT && destino === this.BANK) {
        this.realizarRetiroCuentaBanco(formValue);
      } else {
        this.mostrarError('Tipo de movimiento no reconocido');
        this.isLoading = false;
      }
    }
  }

  realizarTransferenciaCuentaCuenta(formValue: any): void {
    this.transaccionService.transferenciaCuentaCuenta({
      cuentaOrigenId: formValue.id_cuenta_origen,
      cuentaDestinoId: formValue.id_cuenta_destino,
      tipoMovimientoId: formValue.id_tipo_movimiento,
      monto: formValue.monto,
      descripcion: formValue.descripcion || ''
    }).subscribe({
      next: () => {
        this.mostrarExito('Transferencia realizada exitosamente');
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Error al realizar la transferencia:', error);
        this.mostrarError(error.error?.error || 'Error al realizar la transferencia');
        this.isLoading = false;
      }
    });
  }

  realizarTransferenciaCuentaBolsillo(formValue: any): void {
    this.transaccionService.transferenciaCuentaBolsillo({
      cuentaOrigenId: formValue.id_cuenta_origen,
      bolsilloDestinoId: formValue.id_bolsillo_destino,
      tipoMovimientoId: formValue.id_tipo_movimiento,
      monto: formValue.monto,
      descripcion: formValue.descripcion || ''
    }).subscribe({
      next: () => {
        this.mostrarExito('Transferencia a bolsillo realizada exitosamente');
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Error al realizar la transferencia a bolsillo:', error);
        this.mostrarError(error.error?.error || 'Error al realizar la transferencia a bolsillo');
        this.isLoading = false;
      }
    });
  }

  realizarRetiroBolsilloCuenta(formValue: any): void {
    this.transaccionService.retiroBolsilloCuenta({
      bolsilloOrigenId: formValue.id_bolsillo_origen,
      cuentaDestinoId: formValue.id_cuenta_destino,
      tipoMovimientoId: formValue.id_tipo_movimiento,
      monto: formValue.monto,
      descripcion: formValue.descripcion || ''
    }).subscribe({
      next: () => {
        this.mostrarExito('Retiro de bolsillo realizado exitosamente');
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Error al realizar el retiro de bolsillo:', error);
        this.mostrarError(error.error?.error || 'Error al realizar el retiro de bolsillo');
        this.isLoading = false;
      }
    });
  }

  realizarConsignacionBancoCuenta(formValue: any): void {
    this.transaccionService.consignacionBancoCuenta({
      cuentaDestinoId: formValue.id_cuenta_destino,
      tipoMovimientoId: formValue.id_tipo_movimiento,
      monto: formValue.monto,
      descripcion: formValue.descripcion || ''
    }).subscribe({
      next: () => {
        this.mostrarExito('Consignación realizada exitosamente');
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Error al realizar la consignación:', error);
        this.mostrarError(error.error?.error || 'Error al realizar la consignación');
        this.isLoading = false;
      }
    });
  }

  realizarConsignacionBancoBolsillo(formValue: any): void {
    this.transaccionService.consignacionBancoBolsillo({
      bolsilloDestinoId: formValue.id_bolsillo_destino,
      tipoMovimientoId: formValue.id_tipo_movimiento,
      monto: formValue.monto,
      descripcion: formValue.descripcion || ''
    }).subscribe({
      next: () => {
        this.mostrarExito('Consignación a bolsillo realizada exitosamente');
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Error al realizar la consignación a bolsillo:', error);
        this.mostrarError(error.error?.error || 'Error al realizar la consignación a bolsillo');
        this.isLoading = false;
      }
    });
  }

  realizarRetiroCuentaBanco(formValue: any): void {
    this.transaccionService.retiroCuentaBanco({
      cuentaOrigenId: formValue.id_cuenta_origen,
      tipoMovimientoId: formValue.id_tipo_movimiento,
      monto: formValue.monto,
      descripcion: formValue.descripcion || ''
    }).subscribe({
      next: () => {
        this.mostrarExito('Retiro realizado exitosamente');
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Error al realizar el retiro:', error);
        this.mostrarError(error.error?.error || 'Error al realizar el retiro');
        this.isLoading = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  /**
   * Obtiene una descripción amigable del tipo de movimiento seleccionado
   */
  obtenerDescripcionTipoMovimiento(): string {
    if (!this.tipoMovimientoSeleccionado) return '';
    
    const origen = this.tipoMovimientoSeleccionado.codigoOrigen;
    const destino = this.tipoMovimientoSeleccionado.codigoDestino;
    
    // Mapeo específico para cada combinación de origen-destino
    if (origen === this.ACCOUNT && destino === this.ACCOUNT) {
      return 'Transferencia entre cuentas';
    } else if (origen === this.ACCOUNT && destino === this.WALLET) {
      return 'Transferencia de cuenta a bolsillo';
    } else if (origen === this.WALLET && destino === this.ACCOUNT) {
      return 'Retiro de bolsillo a cuenta';
    } else if (origen === this.BANK && destino === this.ACCOUNT) {
      return 'Consignación a cuenta';
    } else if (origen === this.BANK && destino === this.WALLET) {
      return 'Consignación a bolsillo';
    } else if (origen === this.ACCOUNT && destino === this.BANK) {
      return 'Retiro de cuenta';
    }
    
    // Si no es ninguna de las combinaciones anteriores, usar nombres genéricos
    const mapeoOrigen: Record<string, string> = {
      'ACCOUNT': 'Cuenta',
      'WALLET': 'Bolsillo',
      'BANK': 'Banco'
    };
    
    const mapeoDestino: Record<string, string> = {
      'ACCOUNT': 'Cuenta',
      'WALLET': 'Bolsillo',
      'BANK': 'Banco'
    };
    
    // Obtener nombres amigables o usar los códigos originales si no hay mapeo
    const origenAmigable = mapeoOrigen[origen] || origen;
    const destinoAmigable = mapeoDestino[destino] || destino;
    
    return `Transferencia de ${origenAmigable} a ${destinoAmigable}`;
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
}
