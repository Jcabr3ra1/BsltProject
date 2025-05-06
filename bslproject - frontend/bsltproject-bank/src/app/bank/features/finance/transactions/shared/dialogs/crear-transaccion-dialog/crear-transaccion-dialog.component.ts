import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Cuenta } from '../../../../../../../core/models/cuenta.model';
import { Bolsillo } from '../../../../../../../core/models/bolsillo.model';
import { TipoMovimiento } from '../../../../../../../core/models/movement-type.model';
import { TipoTransaccion } from '../../../../../../../core/models/tipo_transaccion.model';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TransaccionService } from '../../../services/transaccion.service';

@Component({
  standalone: true,
  selector: 'app-crear-transaccion-dialog',
  templateUrl: './crear-transaccion-dialog.component.html',
  styleUrls: ['./crear-transaccion-dialog.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule,
    MatSnackBarModule,
  ],
})
export class CrearTransaccionDialogComponent {
  form: FormGroup;
  isLoading = false;
  mensajeError: string | null = null;

  constructor(
    private dialogRef: MatDialogRef<CrearTransaccionDialogComponent>,
    private fb: FormBuilder,
    private transaccionService: TransaccionService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      cuentas: Cuenta[];
      bolsillos: Bolsillo[];
      tiposMovimiento: TipoMovimiento[];
      tiposTransaccion: TipoTransaccion[];
    }
  ) {
    this.form = this.fb.group({
      id_tipo_movimiento: [null, Validators.required],
      id_tipo_transaccion: [null, Validators.required],
      id_cuenta_origen: [null],
      id_cuenta_destino: [null],
      id_bolsillo_origen: [null],
      id_bolsillo_destino: [null],
      monto: [null, [Validators.required, Validators.min(1)]],
      descripcion: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    });
    
    // Configurar clases para el diálogo
    this.dialogRef.addPanelClass(['custom-dialog', 'custom-dark-dialog']);
  }

  get tipoMovimientoSeleccionado(): TipoMovimiento | undefined {
    return this.data.tiposMovimiento.find(
      (t) =>
        t.id === this.form.value.id_tipo_movimiento ||
        t._id === this.form.value.id_tipo_movimiento
    );
  }

  // Método para seleccionar tipo de transacción
  seleccionarTipoTransaccion(id: string | undefined): void {
    if (id) {
      this.form.get('id_tipo_transaccion')?.setValue(id);
      this.form.get('id_tipo_transaccion')?.markAsDirty();
      // Limpiar errores previos
      this.mensajeError = null;
    }
  }

  // Método para seleccionar tipo de movimiento
  seleccionarTipoMovimiento(id: string | undefined): void {
    if (id) {
      this.form.get('id_tipo_movimiento')?.setValue(id);
      this.form.get('id_tipo_movimiento')?.markAsDirty();
      
      // Restablecer campos relacionados cuando cambia el tipo de movimiento
      this.form.get('id_cuenta_origen')?.setValue(null);
      this.form.get('id_cuenta_destino')?.setValue(null);
      this.form.get('id_bolsillo_origen')?.setValue(null);
      this.form.get('id_bolsillo_destino')?.setValue(null);
      
      // Limpiar errores previos
      this.mensajeError = null;
    }
  }

  // Método para obtener ícono de movimiento basado en el tipo
  obtenerIconoMovimiento(tipo: TipoMovimiento): string {
    const origen = tipo.codigo_origen.toUpperCase();
    const destino = tipo.codigo_destino.toUpperCase();

    if (origen === 'ACCOUNT' && destino === 'ACCOUNT') return '↔';
    if (origen === 'ACCOUNT' && destino === 'WALLET') return '→';
    if (origen === 'BANK' && destino === 'WALLET') return '↓';
    if (origen === 'BANK' && destino === 'ACCOUNT') return '↓';
    if (origen === 'WALLET' && destino === 'ACCOUNT') return '←';
    if (origen === 'ACCOUNT' && destino === 'BANK') return '↑';
    if (origen === 'WALLET' && destino === 'BANK') return '↑';
    if (origen === 'WALLET' && destino === 'WALLET') return '↔';
    return '→';
  }

  // Obtener descripción corta del tipo de movimiento
  obtenerDescripcionCorta(tipo: TipoMovimiento): string {
    const origen = tipo.codigo_origen.toUpperCase();
    const destino = tipo.codigo_destino.toUpperCase();
  
    if (origen === 'ACCOUNT' && destino === 'ACCOUNT') 
      return 'Transferir dinero entre cuentas';
    if (origen === 'ACCOUNT' && destino === 'WALLET')
      return 'Mover dinero de mi cuenta a un bolsillo';
    if (origen === 'BANK' && destino === 'WALLET') 
      return 'Consignar dinero desde banco externo a mi bolsillo';
    if (origen === 'BANK' && destino === 'ACCOUNT') 
      return 'Consignar dinero desde banco externo a mi cuenta';
    if (origen === 'WALLET' && destino === 'ACCOUNT')
      return 'Devolver dinero de un bolsillo a mi cuenta';
    if (origen === 'ACCOUNT' && destino === 'BANK') 
      return 'Retirar dinero de mi cuenta a banco externo';
    if (origen === 'WALLET' && destino === 'BANK') 
      return 'Retirar dinero de mi bolsillo a banco externo';
    if (origen === 'WALLET' && destino === 'WALLET') 
      return 'Transferir fondos entre mis bolsillos';
    return `${origen} → ${destino}`;
  }

  // Determina si mostrar un campo específico basado en el tipo de movimiento
  mostrarCampo(campo: string): boolean {
    const tipo = this.tipoMovimientoSeleccionado;
    if (!tipo) return false;

    const origen = tipo.codigo_origen.toUpperCase();
    const destino = tipo.codigo_destino.toUpperCase();

    if (campo === 'cuenta_origen') return origen === 'ACCOUNT';
    if (campo === 'cuenta_destino') return destino === 'ACCOUNT';
    if (campo === 'bolsillo_origen') return origen === 'WALLET';
    if (campo === 'bolsillo_destino') return destino === 'WALLET';

    return false;
  }

  // Ejecutar la transacción según el tipo de movimiento
  ejecutarTransaccion(data: any): void {
    this.isLoading = true;
    this.mensajeError = null;
    
    const tipo = this.tipoMovimientoSeleccionado;
    if (!tipo) {
      this.isLoading = false;
      this.mensajeError = "Tipo de movimiento no seleccionado";
      return;
    }
    
    const origen = tipo.codigo_origen.toUpperCase();
    const destino = tipo.codigo_destino.toUpperCase();
    
    // Preparar los datos en el formato esperado por la API
    const datosTransaccion = this.prepararDatosTransaccion(data, origen, destino);
    
    // Ejecutar la transacción correspondiente según el tipo de movimiento
    let transaccion$;
    
    if (origen === 'ACCOUNT' && destino === 'ACCOUNT') {
      transaccion$ = this.transaccionService.transferenciaCuentaCuenta(datosTransaccion);
    } else if (origen === 'ACCOUNT' && destino === 'WALLET') {
      transaccion$ = this.transaccionService.transferenciaCuentaBolsillo(datosTransaccion);
    } else if (origen === 'WALLET' && destino === 'ACCOUNT') {
      transaccion$ = this.transaccionService.transferenciaBolsilloCuenta(datosTransaccion);
    } else if (origen === 'BANK' && destino === 'ACCOUNT') {
      transaccion$ = this.transaccionService.consignacionBancoCuenta(datosTransaccion);
    } else if (origen === 'BANK' && destino === 'WALLET') {
      transaccion$ = this.transaccionService.consignacionBancoBolsillo(datosTransaccion);
    } else if (origen === 'ACCOUNT' && destino === 'BANK') {
      transaccion$ = this.transaccionService.retiroCuentaBanco(datosTransaccion);
    } else if (origen === 'WALLET' && destino === 'BANK') {
      transaccion$ = this.transaccionService.retiroBolsilloBanco(datosTransaccion);
    } else if (origen === 'WALLET' && destino === 'WALLET') {
      transaccion$ = this.transaccionService.transferenciaBolsilloBolsillo(datosTransaccion);
    } else {
      this.isLoading = false;
      this.mensajeError = "Tipo de movimiento no soportado";
      return;
    }
    
    // Suscribirse a la respuesta
    transaccion$.subscribe({
      next: (resultado) => {
        this.isLoading = false;
        this.mostrarNotificacion('Transacción realizada con éxito', 'success');
        this.dialogRef.close(resultado);
      },
      error: (error) => {
        this.isLoading = false;
        
        // Verificar si es un error de saldo insuficiente u otro error del servidor
        if (error.error && error.error.detail) {
          this.mensajeError = error.error.detail;
        } else if (error.message) {
          this.mensajeError = error.message;
        } else {
          this.mensajeError = 'Ha ocurrido un error al procesar la transacción';
        }
        
        console.error('Error en transacción:', error);
      }
    });
  }
  
  // Preparar los datos según el formato esperado por la API
  prepararDatosTransaccion(formData: any, origen: string, destino: string): any {
    const resultado: any = {
      tipoMovimientoId: formData.id_tipo_movimiento,
      tipoTransaccionId: formData.id_tipo_transaccion,
      monto: formData.monto,
      descripcion: formData.descripcion
    };
  
    // Añadir IDs de cuentas y bolsillos según corresponda
    if (origen === 'ACCOUNT') {
      resultado.cuentaOrigenId = formData.id_cuenta_origen;
    }
  
    if (destino === 'ACCOUNT') {
      resultado.cuentaDestinoId = formData.id_cuenta_destino;
    }
  
    if (origen === 'WALLET') {
      resultado.bolsilloOrigenId = formData.id_bolsillo_origen;
    }
  
    if (destino === 'WALLET') {
      resultado.bolsilloDestinoId = formData.id_bolsillo_destino;
    }
  
    // Log final antes de enviar al backend
    console.log('📤 Payload final enviado al backend:', resultado);
  
    return resultado;
  }
  

  // Mostrar notificación con SnackBar
  mostrarNotificacion(mensaje: string, tipo: 'success' | 'error' = 'success'): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 5000,
      panelClass: tipo === 'success' ? ['snackbar-success'] : ['snackbar-error'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  // Guardar la transacción
  guardar(): void {
    if (this.form.invalid) {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
      return;
    }
  
    const tipo = this.tipoMovimientoSeleccionado;
    if (!tipo) return;
  
    const origen = tipo.codigo_origen.toUpperCase();
    const destino = tipo.codigo_destino.toUpperCase();
  
    // Validar campos específicos según el tipo de movimiento
    if (origen === 'ACCOUNT' && !this.form.value.id_cuenta_origen) {
      this.form.get('id_cuenta_origen')?.setErrors({ required: true });
      this.form.get('id_cuenta_origen')?.markAsTouched();
      return;
    }
  
    if (destino === 'ACCOUNT' && !this.form.value.id_cuenta_destino) {
      this.form.get('id_cuenta_destino')?.setErrors({ required: true });
      this.form.get('id_cuenta_destino')?.markAsTouched();
      return;
    }
  
    if (origen === 'WALLET' && !this.form.value.id_bolsillo_origen) {
      this.form.get('id_bolsillo_origen')?.setErrors({ required: true });
      this.form.get('id_bolsillo_origen')?.markAsTouched();
      return;
    }
  
    if (destino === 'WALLET' && !this.form.value.id_bolsillo_destino) {
      this.form.get('id_bolsillo_destino')?.setErrors({ required: true });
      this.form.get('id_bolsillo_destino')?.markAsTouched();
      return;
    }
  
    // Logs para depuración
    console.log('🧪 Monto ingresado en el formulario:', this.form.value.monto);
    console.log('🧪 Formulario completo antes de enviar:', this.form.value);
  
    // Ejecutar la transacción con los datos del formulario
    this.ejecutarTransaccion(this.form.value);
  }
  

  // Cancelar y cerrar el diálogo
  cancelar(): void {
    this.dialogRef.close();
  }
}