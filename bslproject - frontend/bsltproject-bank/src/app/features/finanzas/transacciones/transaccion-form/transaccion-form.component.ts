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
import { CuentaService } from '@core/services/finanzas/cuenta.service';
import { CatalogoService } from '@core/services/common/catalogo.service';
import { AuthService } from '@core/services/seguridad/auth.service';
import { Transaccion, TipoTransaccion, EstadoTransaccion, TransaccionRequest } from '@core/models/finanzas/transaccion.model';
import { ConfiguracionTipoTransaccion } from '@core/models/finanzas/tipo-transaccion.model';
import { Cuenta, TipoCuenta } from '@core/models/finanzas/cuenta.model';
import { catchError, of } from 'rxjs';

interface DialogData {
  tipo?: string; 
  transaccion?: Transaccion;
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
  cuentasOrigen: Cuenta[] = [];
  cuentasDestino: Cuenta[] = [];
  tiposTransaccion: ConfiguracionTipoTransaccion[] = [];
  roles: any[] = [];
  estados: any[] = [];
  tipoTransaccionId: string = '';

  readonly TipoTransaccion = TipoTransaccion;

  constructor(
    private fb: FormBuilder,
    private transaccionService: TransaccionService,
    private cuentaService: CuentaService,
    private catalogoService: CatalogoService,
    private authService: AuthService,
    private dialogRef: MatDialogRef<TransaccionFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
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

    if (data.transaccion) {
      this.transaccionForm.patchValue({
        tipo: data.transaccion.tipo,
        cuentaOrigen: data.transaccion.cuentaOrigenId,
        cuentaDestino: data.transaccion.cuentaDestinoId,
        monto: data.transaccion.monto,
        descripcion: data.transaccion.descripcion
      });
      this.tipoTransaccionId = data.transaccion.tipo || '';
    } else if (data.tipo) {
      this.tipoTransaccionId = data.tipo;
    }

    this.transaccionForm.get('tipo')?.valueChanges.subscribe(tipo => {
      if (tipo) {
        this.tipoTransaccionId = tipo;
        this.updateFormValidators();
        this.loadCuentas();
      }
    });
  }

  ngOnInit(): void {
    this.loadCatalogos();
    this.loadCuentas();
  }

