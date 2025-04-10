import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Subscription, finalize } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '@environments/environment';

import { TransaccionFormComponent } from './transaccion-form/transaccion-form.component';
import { TransaccionService } from '@core/services/finanzas/transaccion.service';
import { Transaccion, TipoTransaccion, EstadoTransaccion, FiltrosTransaccion } from '@core/models/finanzas/transaccion.model';
import { AuthService } from '@core/services/seguridad';
import { TransaccionListComponent } from './transaccion-list/transaccion-list.component';

@Component({
  selector: 'app-transacciones',
  templateUrl: './transacciones.component.html',
  styleUrls: ['./transacciones.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatSnackBarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatExpansionModule,
    MatPaginatorModule,
    ReactiveFormsModule,
    TransaccionListComponent
  ]
})
export class TransaccionesComponent implements OnInit, OnDestroy {
  // Exponer enums para el template
  readonly TipoTransaccion = TipoTransaccion;
  readonly EstadoTransaccion = EstadoTransaccion;

  // Estado de la aplicación
  transacciones: Transaccion[] = [];
  transaccionesFiltradas: Transaccion[] = [];
  loading = false;
  error: string | null = null;
  
  // Para compatibilidad con archivos de prueba
  transactions: Transaccion[] = [];
  
  // Alias para mantener compatibilidad con código existente
  loadTransactions(): void {
    this.cargarTransacciones();
  }
  
  // Alias para mantener compatibilidad con pruebas
  approveTransaction(transaccion: Transaccion): void {
    this.aprobarTransaccion(transaccion);
  }
  
  // Alias para mantener compatibilidad con pruebas
  rejectTransaction(transaccion: Transaccion): void {
    this.rechazarTransaccion(transaccion);
  }
  
  // Alias para mantener compatibilidad con pruebas
  deleteTransaction(transaccion: Transaccion): void {
    this.eliminarTransaccion(transaccion);
  }
  
  // Formulario de filtros
  formularioFiltro: FormGroup;
  filtrosActivos = false;
  
  // Estadísticas
  totalTransacciones = 0;
  totalMonto = 0;
  totalAprobadas = 0;
  totalPendientes = 0;
  totalRechazadas = 0;
  
  // Paginación
  paginaActual = 0;
  tamañoPagina = 10;
  opcionesTamañoPagina = [5, 10, 25, 50];
  
  // Ordenamiento
  campoOrdenamiento = 'fecha';
  ordenAscendente = false;
  
  // Subscripciones
  private subscriptions = new Subscription();

  constructor(
    private readonly transaccionService: TransaccionService,
    private readonly authService: AuthService,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
    private readonly fb: FormBuilder,
    private readonly router: Router
  ) {
    this.formularioFiltro = this.fb.group({
      tipo: [''],
      estado: [''],
      fechaInicio: [null],
      fechaFin: [null],
      montoMinimo: [null],
      montoMaximo: [null]
    });
  }

