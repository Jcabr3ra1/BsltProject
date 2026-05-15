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
import { Transaccion } from '../../../../../../../core/models/transaccion.model';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TransaccionService } from '../../../services/transaccion.service';
import { AuthService } from '../../../../../../../core/services/auth.service';

type TransaccionPayload = Partial<Transaccion> & {
  uuid_transaccion: string;
  bolsilloOrigenId?: string | null;
  cuentaDestinoId?: string | null;
  tipoMovimientoId?: string;
  tipoTransaccionId?: string;
};

@Component({
  standalone: true,
  selector: 'app-crear-transaccion-dialog',
  templateUrl: './crear-transaccion-dialog.component.html',
  styleUrls: ['./crear-transaccion-dialog.component.css'],
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

  esAdmin: boolean = false;
  rolUsuario: string = '';
  tiposTransaccionFiltrados: TipoTransaccion[] = [];
  tiposMovimientoFiltrados: TipoMovimiento[] = [];
  
  transaccionesPorCategoria: {[key: string]: TipoTransaccion[]} = {
    'TRANSFERENCIAS': [],
    'CONSIGNACIONES': [],
    'RETIROS': []
  };
  
  ordenCategorias: string[] = ['TRANSFERENCIAS', 'CONSIGNACIONES', 'RETIROS'];
  
  movimientosPorCategoria: {[key: string]: TipoMovimiento[]} = {
    'TRANSFERENCIAS': [],
    'CONSIGNACIONES': [],
    'RETIROS': []
  };
  
  ordenCategoriasMovimiento: string[] = ['TRANSFERENCIAS', 'CONSIGNACIONES', 'RETIROS'];
  
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

    this.dialogRef.addPanelClass(['custom-dialog', 'custom-dark-dialog']);
    const usuario = this.authService.getUser();
    const usuarioId = usuario?.id;

    if (usuarioId && !usuario?.roles?.some(r => r.nombre?.toUpperCase() === 'ADMIN')) {
      const cuentasUsuario = this.data.cuentas.filter(c => c.usuario_id === usuarioId);
      const idsCuentasUsuario = cuentasUsuario.map(c => c.id || c._id);
    
      this.data.bolsillos = this.data.bolsillos.filter(
        (b) => idsCuentasUsuario.includes(b.id_cuenta) || b.usuario_id === usuarioId
      );
    }
    

    this.inicializarFormulario();
    this.verificarPermisos();
    this.filtrarOpcionesPorRol();

    }

  verificarPermisos(): void {
    const usuario = this.authService.getUser();
    this.esAdmin = usuario?.roles?.some(r => r.nombre === 'ADMIN') || false;
    
    if (usuario?.roles?.some(r => r.nombre === 'ADMIN')) {
      this.rolUsuario = 'ADMIN';
    } else if (usuario?.roles?.some(r => r.nombre === 'MODERATOR')) {
      this.rolUsuario = 'MODERATOR';
    } else {
      this.rolUsuario = 'USER';
    }
    
    }

  filtrarOpcionesPorRol(): void {
    const tiposTransaccion = [...this.data.tiposTransaccion];
    const tiposMovimiento = [...this.data.tiposMovimiento];
    
    this.ordenarOpcionesPorCategoria(tiposTransaccion, tiposMovimiento);
    
    this.tiposTransaccionFiltrados = tiposTransaccion;
    
    if (this.rolUsuario === 'ADMIN' || this.rolUsuario === 'MODERATOR') {
      this.tiposMovimientoFiltrados = tiposMovimiento.filter(tipo => {
        const origen = tipo.codigo_origen?.toUpperCase();
        const destino = tipo.codigo_destino?.toUpperCase();
        if ((origen === 'ACCOUNT' && destino === 'BANK') ||
            (origen === 'WALLET' && destino === 'BANK')) {
          return false;
        }
        return true;
      });
    } else {
      this.tiposMovimientoFiltrados = tiposMovimiento.filter(tipo => {
        const origen = tipo.codigo_origen?.toUpperCase();
        const destino = tipo.codigo_destino?.toUpperCase();
        if (tipo.codigo_origen === 'BANK' || tipo.codigo_destino === 'BANK') {
          return false; // No mostrar ninguna operación con banco externo
        }
        if ((origen === 'ACCOUNT' && destino === 'BANK') ||
            (origen === 'WALLET' && destino === 'BANK')) {
          return false;
        }
        return true;
      });
    }
    
    this.categorizarTransacciones();
    
    this.categorizarMovimientos();
  }
  
  categorizarMovimientos(): void {
    this.movimientosPorCategoria = {
      'TRANSFERENCIAS': [],
      'CONSIGNACIONES': [],
      'RETIROS': []
    };
    
    this.ordenCategoriasMovimiento = ['TRANSFERENCIAS', 'CONSIGNACIONES', 'RETIROS'];
    
    this.tiposMovimientoFiltrados.forEach(tipo => {
      const descripcion = tipo.descripcion.toLowerCase();
      const origen = tipo.codigo_origen?.toUpperCase() || '';
      const destino = tipo.codigo_destino?.toUpperCase() || '';
      
      if (origen === 'ACCOUNT' && destino === 'ACCOUNT') {
        this.movimientosPorCategoria['TRANSFERENCIAS'].push({
          ...tipo,
          tipo_operacion: 'transferenciasCuentaCuenta'
        });
      } 
      else if (origen === 'ACCOUNT' && destino === 'WALLET') {
        this.movimientosPorCategoria['TRANSFERENCIAS'].push({
          ...tipo,
          tipo_operacion: 'transferenciasCuentaBolsillo'
        });
      }
      else if (origen === 'WALLET' && destino === 'WALLET') {
        this.movimientosPorCategoria['TRANSFERENCIAS'].push({
          ...tipo,
          tipo_operacion: 'transferenciasBolsilloBolsillo'
        });
      }
      else if (origen === 'BANK' && destino === 'ACCOUNT') {
        this.movimientosPorCategoria['CONSIGNACIONES'].push({
          ...tipo,
          tipo_operacion: 'consignacionBancoCuenta'
        });
      }
      else if (origen === 'BANK' && destino === 'WALLET') {
        this.movimientosPorCategoria['CONSIGNACIONES'].push({
          ...tipo,
          tipo_operacion: 'consignacionBancoBolsillo'
        });
      }
      else if (origen === 'ACCOUNT' && destino === 'BANK') {
        this.movimientosPorCategoria['RETIROS'].push({
          ...tipo,
          tipo_operacion: 'retiroCuentaBanco'
        });
      }
      else if (origen === 'WALLET' && destino === 'ACCOUNT') {
        this.movimientosPorCategoria['TRANSFERENCIAS'].push({
          ...tipo,
          tipo_operacion: 'transferenciasBolsilloCuenta'
        });
      }
      else if (origen === 'WALLET' && destino === 'BANK') {
        this.movimientosPorCategoria['RETIROS'].push({
          ...tipo,
          tipo_operacion: 'retiroBolsilloBanco'
        });
      }
      else {
        }
    });

    Object.keys(this.movimientosPorCategoria).forEach(categoria => {
      this.movimientosPorCategoria[categoria].sort((a, b) => {
        return a.descripcion.localeCompare(b.descripcion);
      });
    });
  }  

  categorizarTransacciones(): void {
    this.transaccionesPorCategoria = {
      'TRANSFERENCIAS': [],
      'CONSIGNACIONES': [],
      'RETIROS': []
    };

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
          }
      }
    });

    for (const categoria of Object.keys(this.transaccionesPorCategoria)) {
      this.transaccionesPorCategoria[categoria].sort((a, b) => {
        return a.descripcion.localeCompare(b.descripcion);
      });
    }
    
    }
  
  ordenarOpcionesPorCategoria(tiposTransaccion: TipoTransaccion[], tiposMovimiento: TipoMovimiento[]): void {
    const ordenTransacciones: {[key: string]: number} = {
      'transferencia': 1,
      'mover': 2,
      'consignación': 3,
      'consignacion': 3,
      'retiro': 4
    };
    
    tiposTransaccion.sort((a, b) => {
      const descA = a.descripcion.toLowerCase();
      const descB = b.descripcion.toLowerCase();
      
      let prioridadA = 999;
      let prioridadB = 999;
      
      for (const [clave, valor] of Object.entries(ordenTransacciones)) {
        if (descA.includes(clave)) prioridadA = valor;
        if (descB.includes(clave)) prioridadB = valor;
      }
      
      return prioridadA - prioridadB;
    });
    
    const ordenMovimientos: {[key: string]: number} = {
      'cuenta': 1,
      'bolsillo': 2,
      'banco': 3
    };
    
    tiposMovimiento.sort((a, b) => {
      const descA = a.descripcion.toLowerCase();
      const descB = b.descripcion.toLowerCase();
      
      let prioridadA = 999;
      let prioridadB = 999;
      
      for (const [clave, valor] of Object.entries(ordenMovimientos)) {
        if (descA.includes(clave)) prioridadA = valor;
        if (descB.includes(clave)) prioridadB = valor;
      }
      
      return prioridadA - prioridadB;
    });
  }

  inicializarFormulario(): void {
  }

  get tipoMovimientoSeleccionado(): TipoMovimiento | undefined {
    return this.data.tiposMovimiento.find(
      (t) =>
        t.id === this.form.value.id_tipo_movimiento ||
        t._id === this.form.value.id_tipo_movimiento
    );
  }

  seleccionarTipoTransaccion(id: string): void {
    this.eliminarTodosLosTooltips();
    
    this.form.get('id_tipo_transaccion')?.setValue(id);
    
    this.filtrarMovimientosPorTransaccion(id);
    
    setTimeout(() => {
      this.pasoActivo = 2;
    }, 300);
  }
  
  filtrarMovimientosPorTransaccion(idTipoTransaccion: string): void {
    const tipoTransaccionSeleccionado = this.data.tiposTransaccion.find(
      tipo => (tipo.id || tipo._id) === idTipoTransaccion
    );
    
    if (!tipoTransaccionSeleccionado) return;
    
    const descripcion = tipoTransaccionSeleccionado.descripcion.toLowerCase();
    
    const tiposMovimiento = [...this.data.tiposMovimiento];
    
    if (descripcion.includes('transferencia') || descripcion.includes('mover') || descripcion.includes('trasladar')) {
      this.tiposMovimientoFiltrados = tiposMovimiento.filter(tipo => {
        if (!tipo.codigo_origen || !tipo.codigo_destino) return false;
        
        const origen = tipo.codigo_origen.toUpperCase();
        const destino = tipo.codigo_destino.toUpperCase();
        
        if (destino === 'BANK') {
          return false; // No incluir retiros en las transferencias
        }
        
        return (origen === 'ACCOUNT' && destino === 'ACCOUNT') || 
               (origen === 'ACCOUNT' && destino === 'WALLET') || 
               (origen === 'WALLET' && destino === 'WALLET');
      });
    } else if (descripcion.includes('consignación') || descripcion.includes('consignacion') || 
               descripcion.includes('depósito') || descripcion.includes('deposito')) {
      this.tiposMovimientoFiltrados = tiposMovimiento.filter(tipo => {
        if (!tipo.codigo_origen || !tipo.codigo_destino) return false;
        
        const origen = tipo.codigo_origen.toUpperCase();
        const destino = tipo.codigo_destino.toUpperCase();
        
        return origen === 'BANK' && (destino === 'ACCOUNT' || destino === 'WALLET');
      });
    } else if (descripcion.includes('retiro') || descripcion.includes('extraer')) {
      this.tiposMovimientoFiltrados = tiposMovimiento.filter(tipo => {
        if (!tipo.codigo_origen || !tipo.codigo_destino) return false;
        
        const origen = tipo.codigo_origen.toUpperCase();
        const destino = tipo.codigo_destino.toUpperCase();
        
        return destino === 'BANK' && (origen === 'ACCOUNT' || origen === 'WALLET');
      });
    }
    
    if (this.rolUsuario !== 'ADMIN' && this.rolUsuario !== 'MODERATOR') {
      this.tiposMovimientoFiltrados = this.tiposMovimientoFiltrados.filter(tipo => {
        return tipo.codigo_origen !== 'BANK' && tipo.codigo_destino !== 'BANK';
      });
    }
    
    this.categorizarMovimientos();
  }
  
  
  obtenerTipoTransaccion(): string {
    const idTipoTransaccion = this.form.get('id_tipo_transaccion')?.value;
    const tipoTransaccionSeleccionado = this.data.tiposTransaccion.find(tipo => tipo.id === idTipoTransaccion);
    return tipoTransaccionSeleccionado?.descripcion?.toLowerCase() || '';
  }

  seleccionarTipoMovimiento(id: string | undefined): void {
    if (id) {
      this.eliminarTodosLosTooltips();
      
      this.form.get('id_tipo_movimiento')?.setValue(id);
      this.form.get('id_tipo_movimiento')?.markAsDirty();

      this.form.get('numero_cuenta_origen')?.setValue('');
      this.form.get('numero_cuenta_destino')?.setValue('');
      this.form.get('nombre_bolsillo_origen')?.setValue('');
      this.form.get('nombre_bolsillo_destino')?.setValue('');

      this.actualizarValidadores();

      this.mensajeError = null;
      
      setTimeout(() => {
        this.pasoActivo = 3;
      }, 300); // Pequeño retraso para mostrar la selección antes de avanzar
    }
  }
  
  regresarPasoAnterior(): void {
    if (this.pasoActivo > 1) {
      if (this.pasoActivo === 3) {
        this.form.get('id_tipo_movimiento')?.setValue('');
        this.form.get('numero_cuenta_origen')?.setValue('');
        this.form.get('numero_cuenta_destino')?.setValue('');
        this.form.get('nombre_bolsillo_origen')?.setValue('');
        this.form.get('nombre_bolsillo_destino')?.setValue('');
      }
      
      this.pasoActivo--;
    }
  }

  actualizarValidadores(): void {
    const tipo = this.tipoMovimientoSeleccionado;
    if (!tipo) return;

    const origen = tipo.codigo_origen.toUpperCase();
    const destino = tipo.codigo_destino.toUpperCase();

    this.form.get('numero_cuenta_origen')?.clearValidators();
    this.form.get('numero_cuenta_destino')?.clearValidators();
    this.form.get('nombre_bolsillo_origen')?.clearValidators();
    this.form.get('nombre_bolsillo_destino')?.clearValidators();

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

    this.form.get('numero_cuenta_origen')?.updateValueAndValidity();
    this.form.get('numero_cuenta_destino')?.updateValueAndValidity();
    this.form.get('nombre_bolsillo_origen')?.updateValueAndValidity();
    this.form.get('nombre_bolsillo_destino')?.updateValueAndValidity();
  }

  obtenerIconoMovimiento(tipo: TipoMovimiento): { icon: string; type: string } {
    const origen = tipo.codigo_origen?.toUpperCase() || '';
    const destino = tipo.codigo_destino?.toUpperCase() || '';
    const tipoOperacion = tipo.tipo_operacion || '';
    
    
    if (tipoOperacion.startsWith('transferencias')) {
      if (tipoOperacion === 'transferenciasCuentaCuenta') {
        return { icon: 'account_balance', type: 'transfer' }; // azul
      }
      
      if (tipoOperacion === 'transferenciasCuentaBolsillo') {
        return { icon: 'savings', type: 'transfer' }; // azul
      }
      
      if (tipoOperacion === 'transferenciasBolsilloBolsillo') {
        return { icon: 'wallet', type: 'transfer' }; // azul
      }
      
      return { icon: 'account_balance', type: 'transfer' }; // azul
    }
    
    else if (tipoOperacion.startsWith('consignacion')) {
      if (tipoOperacion === 'consignacionBancoBolsillo') {
        return { icon: 'account_balance_wallet', type: 'deposit' }; // verde
      }
      
      if (tipoOperacion === 'consignacionBancoCuenta') {
        return { icon: 'payments', type: 'deposit' }; // verde
      }
      
      return { icon: 'payments', type: 'deposit' }; // verde
    }
    
    else if (tipoOperacion.startsWith('retiro')) {
      if (tipoOperacion === 'retiroCuentaBanco') {
        return { icon: 'monetization_on', type: 'withdraw' }; // rojo
      }
      
      if (tipoOperacion === 'retiroBolsilloBanco') {
        return { icon: 'money_off', type: 'withdraw' }; // rojo
      }
      
      if (tipoOperacion === 'retiroBolsilloCuenta') {
        return { icon: 'move_to_inbox', type: 'withdraw' }; // rojo
      }
      
      return { icon: 'monetization_on', type: 'withdraw' }; // rojo
    }
    
    
    if (origen === 'ACCOUNT' && destino === 'ACCOUNT') {
      return { icon: 'account_balance', type: 'transfer' };
    }
    
    if (origen === 'ACCOUNT' && destino === 'WALLET') {
      return { icon: 'savings', type: 'transfer' };
    }
    
    if (origen === 'BANK' && destino === 'WALLET') {
      return { icon: 'account_balance_wallet', type: 'deposit' };
    }
    
    if (origen === 'BANK' && destino === 'ACCOUNT') {
      return { icon: 'payments', type: 'deposit' };
    }
    
    if (origen === 'WALLET' && destino === 'ACCOUNT') {
      return { icon: 'move_to_inbox', type: 'transfer' };
    }
    
    if (origen === 'ACCOUNT' && destino === 'BANK') {
      return { icon: 'monetization_on', type: 'withdraw' };
    }
    
    if (origen === 'WALLET' && destino === 'BANK') {
      return { icon: 'money_off', type: 'withdraw' };
    }
    
    if (origen === 'WALLET' && destino === 'WALLET') {
      return { icon: 'wallet', type: 'transfer' };
    }
    
    return { icon: 'account_balance', type: 'default' };
  }

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
  
  mostrarInfoTooltip(event: MouseEvent, texto: string): void {
    const tooltip = document.createElement('div');
    tooltip.className = 'custom-tooltip-overlay';
    tooltip.textContent = texto;
    tooltip.setAttribute('data-tooltip-id', Date.now().toString());
    
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
    
    setTimeout(() => {
      tooltip.style.opacity = '1';
    }, 10);
    
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

  ejecutarTransaccion(data: Partial<Transaccion> & { uuid_transaccion?: string }): void {
    this.isLoading = true;
    this.mensajeError = null;

    const tipo = this.tipoMovimientoSeleccionado;
    if (!tipo) {
      this.isLoading = false;
      this.mensajeError = 'Tipo de movimiento no seleccionado';
      return;
    }

    const origen = tipo.codigo_origen.toUpperCase();
    const destino = tipo.codigo_destino.toUpperCase();

    let peticion;

    if (origen === 'ACCOUNT' && destino === 'ACCOUNT') {
      const transformedData = {
        id_cuenta_origen: data.id_cuenta_origen,
        id_cuenta_destino: data.id_cuenta_destino,
        id_tipo_movimiento: data.id_tipo_movimiento,
        id_tipo_transaccion: data.id_tipo_transaccion,
        monto: data.monto,
        descripcion: data.descripcion || 'Transferencia entre cuentas',
        uuid_transaccion: data.uuid_transaccion
      };
      
      peticion = this.transaccionService.transferenciaCuentaCuenta(transformedData);
    } else if (origen === 'ACCOUNT' && destino === 'WALLET') {
      const transformedData = {
        id_cuenta_origen: data.id_cuenta_origen,
        id_bolsillo_destino: data.id_bolsillo_destino,
        id_tipo_movimiento: data.id_tipo_movimiento,
        id_tipo_transaccion: data.id_tipo_transaccion,
        monto: data.monto,
        descripcion: data.descripcion || 'Transferencia de cuenta a bolsillo',
        uuid_transaccion: data.uuid_transaccion
      };
      
      peticion = this.transaccionService.transferenciaCuentaBolsillo(transformedData);
    } else if (origen === 'WALLET' && destino === 'ACCOUNT') {
      const transformedData = {
        id_bolsillo_origen: data.id_bolsillo_origen,
        id_cuenta_destino: data.id_cuenta_destino,
        id_tipo_movimiento: data.id_tipo_movimiento,
        id_tipo_transaccion: data.id_tipo_transaccion,
        monto: data.monto,
        descripcion: data.descripcion || 'Retiro de bolsillo a cuenta',
        uuid_transaccion: data.uuid_transaccion
      };
      
      peticion = this.transaccionService.retiroBolsilloCuenta(transformedData);
    } else if (origen === 'WALLET' && destino === 'WALLET') {
      const transformedData = {
        id_bolsillo_origen: data.id_bolsillo_origen,
        id_bolsillo_destino: data.id_bolsillo_destino,
        id_tipo_movimiento: data.id_tipo_movimiento,
        id_tipo_transaccion: data.id_tipo_transaccion,
        monto: data.monto,
        descripcion: data.descripcion || 'Transferencia entre bolsillos',
        uuid_transaccion: data.uuid_transaccion
      };
      
      peticion = this.transaccionService.transferenciaBolsilloBolsillo(transformedData);
    } else if (origen === 'BANK' && destino === 'ACCOUNT') {
      const transformedData = {
        id_cuenta_destino: data.id_cuenta_destino,
        id_tipo_movimiento: data.id_tipo_movimiento,
        id_tipo_transaccion: data.id_tipo_transaccion,
        monto: data.monto,
        descripcion: data.descripcion || 'Consignación de banco a cuenta',
        uuid_transaccion: data.uuid_transaccion
      };
      
      peticion = this.transaccionService.consignacionBancoCuenta(transformedData);
    } else if (origen === 'BANK' && destino === 'WALLET') {
      const transformedData = {
        id_bolsillo_destino: data.id_bolsillo_destino,
        id_tipo_movimiento: data.id_tipo_movimiento,
        id_tipo_transaccion: data.id_tipo_transaccion,
        monto: data.monto,
        descripcion: data.descripcion || 'Consignación de banco a bolsillo',
        uuid_transaccion: data.uuid_transaccion
      };
      
      peticion = this.transaccionService.consignacionBancoBolsillo(transformedData);
    } else if (origen === 'ACCOUNT' && destino === 'BANK') {
      const transformedData = {
        id_cuenta_origen: data.id_cuenta_origen,
        id_tipo_movimiento: data.id_tipo_movimiento,
        id_tipo_transaccion: data.id_tipo_transaccion,
        monto: data.monto,
        descripcion: data.descripcion || 'Retiro de cuenta a banco',
        uuid_transaccion: data.uuid_transaccion
      };
      
      peticion = this.transaccionService.retiroCuentaBanco(transformedData);
    } else if (origen === 'WALLET' && destino === 'BANK') {
      const transformedData = {
        id_bolsillo_origen: data.id_bolsillo_origen,
        id_tipo_movimiento: data.id_tipo_movimiento,
        id_tipo_transaccion: data.id_tipo_transaccion,
        monto: data.monto,
        descripcion: data.descripcion || 'Retiro de bolsillo a banco',
        uuid_transaccion: data.uuid_transaccion
      };
      
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

  prepararDatosTransaccion(
    formData: { id_tipo_movimiento: string; id_tipo_transaccion: string; monto: number; descripcion: string; numero_cuenta_origen?: string; numero_cuenta_destino?: string; nombre_bolsillo_origen?: string; nombre_bolsillo_destino?: string; uuid_transaccion?: string },
    origen: string,
    destino: string
  ): TransaccionPayload {
    const resultado: TransaccionPayload = {
      uuid_transaccion: this.selfCryptoUUID(),
      id_tipo_movimiento: formData.id_tipo_movimiento,
      id_tipo_transaccion: formData.id_tipo_transaccion,
      monto: formData.monto,
      descripcion: formData.descripcion,
    };
    
    if (origen === 'WALLET' && destino === 'ACCOUNT') {
      resultado.bolsilloOrigenId = null; // Se asignará después
      resultado.cuentaDestinoId = null; // Se asignará después
      resultado.tipoMovimientoId = formData.id_tipo_movimiento;
      resultado.tipoTransaccionId = formData.id_tipo_transaccion;
    }

    const usuarioId = this.authService.getUser()?.id?.trim();
    const cuentas = this.data.cuentas || [];
    const bolsillos = this.data.bolsillos || [];

    if (origen === 'ACCOUNT') {
      const numeroBuscado = String(formData.numero_cuenta_origen).trim();
      const usuarioId = this.authService.getUser()?.id?.trim();

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
      
      if (origen === 'WALLET' && destino === 'ACCOUNT') {
        resultado.cuentaDestinoId = cuenta.id || cuenta._id;
      }
    }

    if (origen === 'WALLET') {
      const nombreBuscado = String(formData.nombre_bolsillo_origen)
        .trim()
        .toLowerCase();
      const usuario = this.authService.getUser();
      const esAdmin = usuario?.roles?.some(r => r.nombre === 'ADMIN') || false;
      const usuarioRoles = usuario?.roles ? JSON.stringify(usuario.roles) : 'desconocido';
      
      bolsillos.forEach((b, index) => {
        });
      
      let bolsillo = null;
      
      if (esAdmin) {
        bolsillo = bolsillos.find(b => {
          const nombreCoincide = b.nombre?.trim().toLowerCase() === nombreBuscado;
          return nombreCoincide;
        });
      } else {
        bolsillo = bolsillos.find(b => {
          const nombreCoincide = b.nombre?.trim().toLowerCase() === nombreBuscado;
          const propietarioCoincide = String(b.usuario_id || '').trim() === usuarioId;
          return nombreCoincide && propietarioCoincide;
        });
      }
      
      if (!bolsillo) {
        throw new Error(
          `⚠️ Bolsillo de origen (${nombreBuscado}) no encontrado o no te pertenece`
        );
      }

      resultado.id_bolsillo_origen = bolsillo.id || bolsillo._id;
      
      if (origen === 'WALLET' && destino === 'ACCOUNT') {
        resultado.bolsilloOrigenId = bolsillo.id || bolsillo._id;
      }
    }

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

      this.ejecutarTransaccion(datosTransaccion);
    } catch (error: unknown) {
      this.mensajeError = (error as Error).message || 'Error al preparar la transacción';
      this.mostrarNotificacion(
        this.mensajeError ?? 'Error desconocido',
        'error'
      );
    }
  }

  cancelar(): void {
    this.dialogRef.close();
  }

  private selfCryptoUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
