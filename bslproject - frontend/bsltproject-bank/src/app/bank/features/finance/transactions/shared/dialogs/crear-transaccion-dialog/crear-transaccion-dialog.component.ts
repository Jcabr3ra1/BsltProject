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
import { v4 as uuidv4 } from 'uuid';
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
import { AuthService } from '../../../../../../../core/services/auth.service';

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
    private authService: AuthService,
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
      numero_cuenta_origen: [''], // Inicializar con string vacío en lugar de null
      numero_cuenta_destino: [''], // Inicializar con string vacío en lugar de null
      nombre_bolsillo_origen: [''], // Inicializar con string vacío en lugar de null
      nombre_bolsillo_destino: [''], // Inicializar con string vacío en lugar de null
      monto: [null, [Validators.required, Validators.min(1)]],
      descripcion: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
        ],
      ],
    });

    // Configurar clases para el diálogo
    this.dialogRef.addPanelClass(['custom-dialog', 'custom-dark-dialog']);
    const usuario = this.authService.getUser();
    const usuarioId = usuario?.id;

    if (usuarioId && usuario?.rol && usuario.rol.toUpperCase() !== 'ADMIN') {
      const cuentasUsuario = this.data.cuentas.filter(c => c.usuario_id === usuarioId);
      const idsCuentasUsuario = cuentasUsuario.map(c => c.id || c._id);
    
      this.data.bolsillos = this.data.bolsillos.filter(
        (b) => idsCuentasUsuario.includes(b.id_cuenta) || b.usuario_id === usuarioId
      );
    }
    

    // Depuración: Imprimir información de cuentas disponibles
    console.log('Cuentas disponibles:', this.data.cuentas);
    console.log('Usuario actual ID:', usuarioId);
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
      this.form.get('numero_cuenta_origen')?.setValue('');
      this.form.get('numero_cuenta_destino')?.setValue('');
      this.form.get('nombre_bolsillo_origen')?.setValue('');
      this.form.get('nombre_bolsillo_destino')?.setValue('');

      // Agregar validadores dinámicamente dependiendo del tipo de movimiento
      this.actualizarValidadores();

      // Limpiar errores previos
      this.mensajeError = null;
    }
  }

  // Método para actualizar validadores según el tipo de movimiento seleccionado
  actualizarValidadores(): void {
    const tipo = this.tipoMovimientoSeleccionado;
    if (!tipo) return;

    const origen = tipo.codigo_origen.toUpperCase();
    const destino = tipo.codigo_destino.toUpperCase();

    // Resetear todos los validadores primero
    this.form.get('numero_cuenta_origen')?.clearValidators();
    this.form.get('numero_cuenta_destino')?.clearValidators();
    this.form.get('nombre_bolsillo_origen')?.clearValidators();
    this.form.get('nombre_bolsillo_destino')?.clearValidators();

    // Aplicar validadores según el tipo de movimiento
    if (origen === 'ACCOUNT') {
      this.form
        .get('numero_cuenta_origen')
        ?.setValidators([Validators.required]);
    }
    if (destino === 'ACCOUNT') {
      this.form
        .get('numero_cuenta_destino')
        ?.setValidators([Validators.required]);
    }
    if (origen === 'WALLET') {
      this.form
        .get('nombre_bolsillo_origen')
        ?.setValidators([Validators.required]);
    }
    if (destino === 'WALLET') {
      this.form
        .get('nombre_bolsillo_destino')
        ?.setValidators([Validators.required]);
    }

    // Actualizar el estado de los controles
    this.form.get('numero_cuenta_origen')?.updateValueAndValidity();
    this.form.get('numero_cuenta_destino')?.updateValueAndValidity();
    this.form.get('nombre_bolsillo_origen')?.updateValueAndValidity();
    this.form.get('nombre_bolsillo_destino')?.updateValueAndValidity();
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
  // Ejecutar la transacción según el tipo de movimiento
  ejecutarTransaccion(data: any): void {
    this.isLoading = true;
    this.mensajeError = null;

    const tipo = this.tipoMovimientoSeleccionado;
    console.log('🧭 Tipo de movimiento seleccionado:', tipo);

    if (!tipo) {
      this.isLoading = false;
      this.mensajeError = 'Tipo de movimiento no seleccionado';
      return;
    }

    const origen = tipo.codigo_origen.toUpperCase();
    const destino = tipo.codigo_destino.toUpperCase();

    // Ya no se vuelve a preparar la transacción
    console.log(`📤 Enviando transacción UUID: ${data.uuid_transaccion}`, data);

    // Determinar qué método del servicio llamar según el origen y destino
    let peticion;

    if (origen === 'ACCOUNT' && destino === 'ACCOUNT') {
      peticion = this.transaccionService.transferenciaCuentaCuenta(data);
    } else if (origen === 'ACCOUNT' && destino === 'WALLET') {
      peticion = this.transaccionService.transferenciaCuentaBolsillo(data);
    } else if (origen === 'WALLET' && destino === 'ACCOUNT') {
      peticion = this.transaccionService.transferenciaBolsilloCuenta(data);
    } else if (origen === 'WALLET' && destino === 'WALLET') {
      peticion = this.transaccionService.transferenciaBolsilloBolsillo(data);
    } else if (origen === 'BANK' && destino === 'ACCOUNT') {
      peticion = this.transaccionService.consignacionBancoCuenta(data);
    } else if (origen === 'BANK' && destino === 'WALLET') {
      peticion = this.transaccionService.consignacionBancoBolsillo(data);
    } else if (origen === 'ACCOUNT' && destino === 'BANK') {
      peticion = this.transaccionService.retiroCuentaBanco(data);
    } else if (origen === 'WALLET' && destino === 'BANK') {
      peticion = this.transaccionService.retiroBolsilloBanco(data);
    } else {
      this.isLoading = false;
      this.mensajeError = `Combinación de origen (${origen}) y destino (${destino}) no soportada`;
      this.mostrarNotificacion(this.mensajeError, 'error');
      return;
    }

    peticion.subscribe({
      next: (respuesta) => {
        this.isLoading = false;
        this.mostrarNotificacion('Transacción realizada con éxito', 'success');
        this.dialogRef.close(respuesta); // ✅ Devuelve la transacción creada
      },
      error: (error) => {
        console.error('Error al procesar la transacción:', error);
        this.isLoading = false;

        const mensajeError =
          error.error?.mensaje ||
          error.error?.message ||
          'Error al procesar la transacción. Por favor, inténtalo de nuevo.';

        this.mensajeError = mensajeError;
        this.mostrarNotificacion(mensajeError, 'error');
      },
    });
  }

  // Preparar los datos según el formato esperado por la API
  prepararDatosTransaccion(
    formData: any,
    origen: string,
    destino: string
  ): any {
    const resultado: any = {
      uuid_transaccion: selfCryptoUUID(),
      id_tipo_movimiento: formData.id_tipo_movimiento,
      id_tipo_transaccion: formData.id_tipo_transaccion,
      monto: formData.monto,
      descripcion: formData.descripcion,
    };

    const usuarioId = this.authService.getUser()?.id?.trim();
    const cuentas = this.data.cuentas || [];
    const bolsillos = this.data.bolsillos || [];

    // Cuenta origen
    if (origen === 'ACCOUNT') {
      const numeroBuscado = String(formData.numero_cuenta_origen).trim();
      const usuarioId = this.authService.getUser()?.id?.trim();

      console.group('🔎 Validando cuenta origen');
      console.log('🧾 Número buscado:', numeroBuscado);
      console.log('👤 Usuario actual:', usuarioId);
      console.log(
        '📋 Cuentas disponibles:',
        cuentas.map((c) => ({
          numero: c.numero_cuenta,
          usuario_id: c.usuario_id,
          id: c.id || c._id,
        }))
      );
      console.groupEnd();

      const cuenta = cuentas.find(
        (c) =>
          String(c.numero_cuenta).trim() === numeroBuscado &&
          String(c.usuario_id).trim() === usuarioId
      );

      if (!cuenta) {
        throw new Error(
          `⚠️ Cuenta de origen (${numeroBuscado}) no encontrada o no te pertenece`
        );
      }

      resultado.id_cuenta_origen = cuenta.id || cuenta._id;
    }

    // Cuenta destino
    if (destino === 'ACCOUNT') {
      const numeroBuscado = String(formData.numero_cuenta_destino).trim();
      const cuenta = cuentas.find(
        (c) => String(c.numero_cuenta).trim() === numeroBuscado
      );

      if (!cuenta) {
        throw new Error(
          `⚠️ Cuenta de destino (${numeroBuscado}) no encontrada`
        );
      }

      resultado.id_cuenta_destino = cuenta.id || cuenta._id;
    }

    // Bolsillo origen
    if (origen === 'WALLET') {
      const nombreBuscado = String(formData.nombre_bolsillo_origen)
        .trim()
        .toLowerCase();
      const bolsillo = bolsillos.find(
        (b) =>
          b.nombre.trim().toLowerCase() === nombreBuscado &&
          String(b.usuario_id).trim() === usuarioId
      );

      if (!bolsillo) {
        throw new Error(
          `⚠️ Bolsillo de origen (${nombreBuscado}) no encontrado o no te pertenece`
        );
      }

      resultado.id_bolsillo_origen = bolsillo.id || bolsillo._id;
    }

    // Bolsillo destino
    if (destino === 'WALLET') {
      const nombreBuscado = String(formData.nombre_bolsillo_destino)
        .trim()
        .toLowerCase();
      const bolsillo = bolsillos.find(
        (b) => b.nombre.trim().toLowerCase() === nombreBuscado
      );

      if (!bolsillo) {
        throw new Error(
          `⚠️ Bolsillo de destino (${nombreBuscado}) no encontrado`
        );
      }

      resultado.id_bolsillo_destino = bolsillo.id || bolsillo._id;
    }

    return resultado;
  }

  // Mostrar notificación con SnackBar
  mostrarNotificacion(
    mensaje: string,
    tipo: 'success' | 'error' = 'success'
  ): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 5000,
      panelClass:
        tipo === 'success' ? ['snackbar-success'] : ['snackbar-error'],
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }

  // Guardar la transacción
  guardar(): void {
    if (this.form.invalid) {
      Object.keys(this.form.controls).forEach((key) => {
        this.form.get(key)?.markAsTouched();
      });

      this.mostrarNotificacion(
        'Por favor completa todos los campos requeridos',
        'error'
      );
      return;
    }

    const tipo = this.tipoMovimientoSeleccionado;
    if (!tipo || !tipo.codigo_origen || !tipo.codigo_destino) {
      this.mostrarNotificacion(
        'Selecciona un tipo de movimiento válido',
        'error'
      );
      return;
    }

    const origen = tipo.codigo_origen.toUpperCase();
    const destino = tipo.codigo_destino.toUpperCase();

    // Validaciones de campos según origen/destino
    if (origen === 'ACCOUNT' && !this.form.value.numero_cuenta_origen) {
      this.form.get('numero_cuenta_origen')?.setErrors({ required: true });
      this.form.get('numero_cuenta_origen')?.markAsTouched();
      this.mostrarNotificacion(
        'Ingresa el número de la cuenta origen',
        'error'
      );
      return;
    }

    if (destino === 'ACCOUNT' && !this.form.value.numero_cuenta_destino) {
      this.form.get('numero_cuenta_destino')?.setErrors({ required: true });
      this.form.get('numero_cuenta_destino')?.markAsTouched();
      this.mostrarNotificacion(
        'Ingresa el número de la cuenta destino',
        'error'
      );
      return;
    }

    if (origen === 'WALLET' && !this.form.value.nombre_bolsillo_origen) {
      this.form.get('nombre_bolsillo_origen')?.setErrors({ required: true });
      this.form.get('nombre_bolsillo_origen')?.markAsTouched();
      this.mostrarNotificacion(
        'Ingresa el nombre del bolsillo origen',
        'error'
      );
      return;
    }

    if (destino === 'WALLET' && !this.form.value.nombre_bolsillo_destino) {
      this.form.get('nombre_bolsillo_destino')?.setErrors({ required: true });
      this.form.get('nombre_bolsillo_destino')?.markAsTouched();
      this.mostrarNotificacion(
        'Ingresa el nombre del bolsillo destino',
        'error'
      );
      return;
    }

    // Validación de saldo
    if (origen === 'ACCOUNT') {
      const numeroCuentaOrigen = this.form.value.numero_cuenta_origen
        ?.toString()
        .trim();
      const cuentaOrigen = this.data.cuentas.find(
        (c) => c.numero_cuenta?.toString().trim() === numeroCuentaOrigen
      );

      if (cuentaOrigen && cuentaOrigen.saldo < this.form.value.monto) {
        const mensaje = `Saldo insuficiente. Disponible: ${cuentaOrigen.saldo}, solicitado: ${this.form.value.monto}`;
        this.form.get('monto')?.setErrors({ saldoInsuficiente: true });
        this.mostrarNotificacion(mensaje, 'error');
        return;
      }
    }

    // Construir el objeto limpio desde el formulario
    const datosFormulario = {
      ...this.form.value,
      numero_cuenta_origen: this.form.value.numero_cuenta_origen
        ?.toString()
        .trim(),
      numero_cuenta_destino: this.form.value.numero_cuenta_destino
        ?.toString()
        .trim(),
      nombre_bolsillo_origen: this.form.value.nombre_bolsillo_origen
        ?.toString()
        .trim(),
      nombre_bolsillo_destino: this.form.value.nombre_bolsillo_destino
        ?.toString()
        .trim(),
    };

    console.log('📤 Datos del formulario a enviar:', datosFormulario);

    try {
      const tipo = this.tipoMovimientoSeleccionado;
      const origen = tipo.codigo_origen!.toUpperCase();
      const destino = tipo.codigo_destino!.toUpperCase();

      const datosTransaccion = this.prepararDatosTransaccion(
        datosFormulario,
        origen,
        destino
      );

      // 🔍 Log para verificar qué se está enviando exactamente al backend
      console.log('📦 Payload que se envía al backend:', datosTransaccion);

      // Envío real
      this.ejecutarTransaccion(datosTransaccion);
    } catch (error: any) {
      this.mensajeError = error.message || 'Error al preparar la transacción';
      this.mostrarNotificacion(
        this.mensajeError ?? 'Error desconocido',
        'error'
      );
    }
  }

  // Cancelar y cerrar el diálogo
  cancelar(): void {
    this.dialogRef.close();
  }
}

function selfCryptoUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