  ngOnInit(): void {
    // Verificar si el usuario está autenticado antes de cargar transacciones
    this.verificarUsuarioYCargarDatos();
    
    // Suscribirse a cambios en el formulario de filtros
    this.subscriptions.add(
      this.formularioFiltro.valueChanges.subscribe(() => {
        this.aplicarFiltros();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /**
   * Verifica si el usuario está autenticado y carga los datos
   */
  private verificarUsuarioYCargarDatos(): void {
    console.log('Verificando autenticación del usuario...');
    
    // Verificar si hay un token
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No hay token de autenticación');
      this.error = 'Debe iniciar sesión para ver sus transacciones';
      this.router.navigate(['/auth/login']);
      return;
    }
    
    // Verificar si hay un usuario en localStorage
    const userJson = localStorage.getItem('user');
    if (!userJson) {
      console.error('No hay información de usuario');
      this.error = 'Información de usuario no disponible';
      this.router.navigate(['/auth/login']);
      return;
    }
    
    try {
      const user = JSON.parse(userJson);
      console.log('Usuario actual:', user);
      
      // Si llegamos aquí, consideramos que el usuario está autenticado
      // Incluso si no tiene ID, intentaremos cargar transacciones
      // y dejaremos que el backend maneje la autenticación
      this.cargarTransacciones();
      
    } catch (error) {
      console.error('Error al parsear información del usuario:', error);
      this.error = 'Error al procesar información del usuario';
      this.router.navigate(['/auth/login']);
    }
  }

  /**
   * Carga las transacciones del usuario actual
   */
  cargarTransacciones(): void {
    this.loading = true;
    this.error = null;
    
    const userId = this.authService.getUserId();
    if (!userId) {
      this.error = 'No se pudo obtener el ID del usuario';
      this.loading = false;
      return;
    }
    
    console.log('Iniciando carga de transacciones para usuario:', userId);
    
    // Verificar si hay un token válido
    const token = this.authService.getToken();
    if (!token) {
      console.error('No hay token de autenticación disponible');
      this.error = 'No hay sesión activa. Por favor, inicie sesión nuevamente.';
      this.loading = false;
      return;
    }
    
    console.log('Token de autenticación disponible:', token.substring(0, 15) + '...');
    
    // Crear datos de prueba si estamos en modo de desarrollo
    if (environment.features.enableDebug) {
      console.log('Modo de desarrollo activo, verificando si se deben crear datos de prueba');
      // Si no hay transacciones o estamos en modo de desarrollo, crear algunas transacciones de prueba
      if (this.transacciones.length === 0) {
        console.log('Creando datos de prueba para desarrollo');
        this.crearDatosPrueba();
        return;
      }
    }
    
    // Intentar cargar transacciones con mejor manejo de errores
    this.subscriptions.add(
      this.transaccionService.obtenerTransacciones().pipe(
        finalize(() => {
          console.log('Finalizando solicitud de transacciones');
          this.loading = false;
        })
      ).subscribe({
        next: (transacciones: Transaccion[]) => {
          console.log(`Transacciones recibidas (${transacciones.length}):`, transacciones);
          
          // Verificar si hay transacciones
          if (transacciones.length === 0) {
            console.log('No se encontraron transacciones para el usuario');
            // Si estamos en modo de desarrollo, crear datos de prueba
            if (environment.features.enableDebug) {
              console.log('Creando datos de prueba ya que no se encontraron transacciones');
              this.crearDatosPrueba();
              return;
            }
          }
          
          this.transacciones = transacciones;
          this.transactions = transacciones; // Para compatibilidad con spec
          this.aplicarFiltros();
          this.calcularEstadisticas();
        },
        error: (error: any) => {
          console.error('Error detallado al cargar transacciones:', error);
          
          if (error.status === 401) {
            this.error = 'Sesión expirada. Por favor, inicie sesión nuevamente.';
            this.router.navigate(['/auth/login']);
          } else if (error.status === 404) {
            this.error = 'No se encontraron transacciones.';
            this.transacciones = [];
            this.transaccionesFiltradas = [];
            
            // Si estamos en modo de desarrollo, crear datos de prueba
            if (environment.features.enableDebug) {
              console.log('Creando datos de prueba ya que no se encontraron transacciones (error 404)');
              this.crearDatosPrueba();
            }
          } else {
            this.error = 'Error al cargar transacciones. Por favor, intente nuevamente.';
            
            // Si estamos en modo de desarrollo, crear datos de prueba
            if (environment.features.enableDebug) {
              console.log('Creando datos de prueba debido a error:', error);
              this.crearDatosPrueba();
            }
          }
        }
      })
    );
  }
  
  /**
   * Crea datos de prueba para desarrollo
   */
  private crearDatosPrueba(): void {
    console.log('Generando datos de prueba para transacciones');
    this.loading = false;
    this.error = null;
    
    // Crear transacciones de ejemplo para pruebas
    const transaccionesPrueba: Transaccion[] = [
      {
        id: '1',
        monto: 100000,
        descripcion: 'Transferencia entre cuentas',
        estado: EstadoTransaccion.COMPLETADA,
        fecha: new Date(2023, 3, 15).toISOString(),
        tipo: TipoTransaccion.CUENTA_CUENTA,
        origen: { numero: '1234567890', nombre: 'Cuenta Ahorros' },
        destino: { numero: '0987654321', nombre: 'Cuenta Corriente' }
      },
      {
        id: '2',
        monto: 50000,
        descripcion: 'Transferencia a bolsillo',
        estado: EstadoTransaccion.APROBADA,
        fecha: new Date(2023, 3, 16).toISOString(),
        tipo: TipoTransaccion.CUENTA_BOLSILLO,
        origen: { numero: '1234567890', nombre: 'Cuenta Ahorros' },
        destino: { numero: 'B12345', nombre: 'Bolsillo Vacaciones' }
      },
      {
        id: '3',
        monto: 200000,
        descripcion: 'Consignación',
        estado: EstadoTransaccion.PENDIENTE,
        fecha: new Date(2023, 3, 17).toISOString(),
        tipo: TipoTransaccion.BANCO_CUENTA,
        destino: { numero: '1234567890', nombre: 'Cuenta Ahorros' }
      },
      {
        id: '4',
        monto: 75000,
        descripcion: 'Retiro',
        estado: EstadoTransaccion.RECHAZADA,
        fecha: new Date(2023, 3, 18).toISOString(),
        tipo: TipoTransaccion.CUENTA_BANCO,
        origen: { numero: '1234567890', nombre: 'Cuenta Ahorros' }
      },
      {
        id: '5',
        monto: 150000,
        descripcion: 'Transferencia de bolsillo a cuenta',
        estado: EstadoTransaccion.COMPLETADA,
        fecha: new Date(2023, 3, 19).toISOString(),
        tipo: TipoTransaccion.BOLSILLO_CUENTA,
        origen: { numero: 'B12345', nombre: 'Bolsillo Vacaciones' },
        destino: { numero: '1234567890', nombre: 'Cuenta Ahorros' }
      }
    ];
    
    this.transacciones = transaccionesPrueba;
    this.transactions = transaccionesPrueba; // Para compatibilidad con spec
    this.aplicarFiltros();
    this.calcularEstadisticas();
    
    console.log('Datos de prueba generados:', this.transacciones.length);
  }

  /**
   * Abre el diálogo para crear una nueva transacción
   */
  crearTransaccion(tipo: string): void {
    const dialogRef = this.dialog.open(TransaccionFormComponent, {
      width: '600px',
      data: { tipo }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open('Transacción creada con éxito', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });
        this.cargarTransacciones();
      }
    });
  }

  /**
   * Abre el diálogo para ver detalles de una transacción
   */
  actualizarTransaccion(transaccion: Transaccion): void {
    const dialogRef = this.dialog.open(TransaccionFormComponent, {
      width: '600px',
      data: { transaccion, readonly: true }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarTransacciones();
      }
    });
  }