  loadCatalogos(): void {
    this.loading = true;
    this.catalogoService.cargarTodosCatalogos().subscribe({
      next: () => {
        // Convertir los valores del enum TipoTransaccion a objetos ConfiguracionTipoTransaccion
        const tiposTransaccion = this.catalogoService.getTiposTransaccion();
        
        // Crear objetos ConfiguracionTipoTransaccion a partir de los valores del enum
        this.tiposTransaccion = Object.values(TipoTransaccion).map(tipoValue => ({
          id: tipoValue,
          nombre: tipoValue,
          descripcion: `Transacción de tipo ${tipoValue}`,
          requiereDestino: true, // Asumimos que todos requieren destino por defecto
          activo: true
        }));
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

  loadCuentas(): void {
    if (!this.tipoTransaccionId) return;
    
    this.loading = true;
    this.error = null;
    console.log('Iniciando carga de cuentas para tipo de transacción:', this.tipoTransaccionId);
    
    const userId = this.authService.getUserId();
    if (!userId) {
      this.error = 'No se pudo obtener el ID del usuario';
      this.loading = false;
      return;
    }
    
    console.log('Obteniendo todas las cuentas');
    // Usando el operador pipe para mejor manejo de errores y transformaciones
    this.cuentaService.obtenerTodos().pipe(
      catchError((error: any) => {
        console.error('Error al cargar las cuentas:', error);
        this.error = 'Error al cargar las cuentas. Por favor, intente nuevamente.';
        this.loading = false;
        return of([]);
      })
    ).subscribe({
      next: (cuentas: Cuenta[]) => {
        console.log('Cuentas obtenidas del servicio:', cuentas);
        
        if (cuentas.length === 0) {
          console.warn('No se encontraron cuentas disponibles');
        }
        
        if (this.needsOrigen()) {
          console.log('Mostrando todas las cuentas para origen');
          // Mostrar todas las cuentas sin filtrar
          this.cuentasOrigen = cuentas;
          console.log('Cuentas de origen disponibles:', this.cuentasOrigen);
          
          if (this.cuentasOrigen.length === 0) {
            console.warn('No hay cuentas de origen disponibles');
          }
        } else {
          this.cuentasOrigen = [];
        }

        if (this.needsDestino()) {
          console.log('Mostrando todas las cuentas para destino');
          // Mostrar todas las cuentas sin filtrar
          this.cuentasDestino = cuentas;
          console.log('Cuentas de destino disponibles:', this.cuentasDestino);
          
          if (this.cuentasDestino.length === 0) {
            console.warn('No hay cuentas de destino disponibles');
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
    return this.tipoTransaccionId === TipoTransaccion.CUENTA_CUENTA ||
           this.tipoTransaccionId === TipoTransaccion.CUENTA_BOLSILLO ||
           this.tipoTransaccionId === TipoTransaccion.BOLSILLO_CUENTA ||
           this.tipoTransaccionId === TipoTransaccion.CUENTA_BANCO;
  }

  needsDestino(): boolean {
    return this.tipoTransaccionId === TipoTransaccion.CUENTA_CUENTA ||
           this.tipoTransaccionId === TipoTransaccion.CUENTA_BOLSILLO ||
           this.tipoTransaccionId === TipoTransaccion.BOLSILLO_CUENTA ||
           this.tipoTransaccionId === TipoTransaccion.BANCO_CUENTA ||
           this.tipoTransaccionId === TipoTransaccion.BANCO_BOLSILLO;
  }

  /**
   * Verifica si un tipo de cuenta es una cuenta regular (no bolsillo)
   */
  isCuentaRegular(tipo: string): boolean {
    console.log('Verificando si el tipo de cuenta es regular:', tipo);
    const esRegular = tipo === TipoCuenta.CUENTA_CORRIENTE || tipo === TipoCuenta.CUENTA_AHORRO;
    console.log('¿Es cuenta regular?', esRegular);
    return esRegular;
  }

  getTitulo(): string {
    if (this.data.readonly) {
      return 'Detalles de Transacción';
    }
    
    if (this.data.transaccion) {
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

    const formValues = this.transaccionForm.getRawValue();
    console.log('Valores del formulario:', formValues);
    
    // Preparar datos de la transacción
    const transaccionRequest: TransaccionRequest = {
      monto: formValues.monto,
      descripcion: formValues.descripcion,
      // Usamos el valor directo del formulario para cuentaOrigen y cuentaDestino
      cuentaOrigenId: formValues.cuentaOrigen,
      cuentaDestinoId: formValues.cuentaDestino,
      // Estos campos pueden ser undefined si no aplican al tipo de transacción
      tipoMovimientoId: '1' // ID por defecto para transferencias
    };
    
    console.log('Datos de transacción a enviar:', transaccionRequest);
    
    this.loading = true;
    this.error = null;
    
    // Seleccionar el método adecuado según el tipo de transacción
    let transaccionObservable;
    
    // Si es una transacción de cuenta a cuenta (CUENTA_CUENTA)
    if (this.tipoTransaccionId === TipoTransaccion.CUENTA_CUENTA) {
      console.log('Ejecutando transferencia cuenta a cuenta');
      transaccionObservable = this.transaccionService.transferenciaCuentaCuenta(transaccionRequest);
    } 
    // Si es otro tipo de transacción, usar el método genérico
    else {
      console.log('Ejecutando creación de transacción genérica');
      transaccionObservable = this.transaccionService.crearTransaccion(transaccionRequest);
    }
    
    transaccionObservable.pipe(
      catchError((error: any) => {
        console.error('Error al procesar la transacción:', error);
        this.error = error.message || 'Error al procesar la transacción';
        this.loading = false;
        return of(null);
      })
    ).subscribe({
      next: (transaccion: Transaccion | null) => {
        if (transaccion) {
          console.log('Transacción creada exitosamente:', transaccion);
          this.loading = false;
          this.dialogRef.close(transaccion);
        }
      }
    });
  }
}
