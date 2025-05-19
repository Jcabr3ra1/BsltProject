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
  pasoActivo: number = 1;

  // Propiedades para control de permisos
  esAdmin: boolean = false;
  rolUsuario: string = '';
  tiposTransaccionFiltrados: any[] = [];
  tiposMovimientoFiltrados: any[] = [];
  
  // Propiedades para categorización
  transaccionesPorCategoria: {[key: string]: any[]} = {
    'TRANSFERENCIAS': [],
    'CONSIGNACIONES': [],
    'RETIROS': []
  };
  
  // Orden de categorías
  ordenCategorias: string[] = ['TRANSFERENCIAS', 'CONSIGNACIONES', 'RETIROS'];
  
  // Propiedades para categorización de movimientos
  movimientosPorCategoria: {[key: string]: any[]} = {
    'TRANSFERENCIAS': [],
    'CONSIGNACIONES': [],
    'RETIROS': []
  };
  
  // Orden de categorías de movimientos
  ordenCategoriasMovimiento: string[] = ['TRANSFERENCIAS', 'CONSIGNACIONES', 'RETIROS'];
  
  // Propiedades para tooltip personalizado
  tooltipVisible: boolean = false;
  tooltipText: string = '';
  tooltipX: number = 0;
  tooltipY: number = 0;

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
    

    // Inicializar formulario y verificar permisos
    this.inicializarFormulario();
    this.verificarPermisos();
    this.filtrarOpcionesPorRol();

    // Logs para depuración
    console.log('Tipos de transacción disponibles:', this.data.tiposTransaccion);
    console.log('Tipos de movimiento disponibles:', this.data.tiposMovimiento);
    console.log('Tipos de transacción filtrados:', this.tiposTransaccionFiltrados);
    console.log('Tipos de movimiento filtrados:', this.tiposMovimientoFiltrados);
    console.log('Rol del usuario:', this.rolUsuario);
    console.log('¿Es admin?:', this.esAdmin);
  }

  // Verificar permisos del usuario actual
  verificarPermisos(): void {
    const usuario = this.authService.getUser();
    this.esAdmin = usuario?.roles?.includes('ADMIN') || false;
    
    // Determinar el rol principal del usuario
    if (usuario?.roles?.includes('ADMIN')) {
      this.rolUsuario = 'ADMIN';
    } else if (usuario?.roles?.includes('MODERATOR')) {
      this.rolUsuario = 'MODERATOR';
    } else {
      this.rolUsuario = 'USER';
    }
    
    console.log('Roles del usuario:', usuario?.roles);
    console.log('Rol principal asignado:', this.rolUsuario);
  }

  // Filtrar opciones según el rol del usuario
  filtrarOpcionesPorRol(): void {
    // Clonar los arrays originales
    const tiposTransaccion = [...this.data.tiposTransaccion];
    const tiposMovimiento = [...this.data.tiposMovimiento];
    
    // Ordenar las opciones para una mejor organización
    this.ordenarOpcionesPorCategoria(tiposTransaccion, tiposMovimiento);
    
    // Para el paso 1, todos los roles ven las mismas opciones (Transferencias, Depósitos, Retiros)
    this.tiposTransaccionFiltrados = tiposTransaccion;
    
    // Para el paso 2 y 3, filtrar según el rol
    if (this.rolUsuario === 'ADMIN' || this.rolUsuario === 'MODERATOR') {
      // Los administradores y moderadores pueden ver todas las opciones excepto retiros
      this.tiposMovimientoFiltrados = tiposMovimiento.filter(tipo => {
        const origen = tipo.codigo_origen?.toUpperCase();
        const destino = tipo.codigo_destino?.toUpperCase();
        // Excluir retiros
        if ((origen === 'ACCOUNT' && destino === 'BANK') ||
            (origen === 'WALLET' && destino === 'BANK')) {
          return false;
        }
        return true;
      });
    } else {
      // Usuarios normales solo pueden hacer operaciones con sus propias cuentas y bolsillos
      // Filtrar movimientos para usuarios normales (excluir operaciones administrativas y retiros)
      this.tiposMovimientoFiltrados = tiposMovimiento.filter(tipo => {
        const origen = tipo.codigo_origen?.toUpperCase();
        const destino = tipo.codigo_destino?.toUpperCase();
        // Excluir completamente operaciones con banco externo para usuarios normales
        if (tipo.codigo_origen === 'BANK' || tipo.codigo_destino === 'BANK') {
          return false; // No mostrar ninguna operación con banco externo
        }
        // Excluir retiros
        if ((origen === 'ACCOUNT' && destino === 'BANK') ||
            (origen === 'WALLET' && destino === 'BANK')) {
          return false;
        }
        return true;
      });
    }
    
    // Categorizar las transacciones filtradas
    this.categorizarTransacciones();
    
    // Categorizar los movimientos filtrados
    this.categorizarMovimientos();
  }
  
  // Categorizar los movimientos en grupos lógicos
  categorizarMovimientos(): void {
    // Reiniciar categorías con los nombres correctos
    this.movimientosPorCategoria = {
      'TRANSFERENCIAS': [],
      'CONSIGNACIONES': [],
      'RETIROS': []
    };
    
    // Mantener el orden de categorías consistente
    this.ordenCategoriasMovimiento = ['TRANSFERENCIAS', 'CONSIGNACIONES', 'RETIROS'];
    
    // Clasificar cada movimiento en su categoría
    this.tiposMovimientoFiltrados.forEach(tipo => {
      const descripcion = tipo.descripcion.toLowerCase();
      const origen = tipo.codigo_origen?.toUpperCase() || '';
      const destino = tipo.codigo_destino?.toUpperCase() || '';
      
      // TRANSFERENCIAS
      if (origen === 'ACCOUNT' && destino === 'ACCOUNT') {
        // Transferencia cuenta a cuenta
        this.movimientosPorCategoria['TRANSFERENCIAS'].push({
          ...tipo,
          tipo_operacion: 'transferenciasCuentaCuenta'
        });
      } 
      else if (origen === 'ACCOUNT' && destino === 'WALLET') {
        // Transferencia cuenta a bolsillo
        this.movimientosPorCategoria['TRANSFERENCIAS'].push({
          ...tipo,
          tipo_operacion: 'transferenciasCuentaBolsillo'
        });
      }
      else if (origen === 'WALLET' && destino === 'WALLET') {
        // Transferencia bolsillo a bolsillo
        this.movimientosPorCategoria['TRANSFERENCIAS'].push({
          ...tipo,
          tipo_operacion: 'transferenciasBolsilloBolsillo'
        });
      }
      // CONSIGNACIONES
      else if (origen === 'BANK' && destino === 'ACCOUNT') {
        // Consignación banco a cuenta
        this.movimientosPorCategoria['CONSIGNACIONES'].push({
          ...tipo,
          tipo_operacion: 'consignacionBancoCuenta'
        });
      }
      else if (origen === 'BANK' && destino === 'WALLET') {
        // Consignación banco a bolsillo
        this.movimientosPorCategoria['CONSIGNACIONES'].push({
          ...tipo,
          tipo_operacion: 'consignacionBancoBolsillo'
        });
      }
      // RETIROS
      else if (origen === 'ACCOUNT' && destino === 'BANK') {
        // Retiro cuenta a banco
        this.movimientosPorCategoria['RETIROS'].push({
          ...tipo,
          tipo_operacion: 'retiroCuentaBanco'
        });
      }
      else if (origen === 'WALLET' && destino === 'ACCOUNT') {
        // Transferencia bolsillo a cuenta (no es un retiro)
        this.movimientosPorCategoria['TRANSFERENCIAS'].push({
          ...tipo,
          tipo_operacion: 'transferenciasBolsilloCuenta'
        });
      }
      else if (origen === 'WALLET' && destino === 'BANK') {
        // Retiro bolsillo a banco
        this.movimientosPorCategoria['RETIROS'].push({
          ...tipo,
          tipo_operacion: 'retiroBolsilloBanco'
        });
      }
      else {
        // Otros casos no contemplados
        console.warn('Tipo de movimiento no categorizado:', tipo);
      }
    });

    // Ordenar dentro de cada categoría para una mejor experiencia
    Object.keys(this.movimientosPorCategoria).forEach(categoria => {
      this.movimientosPorCategoria[categoria].sort((a, b) => {
        return a.descripcion.localeCompare(b.descripcion);
      });
    });
  }  

  // Categorizar las transacciones en grupos lógicos
  categorizarTransacciones(): void {
    // Reiniciar categorías
    this.transaccionesPorCategoria = {
      'TRANSFERENCIAS': [],
      'CONSIGNACIONES': [],
      'RETIROS': []
    };

    // Categorizar según descripción o propiedades
    this.tiposTransaccionFiltrados.forEach(tipo => {
      const descripcion = tipo.descripcion.toLowerCase();
      
      if (descripcion.includes('transferencia') || 
          descripcion.includes('cuenta_cuenta') || 
          descripcion.includes('cuenta_bolsillo') || 
          descripcion.includes('bolsillo_bolsillo')) {
        this.transaccionesPorCategoria['TRANSFERENCIAS'].push(tipo);
      } else if (descripcion.includes('consignacion') || 
                descripcion.includes('consignación') || 
                descripcion.includes('banco_cuenta') || 
                descripcion.includes('banco_bolsillo')) {
        this.transaccionesPorCategoria['CONSIGNACIONES'].push(tipo);
      } else if (descripcion.includes('retiro') || 
                descripcion.includes('cuenta_banco') || 
                descripcion.includes('bolsillo_cuenta') || 
                descripcion.includes('bolsillo_banco')) {
        this.transaccionesPorCategoria['RETIROS'].push(tipo);
      } else {
        // Intentar categorizar por códigos de origen y destino
        const origen = tipo.codigo_origen?.toUpperCase();
        const destino = tipo.codigo_destino?.toUpperCase();
        
        if ((origen === 'ACCOUNT' && destino === 'ACCOUNT') ||
            (origen === 'ACCOUNT' && destino === 'WALLET') ||
            (origen === 'WALLET' && destino === 'WALLET')) {
          this.transaccionesPorCategoria['TRANSFERENCIAS'].push(tipo);
        } else if ((origen === 'BANK' && destino === 'ACCOUNT') ||
                  (origen === 'BANK' && destino === 'WALLET')) {
          this.transaccionesPorCategoria['CONSIGNACIONES'].push(tipo);
        } else if ((origen === 'ACCOUNT' && destino === 'BANK') ||
                  (origen === 'WALLET' && destino === 'ACCOUNT') ||
                  (origen === 'WALLET' && destino === 'BANK')) {
          this.transaccionesPorCategoria['RETIROS'].push(tipo);
        } else {
          console.warn('Tipo de transacción no categorizado:', tipo);
        }
      }
    });

    // Ordenar dentro de cada categoría
    for (const categoria of Object.keys(this.transaccionesPorCategoria)) {
      this.transaccionesPorCategoria[categoria].sort((a, b) => {
        return a.descripcion.localeCompare(b.descripcion);
      });
    }
    
    console.log('Transacciones categorizadas:', this.transaccionesPorCategoria);
  }
  
  // Ordenar las opciones por categoría para una mejor experiencia de usuario
  ordenarOpcionesPorCategoria(tiposTransaccion: any[], tiposMovimiento: any[]): void {
    // Definir el orden de prioridad para las transacciones
    const ordenTransacciones: {[key: string]: number} = {
      'transferencia': 1,
      'mover': 2,
      'consignación': 3,
      'consignacion': 3,
      'retiro': 4
    };
    
    // Ordenar tipos de transacción
    tiposTransaccion.sort((a, b) => {
      const descA = a.descripcion.toLowerCase();
      const descB = b.descripcion.toLowerCase();
      
      // Encontrar la prioridad para cada descripción
      let prioridadA = 999;
      let prioridadB = 999;
      
      for (const [clave, valor] of Object.entries(ordenTransacciones)) {
        if (descA.includes(clave)) prioridadA = valor;
        if (descB.includes(clave)) prioridadB = valor;
      }
      
      return prioridadA - prioridadB;
    });
    
    // Definir el orden de prioridad para los movimientos
    const ordenMovimientos: {[key: string]: number} = {
      'cuenta': 1,
      'bolsillo': 2,
      'banco': 3
    };
    
    // Ordenar tipos de movimiento
    tiposMovimiento.sort((a, b) => {
      const descA = a.descripcion.toLowerCase();
      const descB = b.descripcion.toLowerCase();
      
      // Encontrar la prioridad para cada descripción
      let prioridadA = 999;
      let prioridadB = 999;
      
      for (const [clave, valor] of Object.entries(ordenMovimientos)) {
        if (descA.includes(clave)) prioridadA = valor;
        if (descB.includes(clave)) prioridadB = valor;
      }
      
      return prioridadA - prioridadB;
    });
  }

  // Inicializar formulario
  inicializarFormulario(): void {
    // No hay nada que inicializar en este caso
  }

  get tipoMovimientoSeleccionado(): TipoMovimiento | undefined {
    return this.data.tiposMovimiento.find(
      (t) =>
        t.id === this.form.value.id_tipo_movimiento ||
        t._id === this.form.value.id_tipo_movimiento
    );
  }

  // Método para seleccionar tipo de transacción
  seleccionarTipoTransaccion(id: string): void {
    // Eliminar todos los tooltips antes de continuar
    this.eliminarTodosLosTooltips();
    
    this.form.get('id_tipo_transaccion')?.setValue(id);
    
    // Filtrar los tipos de movimiento según el tipo de transacción seleccionado
    this.filtrarMovimientosPorTransaccion(id);
    
    setTimeout(() => {
      this.pasoActivo = 2;
    }, 300);
  }
  
  // Filtrar los tipos de movimiento según el tipo de transacción seleccionado
  filtrarMovimientosPorTransaccion(idTipoTransaccion: string): void {
    // Obtener el tipo de transacción seleccionado
    const tipoTransaccionSeleccionado = this.data.tiposTransaccion.find(
      tipo => (tipo.id || tipo._id) === idTipoTransaccion
    );
    
    if (!tipoTransaccionSeleccionado) return;
    
    // Determinar la categoría de la transacción seleccionada
    const descripcion = tipoTransaccionSeleccionado.descripcion.toLowerCase();
    
    // Clonar los tipos de movimiento originales
    const tiposMovimiento = [...this.data.tiposMovimiento];
    
    // Filtrar según la categoría de transacción
    if (descripcion.includes('transferencia') || descripcion.includes('mover') || descripcion.includes('trasladar')) {
      // Para transferencias, mostrar solo movimientos entre cuentas y bolsillos
      this.tiposMovimientoFiltrados = tiposMovimiento.filter(tipo => {
        if (!tipo.codigo_origen || !tipo.codigo_destino) return false;
        
        const origen = tipo.codigo_origen.toUpperCase();
        const destino = tipo.codigo_destino.toUpperCase();
        
        // Incluir solo transferencias entre cuentas y bolsillos
        // Excluimos explícitamente los retiros (transferencias a banco externo)
        if (destino === 'BANK') {
          return false; // No incluir retiros en las transferencias
        }
        
        return (origen === 'ACCOUNT' && destino === 'ACCOUNT') || 
               (origen === 'ACCOUNT' && destino === 'WALLET') || 
               (origen === 'WALLET' && destino === 'WALLET');
      });
    } else if (descripcion.includes('consignación') || descripcion.includes('consignacion') || 
               descripcion.includes('depósito') || descripcion.includes('deposito')) {
      // Para depósitos, mostrar solo consignaciones desde banco externo
      this.tiposMovimientoFiltrados = tiposMovimiento.filter(tipo => {
        if (!tipo.codigo_origen || !tipo.codigo_destino) return false;
        
        const origen = tipo.codigo_origen.toUpperCase();
        const destino = tipo.codigo_destino.toUpperCase();
        
        // Incluir solo consignaciones desde banco externo
        return origen === 'BANK' && (destino === 'ACCOUNT' || destino === 'WALLET');
      });
    } else if (descripcion.includes('retiro') || descripcion.includes('extraer')) {
      // Para retiros, mostrar solo retiros hacia banco externo
      this.tiposMovimientoFiltrados = tiposMovimiento.filter(tipo => {
        if (!tipo.codigo_origen || !tipo.codigo_destino) return false;
        
        const origen = tipo.codigo_origen.toUpperCase();
        const destino = tipo.codigo_destino.toUpperCase();
        
        // Incluir solo retiros hacia banco externo
        return destino === 'BANK' && (origen === 'ACCOUNT' || origen === 'WALLET');
      });
    }
    
    // Aplicar el filtro por rol para asegurar que los usuarios normales no vean operaciones con banco
    if (this.rolUsuario !== 'ADMIN' && this.rolUsuario !== 'MODERATOR') {
      this.tiposMovimientoFiltrados = this.tiposMovimientoFiltrados.filter(tipo => {
        return tipo.codigo_origen !== 'BANK' && tipo.codigo_destino !== 'BANK';
      });
    }
    
    // Categorizar los movimientos filtrados
    this.categorizarMovimientos();
  }
  
  // El método regresarPasoAnterior ya existe en el componente
  
  // Método para obtener la descripción del tipo de transacción seleccionado
  obtenerTipoTransaccion(): string {
    const idTipoTransaccion = this.form.get('id_tipo_transaccion')?.value;
    const tipoTransaccionSeleccionado = this.data.tiposTransaccion.find(tipo => tipo.id === idTipoTransaccion);
    return tipoTransaccionSeleccionado?.descripcion?.toLowerCase() || '';
  }
  
  // Ya existe una implementación de este método más abajo en el archivo
  
  // Ya existe una implementación de este método más abajo en el archivo

  // Este método ha sido reemplazado por obtenerIconoMovimiento
  // que proporciona tanto el icono como el tipo (color) según la transacción

  // Método para seleccionar tipo de movimiento
  seleccionarTipoMovimiento(id: string | undefined): void {
    if (id) {
      // Eliminar todos los tooltips antes de continuar
      this.eliminarTodosLosTooltips();
      
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
      
      // Avanzar automáticamente al paso 3
      setTimeout(() => {
        this.pasoActivo = 3;
      }, 300); // Pequeño retraso para mostrar la selección antes de avanzar
    }
  }
  
  // Método para regresar al paso anterior
  regresarPasoAnterior(): void {
    if (this.pasoActivo > 1) {
      // Si estamos en el paso 3, limpiamos los campos relacionados con este paso
      if (this.pasoActivo === 3) {
        this.form.get('id_tipo_movimiento')?.setValue('');
        this.form.get('numero_cuenta_origen')?.setValue('');
        this.form.get('numero_cuenta_destino')?.setValue('');
        this.form.get('nombre_bolsillo_origen')?.setValue('');
        this.form.get('nombre_bolsillo_destino')?.setValue('');
      }
      
      // Retroceder al paso anterior
      this.pasoActivo--;
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
  obtenerIconoMovimiento(tipo: TipoMovimiento): { icon: string; type: string } {
    const origen = tipo.codigo_origen?.toUpperCase() || '';
    const destino = tipo.codigo_destino?.toUpperCase() || '';
    const tipoOperacion = tipo.tipo_operacion || '';
    
    // Primero verificamos el tipo_operacion para determinar el icono y color
    
    // TRANSFERENCIAS (todos los iconos azules)
    if (tipoOperacion.startsWith('transferencias')) {
      // Transferencias entre cuentas
      if (tipoOperacion === 'transferenciasCuentaCuenta') {
        return { icon: 'account_balance', type: 'transfer' }; // azul
      }
      
      // Cuenta a bolsillo
      if (tipoOperacion === 'transferenciasCuentaBolsillo') {
        return { icon: 'savings', type: 'transfer' }; // azul
      }
      
      // Transferencia entre bolsillos
      if (tipoOperacion === 'transferenciasBolsilloBolsillo') {
        return { icon: 'wallet', type: 'transfer' }; // azul
      }
      
      // Valor por defecto para transferencias
      return { icon: 'account_balance', type: 'transfer' }; // azul
    }
    
    // CONSIGNACIONES (todos los iconos verdes)
    else if (tipoOperacion.startsWith('consignacion')) {
      // Consignación banco a bolsillo
      if (tipoOperacion === 'consignacionBancoBolsillo') {
        return { icon: 'account_balance_wallet', type: 'deposit' }; // verde
      }
      
      // Consignación banco a cuenta
      if (tipoOperacion === 'consignacionBancoCuenta') {
        return { icon: 'payments', type: 'deposit' }; // verde
      }
      
      // Valor por defecto para consignaciones
      return { icon: 'payments', type: 'deposit' }; // verde
    }
    
    // RETIROS (todos los iconos rojos)
    else if (tipoOperacion.startsWith('retiro')) {
      // Retiro cuenta a banco
      if (tipoOperacion === 'retiroCuentaBanco') {
        return { icon: 'monetization_on', type: 'withdraw' }; // rojo
      }
      
      // Retiro bolsillo a banco
      if (tipoOperacion === 'retiroBolsilloBanco') {
        return { icon: 'money_off', type: 'withdraw' }; // rojo
      }
      
      // Retiro bolsillo a cuenta
      if (tipoOperacion === 'retiroBolsilloCuenta') {
        return { icon: 'move_to_inbox', type: 'withdraw' }; // rojo
      }
      
      // Valor por defecto para retiros
      return { icon: 'monetization_on', type: 'withdraw' }; // rojo
    }
    
    // Si no se encuentra en ninguna categoría, usar el sistema por defecto basado en origen/destino
    // basado en el origen y destino
    
    // Transferencias entre cuentas
    if (origen === 'ACCOUNT' && destino === 'ACCOUNT') {
      return { icon: 'account_balance', type: 'transfer' };
    }
    
    // Cuenta a bolsillo
    if (origen === 'ACCOUNT' && destino === 'WALLET') {
      return { icon: 'savings', type: 'transfer' };
    }
    
    // Consignación banco a bolsillo
    if (origen === 'BANK' && destino === 'WALLET') {
      return { icon: 'account_balance_wallet', type: 'deposit' };
    }
    
    // Consignación banco a cuenta
    if (origen === 'BANK' && destino === 'ACCOUNT') {
      return { icon: 'payments', type: 'deposit' };
    }
    
    // Bolsillo a cuenta
    if (origen === 'WALLET' && destino === 'ACCOUNT') {
      return { icon: 'move_to_inbox', type: 'transfer' };
    }
    
    // Retiro cuenta a banco
    if (origen === 'ACCOUNT' && destino === 'BANK') {
      return { icon: 'monetization_on', type: 'withdraw' };
    }
    
    // Retiro bolsillo a banco
    if (origen === 'WALLET' && destino === 'BANK') {
      return { icon: 'money_off', type: 'withdraw' };
    }
    
    // Transferencia entre bolsillos
    if (origen === 'WALLET' && destino === 'WALLET') {
      return { icon: 'wallet', type: 'transfer' };
    }
    
    // Icono por defecto
    return { icon: 'account_balance', type: 'default' };
  }

  // Obtener descripción corta del tipo de movimiento
  obtenerDescripcionCorta(tipo: TipoMovimiento): string {
    if (!tipo || !tipo.codigo_origen || !tipo.codigo_destino) {
      return tipo?.descripcion || 'Opción';
    }
    
    const origen = tipo.codigo_origen.toUpperCase();
    const destino = tipo.codigo_destino.toUpperCase();

    if (origen === 'ACCOUNT' && destino === 'ACCOUNT')
      return 'Transferencia entre cuentas';
    if (origen === 'ACCOUNT' && destino === 'WALLET')
      return 'Cuenta → Bolsillo';
    if (origen === 'BANK' && destino === 'WALLET')
      return 'Consignar a bolsillo';
    if (origen === 'BANK' && destino === 'ACCOUNT')
      return 'Consignar a cuenta';
    if (origen === 'WALLET' && destino === 'ACCOUNT')
      return 'Bolsillo → Cuenta';
    if (origen === 'ACCOUNT' && destino === 'BANK')
      return 'Retirar de cuenta';
    if (origen === 'WALLET' && destino === 'BANK')
      return 'Retirar de bolsillo';
    if (origen === 'WALLET' && destino === 'WALLET')
      return 'Entre bolsillos';
    return `${origen} → ${destino}`;
  }
  
  // Método para eliminar todos los tooltips
  eliminarTodosLosTooltips(): void {
    const tooltips = document.querySelectorAll('.custom-tooltip-overlay');
    tooltips.forEach(tooltip => {
      (tooltip as HTMLElement).style.opacity = '0';
      setTimeout(() => {
        if (document.body.contains(tooltip)) {
          document.body.removeChild(tooltip);
        }
      }, 200);
    });
  }
  
  // Métodos para mostrar información al pasar el mouse
  mostrarInfoTooltip(event: MouseEvent, texto: string): void {
    // Creamos el tooltip con estilos aplicados directamente
    const tooltip = document.createElement('div');
    tooltip.className = 'custom-tooltip-overlay';
    tooltip.textContent = texto;
    tooltip.setAttribute('data-tooltip-id', Date.now().toString());
    
    // Aplicamos estilos directamente al elemento para asegurar que se vean
    Object.assign(tooltip.style, {
      position: 'fixed',
      left: `${event.clientX + 15}px`,
      top: `${event.clientY + 15}px`,
      zIndex: '10000',
      backgroundColor: 'rgba(44, 22, 88, 0.95)',
      color: '#ffffff',
      fontSize: '14px',
      padding: '8px 12px',
      borderRadius: '8px',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
      maxWidth: '250px',
      textAlign: 'center',
      margin: '5px',
      border: '1px solid rgba(138, 43, 226, 0.5)',
      pointerEvents: 'none',
      opacity: '0',
      transition: 'opacity 0.2s ease-in-out'
    });
    
    document.body.appendChild(tooltip);
    
    // Hacemos visible el tooltip después de añadirlo al DOM
    setTimeout(() => {
      tooltip.style.opacity = '1';
    }, 10);
    
    // Eliminamos el tooltip cuando el mouse sale del elemento
    const button = event.currentTarget as HTMLElement;
    const removeTooltip = () => {
      tooltip.style.opacity = '0';
      setTimeout(() => {
        if (document.body.contains(tooltip)) {
          document.body.removeChild(tooltip);
        }
      }, 200);
      button.removeEventListener('mouseleave', removeTooltip);
      button.removeEventListener('click', this.eliminarTodosLosTooltips);
    };
    
    button.addEventListener('mouseleave', removeTooltip);
    button.addEventListener('click', this.eliminarTodosLosTooltips.bind(this));
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
      // Transformar datos para cuenta-cuenta
      // Usar los nombres de campo que espera el API Gateway
      const transformedData = {
        id_cuenta_origen: data.id_cuenta_origen,
        id_cuenta_destino: data.id_cuenta_destino,
        id_tipo_movimiento: data.id_tipo_movimiento,
        id_tipo_transaccion: data.id_tipo_transaccion,
        monto: data.monto,
        descripcion: data.descripcion || 'Transferencia entre cuentas',
        uuid_transaccion: data.uuid_transaccion
      };
      
      // Logs detallados para depuración
      console.group('🔍 Depuración de transferencia cuenta-cuenta');
      console.log('📤 Datos originales:', data);
      console.log('📦 Datos transformados:', transformedData);
      console.groupEnd();
      peticion = this.transaccionService.transferenciaCuentaCuenta(transformedData);
    } else if (origen === 'ACCOUNT' && destino === 'WALLET') {
      // Usar los nombres de campo que espera el API Gateway
      const transformedData = {
        id_cuenta_origen: data.id_cuenta_origen,
        id_bolsillo_destino: data.id_bolsillo_destino,
        id_tipo_movimiento: data.id_tipo_movimiento,
        id_tipo_transaccion: data.id_tipo_transaccion,
        monto: data.monto,
        descripcion: data.descripcion || 'Transferencia de cuenta a bolsillo',
        uuid_transaccion: data.uuid_transaccion
      };
      
      // Logs detallados para depuración
      console.group('🔍 Depuración de transferencia cuenta-bolsillo');
      console.log('📤 Datos originales:', data);
      console.log('📦 Datos transformados:', transformedData);
      console.groupEnd();
      peticion = this.transaccionService.transferenciaCuentaBolsillo(transformedData);
    } else if (origen === 'WALLET' && destino === 'ACCOUNT') {
      // Usar los nombres de campo que espera el API Gateway
      const transformedData = {
        id_bolsillo_origen: data.id_bolsillo_origen,
        id_cuenta_destino: data.id_cuenta_destino,
        id_tipo_movimiento: data.id_tipo_movimiento,
        id_tipo_transaccion: data.id_tipo_transaccion,
        monto: data.monto,
        descripcion: data.descripcion || 'Retiro de bolsillo a cuenta',
        uuid_transaccion: data.uuid_transaccion
      };
      
      // Logs detallados para depuración
      console.group('🔍 Depuración de transferencia bolsillo-cuenta');
      console.log('📤 Datos originales:', data);
      console.log('📦 Datos transformados:', transformedData);
      console.log('🔑 ID Bolsillo origen:', data.id_bolsillo_origen);
      console.log('🔑 ID Cuenta destino:', data.id_cuenta_destino);
      console.log('💰 Monto:', data.monto);
      console.log('🏷️ Tipo movimiento:', data.id_tipo_movimiento);
      console.groupEnd();
      peticion = this.transaccionService.retiroBolsilloCuenta(transformedData);
    } else if (origen === 'WALLET' && destino === 'WALLET') {
      // Usar los nombres de campo que espera el API Gateway
      const transformedData = {
        id_bolsillo_origen: data.id_bolsillo_origen,
        id_bolsillo_destino: data.id_bolsillo_destino,
        id_tipo_movimiento: data.id_tipo_movimiento,
        id_tipo_transaccion: data.id_tipo_transaccion,
        monto: data.monto,
        descripcion: data.descripcion || 'Transferencia entre bolsillos',
        uuid_transaccion: data.uuid_transaccion
      };
      
      // Logs detallados para depuración
      console.group('🔍 Depuración de transferencia bolsillo-bolsillo');
      console.log('📤 Datos originales:', data);
      console.log('📦 Datos transformados:', transformedData);
      console.groupEnd();
      peticion = this.transaccionService.transferenciaBolsilloBolsillo(transformedData);
    } else if (origen === 'BANK' && destino === 'ACCOUNT') {
      // Usar los nombres de campo que espera el API Gateway
      const transformedData = {
        id_cuenta_destino: data.id_cuenta_destino,
        id_tipo_movimiento: data.id_tipo_movimiento,
        id_tipo_transaccion: data.id_tipo_transaccion,
        monto: data.monto,
        descripcion: data.descripcion || 'Consignación de banco a cuenta',
        uuid_transaccion: data.uuid_transaccion
      };
      
      // Logs detallados para depuración
      console.group('🔍 Depuración de consignación banco-cuenta');
      console.log('📤 Datos originales:', data);
      console.log('📦 Datos transformados:', transformedData);
      console.log('🔑 ID Cuenta destino:', data.id_cuenta_destino);
      console.log('💰 Monto:', data.monto);
      console.log('🏷️ Tipo movimiento:', data.id_tipo_movimiento);
      console.groupEnd();
      
      peticion = this.transaccionService.consignacionBancoCuenta(transformedData);
    } else if (origen === 'BANK' && destino === 'WALLET') {
      // Usar los nombres de campo que espera el API Gateway
      const transformedData = {
        id_bolsillo_destino: data.id_bolsillo_destino,
        id_tipo_movimiento: data.id_tipo_movimiento,
        id_tipo_transaccion: data.id_tipo_transaccion,
        monto: data.monto,
        descripcion: data.descripcion || 'Consignación de banco a bolsillo',
        uuid_transaccion: data.uuid_transaccion
      };
      
      // Logs detallados para depuración
      console.group('🔍 Depuración de consignación banco-bolsillo');
      console.log('📤 Datos originales:', data);
      console.log('📦 Datos transformados:', transformedData);
      console.log('🔑 ID Bolsillo destino:', data.id_bolsillo_destino);
      console.log('💰 Monto:', data.monto);
      console.log('🏷️ Tipo movimiento:', data.id_tipo_movimiento);
      console.groupEnd();
      
      peticion = this.transaccionService.consignacionBancoBolsillo(transformedData);
    } else if (origen === 'ACCOUNT' && destino === 'BANK') {
      // Usar los nombres de campo que espera el API Gateway
      const transformedData = {
        id_cuenta_origen: data.id_cuenta_origen,
        id_tipo_movimiento: data.id_tipo_movimiento,
        id_tipo_transaccion: data.id_tipo_transaccion,
        monto: data.monto,
        descripcion: data.descripcion || 'Retiro de cuenta a banco',
        uuid_transaccion: data.uuid_transaccion
      };
      
      // Logs detallados para depuración
      console.group('🔍 Depuración de retiro cuenta-banco');
      console.log('📤 Datos originales:', data);
      console.log('📦 Datos transformados:', transformedData);
      console.groupEnd();
      peticion = this.transaccionService.retiroCuentaBanco(transformedData);
    } else if (origen === 'WALLET' && destino === 'BANK') {
      // Usar los nombres de campo que espera el API Gateway
      const transformedData = {
        id_bolsillo_origen: data.id_bolsillo_origen,
        id_tipo_movimiento: data.id_tipo_movimiento,
        id_tipo_transaccion: data.id_tipo_transaccion,
        monto: data.monto,
        descripcion: data.descripcion || 'Retiro de bolsillo a banco',
        uuid_transaccion: data.uuid_transaccion
      };
      
      // Logs detallados para depuración
      console.group('🔍 Depuración de retiro bolsillo-banco');
      console.log('📤 Datos originales:', data);
      console.log('📦 Datos transformados:', transformedData);
      console.log('🔑 ID Bolsillo origen:', data.id_bolsillo_origen);
      console.log('💰 Monto:', data.monto);
      console.groupEnd();
      peticion = this.transaccionService.retiroBolsilloBanco(transformedData);
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
    // Datos comunes para todos los tipos de transacciones
    const resultado: any = {
      uuid_transaccion: this.selfCryptoUUID(),
      id_tipo_movimiento: formData.id_tipo_movimiento,
      id_tipo_transaccion: formData.id_tipo_transaccion,
      monto: formData.monto,
      descripcion: formData.descripcion,
    };
    
    // Si es una transferencia de bolsillo a cuenta, transformamos los datos
    // para que coincidan con lo que espera el backend
    if (origen === 'WALLET' && destino === 'ACCOUNT') {
      // Estos campos se transformarán más adelante a los nombres que espera el backend
      resultado.bolsilloOrigenId = null; // Se asignará después
      resultado.cuentaDestinoId = null; // Se asignará después
      resultado.tipoMovimientoId = formData.id_tipo_movimiento;
      resultado.tipoTransaccionId = formData.id_tipo_transaccion;
    }

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

      // Para transferencias normales
      resultado.id_cuenta_destino = cuenta.id || cuenta._id;
      
      // Para el formato que espera el backend en bolsillo-cuenta
      if (origen === 'WALLET' && destino === 'ACCOUNT') {
        resultado.cuentaDestinoId = cuenta.id || cuenta._id;
      }
    }

    // Bolsillo origen
    if (origen === 'WALLET') {
      const nombreBuscado = String(formData.nombre_bolsillo_origen)
        .trim()
        .toLowerCase();
      // Obtener el rol del usuario actual
      const usuario = this.authService.getUser();
      // Verificar si el usuario tiene el rol ADMIN en el array de roles
      const esAdmin = usuario?.roles?.includes('ADMIN') || false;
      const usuarioRoles = usuario?.roles ? JSON.stringify(usuario.roles) : 'desconocido';
      
      console.group('🔍 Depuración de validación de bolsillo');
      console.log('🔑 Usuario ID:', usuarioId);
      console.log('👑 Es admin:', esAdmin, 'Roles:', usuarioRoles);
      console.log('🔎 Nombre bolsillo buscado:', nombreBuscado);
      console.log('📋 Bolsillos disponibles:', bolsillos);
      
      // Mostrar detalles de cada bolsillo para depuración
      bolsillos.forEach((b, index) => {
        console.log(`Bolsillo ${index + 1}:`, {
          nombre: b.nombre,
          nombre_lower: b.nombre?.toLowerCase(),
          usuario_id: b.usuario_id,
          id: b.id || b._id
        });
      });
      
      // Si es admin, solo validar por nombre; si no, validar por nombre y usuario_id
      let bolsillo = null;
      
      if (esAdmin) {
        // Los administradores pueden acceder a todos los bolsillos
        bolsillo = bolsillos.find(b => {
          const nombreCoincide = b.nombre?.trim().toLowerCase() === nombreBuscado;
          console.log(`Comparando (admin): "${b.nombre?.trim().toLowerCase()}" con "${nombreBuscado}" => ${nombreCoincide}`);
          return nombreCoincide;
        });
      } else {
        // Los usuarios normales solo pueden acceder a sus propios bolsillos
        bolsillo = bolsillos.find(b => {
          const nombreCoincide = b.nombre?.trim().toLowerCase() === nombreBuscado;
          const propietarioCoincide = String(b.usuario_id || '').trim() === usuarioId;
          console.log(`Comparando (usuario): "${b.nombre?.trim().toLowerCase()}" con "${nombreBuscado}" => ${nombreCoincide}`);
          console.log(`Propietario: "${String(b.usuario_id || '').trim()}" con "${usuarioId}" => ${propietarioCoincide}`);
          return nombreCoincide && propietarioCoincide;
        });
      }
      
      console.log('Bolsillo encontrado:', bolsillo);
      console.groupEnd();

      if (!bolsillo) {
        throw new Error(
          `⚠️ Bolsillo de origen (${nombreBuscado}) no encontrado o no te pertenece`
        );
      }

      // Para transferencias normales
      resultado.id_bolsillo_origen = bolsillo.id || bolsillo._id;
      
      // Para el formato que espera el backend en bolsillo-cuenta
      if (origen === 'WALLET' && destino === 'ACCOUNT') {
        resultado.bolsilloOrigenId = bolsillo.id || bolsillo._id;
      }
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

      if (cuentaOrigen && cuentaOrigen.saldo < (this.form.value.monto || 0)) {
        const mensaje = `Saldo insuficiente. Disponible: ${cuentaOrigen.saldo}, solicitado: ${this.form.value.monto}`;
        this.form.get('monto')?.setErrors({ saldoInsuficiente: true });
        this.mostrarNotificacion(mensaje, 'error');
        return;
      }
    }

    // Construir el objeto limpio desde el formulario
    const datosFormulario = {
      ...this.form.value,
      numero_cuenta_origen: this.form.value?.numero_cuenta_origen
        ?.toString()
        .trim(),
      numero_cuenta_destino: this.form.value?.numero_cuenta_destino
        ?.toString()
        .trim(),
      nombre_bolsillo_origen: this.form.value?.nombre_bolsillo_origen
        ?.toString()
        .trim(),
      nombre_bolsillo_destino: this.form.value?.nombre_bolsillo_destino
        ?.toString()
        .trim(),
    };

    console.log('📤 Datos del formulario a enviar:', datosFormulario);

    try {
      const tipo = this.tipoMovimientoSeleccionado;
      if (!tipo) {
        throw new Error('Tipo de movimiento no seleccionado');
      }
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

  // Función para generar un UUID único
  private selfCryptoUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