  /**
   * Aplica los filtros del formulario a las transacciones
   */
  aplicarFiltros(): void {
    const filtros = this.formularioFiltro.value as FiltrosTransaccion;
    console.log('Aplicando filtros:', filtros);
    
    // Verificar si hay filtros activos
    this.filtrosActivos = !!filtros.tipo || !!filtros.estado || 
                        !!filtros.fechaInicio || !!filtros.fechaFin || 
                        !!filtros.montoMinimo || !!filtros.montoMaximo;
    
    // Si no hay transacciones o no hay filtros activos, mostrar todas
    if (!this.transacciones.length || !this.filtrosActivos) {
      this.transaccionesFiltradas = [...this.transacciones];
      return;
    }
    
    // Aplicar filtros
    this.transaccionesFiltradas = this.transacciones.filter(transaccion => {
      // Filtro por tipo
      if (filtros.tipo && transaccion.tipo !== filtros.tipo) {
        return false;
      }
      
      // Filtro por estado
      if (filtros.estado && transaccion.estado !== filtros.estado) {
        return false;
      }
      
      // Filtro por fecha inicio
      if (filtros.fechaInicio) {
        const fechaInicio = new Date(filtros.fechaInicio);
        fechaInicio.setHours(0, 0, 0, 0);
        const fechaTransaccion = new Date(transaccion.createdAt || transaccion.fecha || new Date());
        if (fechaTransaccion < fechaInicio) {
          return false;
        }
      }
      
      // Filtro por fecha fin
      if (filtros.fechaFin) {
        const fechaFin = new Date(filtros.fechaFin);
        fechaFin.setHours(23, 59, 59, 999);
        const fechaTransaccion = new Date(transaccion.createdAt || transaccion.fecha || new Date());
        if (fechaTransaccion > fechaFin) {
          return false;
        }
      }
      
      // Filtro por monto mínimo
      if (filtros.montoMinimo && transaccion.monto < filtros.montoMinimo) {
        return false;
      }
      
      // Filtro por monto máximo
      if (filtros.montoMaximo && transaccion.monto > filtros.montoMaximo) {
        return false;
      }
      
      return true;
    });
    
    console.log('Transacciones filtradas:', this.transaccionesFiltradas.length);
  }

  /**
   * Calcula las estadísticas de las transacciones
   */
  calcularEstadisticas(): void {
    console.log('Calculando estadísticas de transacciones...');
    
    if (!this.transacciones || this.transacciones.length === 0) {
      console.log('No hay transacciones para calcular estadísticas');
      this.totalTransacciones = 0;
      this.totalMonto = 0;
      this.totalAprobadas = 0;
      this.totalPendientes = 0;
      this.totalRechazadas = 0;
      return;
    }
    
    this.totalTransacciones = this.transacciones.length;
    
    // Calcular monto total con manejo seguro de valores nulos o indefinidos
    this.totalMonto = this.transacciones.reduce((sum, t) => {
      const monto = t.monto || 0;
      return sum + monto;
    }, 0);
    
    // Contar transacciones por estado, manejando diferentes formatos de estado
    this.totalAprobadas = this.transacciones.filter(t => {
      const estado = (t.estado || '').toUpperCase();
      return estado === this.EstadoTransaccion.APROBADA || 
             estado === this.EstadoTransaccion.COMPLETADA || 
             estado === 'APPROVED' || 
             estado === 'COMPLETED';
    }).length;
    
    this.totalPendientes = this.transacciones.filter(t => {
      const estado = (t.estado || '').toUpperCase();
      return estado === this.EstadoTransaccion.PENDIENTE || 
             estado === 'PENDING';
    }).length;
    
    this.totalRechazadas = this.transacciones.filter(t => {
      const estado = (t.estado || '').toUpperCase();
      return estado === this.EstadoTransaccion.RECHAZADA || 
             estado === this.EstadoTransaccion.CANCELADA || 
             estado === 'REJECTED' || 
             estado === 'CANCELED';
    }).length;
    
    console.log('Estadísticas calculadas:', {
      total: this.totalTransacciones,
      monto: this.totalMonto,
      aprobadas: this.totalAprobadas,
      pendientes: this.totalPendientes,
      rechazadas: this.totalRechazadas
    });
  }

  /**
   * Formatea un monto para mostrar en el UI
   */
  formatearMonto(monto: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(monto);
  }

  /**
   * Resetea los filtros del formulario
   */
  resetearFiltros(): void {
    this.formularioFiltro.reset();
    this.transaccionesFiltradas = [...this.transacciones];
    this.filtrosActivos = false;
    this.calcularEstadisticas();
  }
  
  /**
   * Método para ordenar transacciones
   * @param campo Campo por el que ordenar
   * @param direccion Dirección del ordenamiento ('asc' o 'desc')
   */
  ordenarPor(campo: string, direccion?: string): void {
    console.log(`Ordenando por: ${campo}, dirección: ${direccion || 'no especificada'}`);
    this.campoOrdenamiento = campo;
    
    // Si se especifica la dirección, usarla; de lo contrario, invertir la dirección actual
    if (direccion) {
      this.ordenAscendente = direccion === 'asc';
    } else if (this.campoOrdenamiento === campo) {
      this.ordenAscendente = !this.ordenAscendente;
    } else {
      this.ordenAscendente = true;
    }
    
    console.log(`Orden: ${this.ordenAscendente ? 'ascendente' : 'descendente'}`);
    
    this.transaccionesFiltradas.sort((a, b) => {
      let valorA: any;
      let valorB: any;
      
      // Determinar qué valores comparar según el campo
      switch (campo) {
        case 'fecha':
          // Usar createdAt, fecha o fecha_creacion, en ese orden de prioridad
          const fechaA = a.createdAt || a.fecha || a.fecha_creacion || a.fecha_transaccion;
          const fechaB = b.createdAt || b.fecha || b.fecha_creacion || b.fecha_transaccion;
          
          // Convertir a objetos Date y luego a timestamp
          valorA = fechaA ? new Date(fechaA).getTime() : 0;
          valorB = fechaB ? new Date(fechaB).getTime() : 0;
          break;
        case 'monto':
          valorA = a.monto || 0;
          valorB = b.monto || 0;
          break;
        case 'tipo':
          valorA = a.tipo || '';
          valorB = b.tipo || '';
          break;
        case 'estado':
          valorA = a.estado || '';
          valorB = b.estado || '';
          break;
        default:
          // Por defecto, ordenar por fecha
          const defaultFechaA = a.createdAt || a.fecha || a.fecha_creacion || a.fecha_transaccion;
          const defaultFechaB = b.createdAt || b.fecha || b.fecha_creacion || b.fecha_transaccion;
          valorA = defaultFechaA ? new Date(defaultFechaA).getTime() : 0;
          valorB = defaultFechaB ? new Date(defaultFechaB).getTime() : 0;
      }
      
      // Manejar valores nulos o indefinidos
      if (valorA === null || valorA === undefined) valorA = this.ordenAscendente ? Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER;
      if (valorB === null || valorB === undefined) valorB = this.ordenAscendente ? Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER;
      
      // Realizar la comparación según el orden
      if (this.ordenAscendente) {
        return valorA > valorB ? 1 : valorA < valorB ? -1 : 0;
      } else {
        return valorA < valorB ? 1 : valorA > valorB ? -1 : 0;
      }
    });
  }
  
  /**
   * Método para cambiar de página
   */
  cambiarPagina(evento: PageEvent): void {
    this.paginaActual = evento.pageIndex;
    this.tamañoPagina = evento.pageSize;
  }



  /**
   * Aprueba una transacción
   */
  aprobarTransaccion(transaccion: Transaccion): void {
    if (!transaccion.id) {
      this.snackBar.open('Error: ID de transacción no válido', 'Cerrar', { duration: 3000 });
      return;
    }
    
    this.loading = true;
    this.transaccionService.aprobarTransaccion(transaccion.id).subscribe({
      next: () => {
        this.snackBar.open(
          'Transacción aprobada exitosamente',
          'Cerrar',
          { duration: 3000, panelClass: ['success-snackbar'] }
        );
        this.cargarTransacciones();
      },
      error: (error: any) => {
        this.snackBar.open(
          'Error al aprobar la transacción',
          'Cerrar',
          { duration: 3000, panelClass: ['error-snackbar'] }
        );
        console.error('Error al aprobar la transacción:', error);
      }
    });
  }

  /**
   * Rechaza una transacción
   */
  rechazarTransaccion(transaccion: Transaccion): void {
    this.transaccionService.rechazarTransaccion(transaccion.id).subscribe({
      next: () => {
        this.snackBar.open(
          'Transacción rechazada exitosamente',
          'Cerrar',
          { duration: 3000, panelClass: ['success-snackbar'] }
        );
        this.cargarTransacciones();
      },
      error: (error: any) => {
        this.snackBar.open(
          'Error al rechazar la transacción',
          'Cerrar',
          { duration: 3000, panelClass: ['error-snackbar'] }
        );
        console.error('Error al rechazar la transacción:', error);
      }
    });
  }

  /**
   * Elimina una transacción
   */
  eliminarTransaccion(transaccion: Transaccion): void {
    if (confirm('¿Está seguro de que desea eliminar esta transacción?')) {
      this.transaccionService.eliminarTransaccion(transaccion.id).subscribe({
        next: () => {
          this.snackBar.open(
            'Transacción eliminada exitosamente',
            'Cerrar',
            { duration: 3000, panelClass: ['success-snackbar'] }
          );
          this.cargarTransacciones();
        },
        error: (error: any) => {
          this.snackBar.open(
            'Error al eliminar la transacción',
            'Cerrar',
            { duration: 3000, panelClass: ['error-snackbar'] }
          );
          console.error('Error al eliminar la transacción:', error);
        }
      });
    }
  }
}
