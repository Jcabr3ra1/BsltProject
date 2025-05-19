import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Observable, Subscription, forkJoin } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { finalize, catchError } from 'rxjs/operators';

import { TransaccionService } from '../../services/transaccion.service';
import { AutoApproveService } from '../../services/auto-approve.service';
import { Transaccion } from '../../../../../../core/models/transaccion.model';
import { CrearTransaccionDialogComponent } from '../../shared/dialogs/crear-transaccion-dialog/crear-transaccion-dialog.component';
import { EditarTransaccionDialogComponent } from '../../shared/dialogs/editar-transaccion-dialog/editar-transaccion-dialog.component';

import { MovementTypeService } from '../../../type-of-movements/services/movement-type.service';
import { TipoTransaccionService } from '../../../type-of-transactions/services/tipo-transaccion.service';
import { CuentasService } from '../../../accounts/services/cuentas.service';
import { BolsillosService } from '../../../pockets/services/bolsillos.service';

import { TipoMovimiento } from '../../../../../../core/models/movement-type.model';
import { TipoTransaccion } from '../../../../../../core/models/tipo_transaccion.model';
import { Cuenta } from '../../../../../../core/models/cuenta.model';
import { Bolsillo } from '../../../../../../core/models/bolsillo.model';

@Component({
  selector: 'app-transaction-page',
  standalone: true,
  templateUrl: './transaction-page.component.html',
  styleUrls: ['./transaction-page.component.scss'],
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule,
    MatButtonToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatPaginatorModule,
    MatSnackBarModule,
    MatDividerModule,
    MatProgressSpinnerModule,
  ],
})
export class TransactionPageComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  // Referencia al paginador
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // DataSource para la tabla con paginación
  dataSource = new MatTableDataSource<Transaccion>([]);

  transacciones: Transaccion[] = [];
  displayedColumns: string[] = [
    'fecha_transaccion',
    'tipo_transaccion',
    'descripcion',
    'monto',
    'estado',
    'origen',
    'destino',
    'acciones',
  ];
  isLoading: boolean = false;
  private subscriptions = new Subscription();

  // Para la paginación personalizada
  pageSizeOptions: number[] = [5, 10, 25, 50];
  paginaActual: number = 0;
  tamanoActual: number = 10;

  usuarioResumen: {
    nombre: string;
    totalCuentas: number;
    totalBolsillos: number;
    cuentas: any[];
    bolsillos: any[];
  } | null = null;

  constructor(
    private transaccionService: TransaccionService,
    private movementTypeService: MovementTypeService,
    private tipoTransaccionService: TipoTransaccionService,
    private cuentasService: CuentasService,
    private bolsillosService: BolsillosService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private autoApproveService: AutoApproveService
  ) {}

  ngOnInit(): void {
    this.inicializarDatos();
    
    // Iniciar el servicio de aprobación automática
    const userId = JSON.parse(localStorage.getItem('user') || '{}')?.id;
    if (userId) {
      this.autoApproveService.startAutoApproveCheck(userId);
    }
  }

  ngAfterViewInit(): void {
    // Conectar el dataSource con el paginador después de que la vista esté inicializada
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void {
    // Asegurar que todas las suscripciones se cancelen al destruir el componente
    this.subscriptions.unsubscribe();
    
    // Detener el servicio de aprobación automática
    this.autoApproveService.stopAutoApproveCheck();
  }

  // Métodos para la paginación personalizada
  cambiarTamanoPagina(event: any): void {
    this.tamanoActual = event.value;
    this.paginaActual = 0;

    if (this.paginator) {
      this.paginator.pageSize = this.tamanoActual;
      this.paginator.pageIndex = 0;
    }
  }

  irAPrimeraPagina(): void {
    this.paginaActual = 0;
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  irAPaginaAnterior(): void {
    if (this.paginaActual > 0) {
      this.paginaActual--;
      if (this.paginator) {
        this.paginator.previousPage();
      }
    }
  }

  irAPaginaSiguiente(): void {
    if (this.paginaActual < this.getTotalPaginas() - 1) {
      this.paginaActual++;
      if (this.paginator) {
        this.paginator.nextPage();
      }
    }
  }

  irAUltimaPagina(): void {
    this.paginaActual = this.getTotalPaginas() - 1;
    if (this.paginator) {
      this.paginator.lastPage();
    }
  }

  puedeRetroceder(): boolean {
    return this.paginaActual > 0;
  }

  puedeAvanzar(): boolean {
    return this.paginaActual < this.getTotalPaginas() - 1;
  }

  getTotalPaginas(): number {
    return Math.ceil(this.transacciones.length / this.tamanoActual);
  }

  getInfoPaginacion(): string {
    if (this.transacciones.length === 0) return '0 - 0 de 0';

    const inicio = this.paginaActual * this.tamanoActual + 1;
    const fin = Math.min(
      (this.paginaActual + 1) * this.tamanoActual,
      this.transacciones.length
    );
    return `${inicio} - ${fin} de ${this.transacciones.length}`;
  }

  /**
   * Inicializa los datos de la página
   */
  inicializarDatos(): void {
    this.isLoading = true;
    this.cargarTransacciones();
    this.cargarResumenUsuario();
  }

  /**
   * Muestra una notificación al usuario
   */
  mostrarNotificacion(mensaje: string, duracion: number = 3000): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: duracion,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['snackbar-success'],
    });
  }

  /**
   * Aplica filtro a la tabla cuando el usuario escribe en el campo de búsqueda
   */
  aplicarFiltro(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
      this.paginaActual = 0;
    }
  }

  /**
   * Abre el diálogo para crear una nueva transacción
   */
  abrirCrear(): void {
    this.isLoading = true;

    // Cargar los datos necesarios para el diálogo usando Promise.all
    Promise.all([
      firstValueFrom(this.movementTypeService.getTiposMovimiento()),
      firstValueFrom(this.tipoTransaccionService.getTiposTransaccion()),
      firstValueFrom(this.cuentasService.getCuentas()),
      firstValueFrom(this.bolsillosService.getBolsillos()),
    ])
      .then((result) => {
        this.isLoading = false;
        const [tiposMovimiento, tiposTransaccion, cuentas, bolsillos] =
          result as [TipoMovimiento[], TipoTransaccion[], Cuenta[], Bolsillo[]];

        // Usar la configuración estándar de Angular Material para el diálogo
        const dialogRef = this.dialog.open(CrearTransaccionDialogComponent, {
          data: {
            tiposMovimiento,
            tiposTransaccion,
            cuentas,
            bolsillos,
          },
          width: '800px',
          panelClass: 'custom-dark-dialog',
          disableClose: true,
        });

        const dialogSub = dialogRef.afterClosed().subscribe((result) => {
          if (!result) return;
          
          console.log('Resultado del diálogo:', result);
          
          // La transacción ya fue creada en el diálogo, solo necesitamos actualizar los datos
          this.mostrarNotificacion('✅ Transacción registrada correctamente');
          
          // Recargar la lista de transacciones y el resumen del usuario
          // Añadimos un pequeño retraso para asegurar que el backend ha procesado la transacción
          setTimeout(() => {
            this.cargarTransacciones();
            this.cargarResumenUsuario();
            console.log('🔄 Actualizando datos después de crear transacción');
          }, 1000);
        });

        this.subscriptions.add(dialogSub);
      })
      .catch((error) => {
        this.isLoading = false;
        console.error('Error al cargar datos para el diálogo:', error);
        this.mostrarNotificacion(
          '❌ Error al cargar los datos necesarios para la transacción',
          5000
        );
      });
  }

  /**
   * Ejecuta una transacción según el tipo de origen y destino
   */
  ejecutarTransaccion(
    origen: string | undefined,
    destino: string | undefined,
    backendData: any
  ): void {
    let request$: Observable<any> | null = null;
    
    // Simplificamos la lógica para usar directamente el endpoint de crear transacción
    // que manejará los diferentes tipos de transacciones en el backend
    if (origen && destino) {
      backendData.tipo_origen = origen;
      backendData.tipo_destino = destino;
      
      // Preparamos los datos para la transacción
      const transaccionData: Partial<Transaccion> = {
        ...backendData,
        fecha_transaccion: new Date(),
        estado: 'PENDIENTE' // Las transacciones comienzan como pendientes
      };
      
      this.isLoading = true;
      // Usamos el método genérico para crear transacciones
      request$ = this.transaccionService.crearTransaccion(transaccionData as Transaccion);

      if (request$) {
        const transaccionSub = request$
          .pipe(
            finalize(() => (this.isLoading = false)),
            catchError((error) => {
              console.error('Error en la transacción:', error);
              this.mostrarNotificacion(
                `❌ Error: ${
                  error.error?.detail || 'No se pudo completar la transacción'
                }`,
                5000
              );
              throw error;
            })
          )
          .subscribe({
            next: (response) => {
              console.log('Transacción realizada:', response);
              // Notificación de éxito
              this.mostrarNotificacion('✅ Transacción realizada con éxito');
              // Recargar datos con un pequeño retraso para asegurar que el backend ha procesado la transacción
              setTimeout(() => {
                this.cargarTransacciones();
                this.cargarResumenUsuario();
              }, 1000);
            },
          });

        this.subscriptions.add(transaccionSub);
      } else {
        this.isLoading = false;
        this.mostrarNotificacion(
          '❌ No se pudo determinar el tipo de transacción.',
          5000
        );
      }
    } else {
      this.mostrarNotificacion(
        '❌ Faltan datos para la transacción: origen o destino no especificados.',
        5000
      );
    }
  }

  /**
   * Carga el resumen financiero del usuario
   */
  cargarResumenUsuario(): void {
    const rawUser = localStorage.getItem('user');
    const user = rawUser ? JSON.parse(rawUser) : null;

    if (!user || !user.id) {
      this.mostrarNotificacion('No hay usuario autenticado', 5000);
      return;
    }

    const esAdmin = user?.rol?.toUpperCase() === 'ADMIN';

    this.isLoading = true;
    console.log('🔄 Cargando resumen financiero del usuario...');

    // Usamos forkJoin para obtener cuentas y bolsillos en paralelo
    const resumenSub = forkJoin({
      cuentas: this.cuentasService.getCuentas(),
      bolsillos: this.bolsillosService.getBolsillos(),
    })
      .pipe(
        finalize(() => {
          this.isLoading = false;
          console.log('✅ Resumen financiero cargado');
        }),
        catchError((error) => {
          console.error('Error al cargar resumen financiero:', error);
          this.mostrarNotificacion(
            '❌ Error al cargar datos financieros',
            5000
          );
          throw error;
        })
      )
      .subscribe({
        next: ({ cuentas, bolsillos }) => {
          console.log('Cuentas recibidas:', cuentas);
          console.log('Bolsillos recibidos:', bolsillos);
          
          // Filtrar cuentas y bolsillos por usuario si no es admin
          if (!esAdmin) {
            cuentas = cuentas.filter(
              (c) => c.usuario_id === user.id || (c as any).id_usuario === user.id
            );

            // Filtrar bolsillos por usuario o por cuentas del usuario
            const idsCuentasUsuario = cuentas.map((c) => c.id || c._id);
            bolsillos = bolsillos.filter(
              (b) =>
                b.usuario_id === user.id ||
                idsCuentasUsuario.includes(b.id_cuenta)
            );
            
            console.log('Cuentas filtradas:', cuentas);
            console.log('Bolsillos filtrados:', bolsillos);
          }

          // Calcular totales
          const totalCuentas = cuentas.reduce(
            (acc, c) => acc + (typeof c.saldo === 'string' ? parseFloat(c.saldo) || 0 : (c.saldo || 0)),
            0
          );
          const totalBolsillos = bolsillos.reduce(
            (acc, b) => acc + (typeof b.saldo === 'string' ? parseFloat(b.saldo) || 0 : (b.saldo || 0)),
            0
          );

          console.log('Total cuentas:', totalCuentas);
          console.log('Total bolsillos:', totalBolsillos);

          this.usuarioResumen = {
            nombre: esAdmin ? 'Administrador' : user.nombre,
            totalCuentas: totalCuentas,
            totalBolsillos: totalBolsillos,
            cuentas,
            bolsillos,
          };
        },
      });

    this.subscriptions.add(resumenSub);
  }

  // Variable para controlar si ya hay una carga en progreso
  private cargaEnProgreso = false;
  
  /**
   * Carga las transacciones del usuario
   */
  cargarTransacciones(): void {
    // Evitar múltiples solicitudes simultáneas
    if (this.cargaEnProgreso) {
      console.log('Ya hay una carga de transacciones en progreso. Solicitud ignorada.');
      return;
    }
    
    const rawUser = localStorage.getItem('user');
    const user = rawUser ? JSON.parse(rawUser) : null;

    if (!user || !user.id) {
      this.mostrarNotificacion('No hay usuario autenticado', 5000);
      return;
    }

    const esAdmin = user?.rol?.toUpperCase() === 'ADMIN';

    this.isLoading = true;
    this.cargaEnProgreso = true;
    console.log('🔄 Cargando transacciones del usuario...');

    const request$ = esAdmin
      ? this.transaccionService.getTransacciones()
      : this.transaccionService.getTransaccionesPorUsuario(user.id);

    const transaccionesSub = request$
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cargaEnProgreso = false;
          console.log('✅ Transacciones cargadas');
        }),
        catchError((error) => {
          console.error('Error al cargar transacciones:', error);
          this.mostrarNotificacion(
            '❌ Error al cargar las transacciones',
            5000
          );
          throw error;
        })
      )
      .subscribe({
        next: (data) => {
          console.group('🔍 Depuración de carga de transacciones');
          console.log('💾 Transacciones recibidas:', data);
          
          // Mostrar detalles de cada transacción para depuración
          data.forEach((t, index) => {
            console.log(`Transacción ${index + 1}:`, {
              id: t.id || t._id,
              tipo: t.id_tipo_transaccion,
              estado: t.estado,
              origen: t.id_bolsillo_origen ? 'BOLSILLO' : (t.id_cuenta_origen ? 'CUENTA' : 'BANCO'),
              destino: t.id_bolsillo_destino ? 'BOLSILLO' : (t.id_cuenta_destino ? 'CUENTA' : 'BANCO'),
              monto: t.monto,
              fecha: t.fecha_transaccion
            });
          });
        
          // Filtrar transacciones ELIMINADAS y ANULADAS
          const transaccionesFiltradas = data.filter(t => {
            // Excluir transacciones con estado ELIMINADA o ANULADA
            const incluir = t.estado !== 'ELIMINADA' && t.estado !== 'ANULADA';
            if (!incluir) {
              console.log(`Excluyendo transacción ${t.id || t._id} con estado ${t.estado}`);
            }
            return incluir;
          });
          
          console.log(`🔎 Filtrando transacciones: ${data.length} totales, ${transaccionesFiltradas.length} activas`);
          console.groupEnd();
        
        // Ordenar transacciones por fecha (más recientes primero)
        this.transacciones = transaccionesFiltradas.sort((a, b) => {
          const fechaA = new Date(a.fecha_transaccion).getTime();
          const fechaB = new Date(b.fecha_transaccion).getTime();
          return fechaB - fechaA;
        });
          
          // Actualizar el dataSource
          this.dataSource.data = this.transacciones;
          
          // Configurar el paginador
          if (this.paginator) {
            this.dataSource.paginator = this.paginator;
          }
        },
      });

    this.subscriptions.add(transaccionesSub);
  }

  /**
   * Anula una transacción existente y la elimina de la lista
   */
  anularTransaccion(transaccion: Transaccion): void {
    const confirmacion = confirm('¿Estás seguro de anular esta transacción? El dinero será reintegrado a la cuenta de origen y la transacción será eliminada permanentemente.');
    const id = transaccion.id || transaccion._id;

    if (confirmacion && id) {
      this.isLoading = true;
      console.log('🔄 Anulando transacción:', id);
      console.log('Tipo de transacción:', transaccion.tipo_transaccion?.nombre);
      console.log('Monto:', transaccion.monto);
      console.log('Origen:', transaccion.id_cuenta_origen ? 'Cuenta' : 'Bolsillo');
      console.log('Destino:', transaccion.id_cuenta_destino ? 'Cuenta' : (transaccion.id_bolsillo_destino ? 'Bolsillo' : 'Externo'));
      
      // Primero, actualizar el estado de la transacción a ANULADA en la lista local
      // para dar feedback inmediato al usuario
      this.transacciones = this.transacciones.map(t => {
        const transId = t.id || t._id;
        if (transId === id) {
          return { ...t, estado: 'ANULADA' };
        }
        return t;
      });
      
      // Actualizar la tabla para mostrar la transacción como ANULADA
      this.dataSource.data = this.transacciones;
      
      // Forzamos una recarga inmediata para asegurarnos de tener los datos más recientes
      this.cargarResumenUsuario();
      
      // Llamamos al servicio para anular la transacción en el backend
      const anularSub = this.transaccionService
        .anularTransaccion(id)
        .pipe(
          finalize(() => {
            this.isLoading = false;
            console.log('✅ Proceso de anulación completado');
          }),
          catchError((error) => {
            console.error('Error al anular transacción:', error);
            this.mostrarNotificacion('❌ Error al anular la transacción', 5000);
            
            // Si hay error, revertimos el cambio de estado en la lista local
            this.transacciones = this.transacciones.map(t => {
              const transId = t.id || t._id;
              if (transId === id) {
                return { ...t, estado: transaccion.estado || 'PENDIENTE' };
              }
              return t;
            });
            this.dataSource.data = this.transacciones;
            
            throw error;
          })
        )
        .subscribe({
          next: (response) => {
            console.log('Respuesta de anulación:', response);
            
            // Mostrar notificación de éxito
            this.mostrarNotificacion('✅ Transacción anulada correctamente. El dinero ha sido reintegrado.');
            
            // Eliminamos inmediatamente la transacción de la lista local
            // para dar feedback inmediato al usuario
            this.transacciones = this.transacciones.filter(t => {
              const transId = t.id || t._id;
              return transId !== id;
            });
            
            // Actualizamos el dataSource
            this.dataSource.data = this.transacciones;
            
            // Notificamos al usuario sobre la anulación y reintegro
            this.mostrarNotificacion('Transacción anulada y dinero reintegrado correctamente', 2000);
            
            // Ahora intentamos eliminar permanentemente la transacción de la base de datos
            // usando el nuevo endpoint actualizado
            setTimeout(() => {
              console.log(`Intentando eliminar permanentemente la transacción con ID: ${id}`);
              this.transaccionService.eliminarTransaccionPermanente(id).subscribe({
                next: (response) => {
                  console.log('Transacción eliminada permanentemente:', response);
                  this.mostrarNotificacion('Transacción eliminada permanentemente de la base de datos', 2000);
                },
                error: (err) => {
                  console.error('Error al eliminar permanentemente la transacción:', err);
                  console.log('La transacción sigue en la base de datos marcada como ANULADA');
                  // No mostramos error al usuario ya que la transacción ya fue anulada y el dinero reintegrado
                }
              });
            }, 1000);
            
            // Actualizamos el resumen del usuario para mostrar los saldos actualizados
            setTimeout(() => {
              this.cargarResumenUsuario();
            }, 1500);
          },
        });

      this.subscriptions.add(anularSub);
    }
  }

  /**
   * Abre el diálogo para editar una transacción
   */
  abrirEditar(transaccion: Transaccion): void {
    const dialogRef = this.dialog.open(EditarTransaccionDialogComponent, {
      data: transaccion,
      width: '500px',
      panelClass: ['custom-dialog', 'custom-dark-dialog'],
    });

    const subscription = dialogRef.afterClosed().subscribe((data) => {
      if (data) {
        const id = data.id || data._id;
        if (id) {
          this.isLoading = true;
          const actualizarSub = this.transaccionService
            .actualizarTransaccion(id, data)
            .pipe(
              finalize(() => (this.isLoading = false)),
              catchError((error) => {
                console.error('Error al actualizar transacción:', error);
                this.mostrarNotificacion(
                  '❌ Error al actualizar la transacción',
                  5000
                );
                throw error;
              })
            )
            .subscribe({
              next: () => {
                this.mostrarNotificacion(
                  '✅ Transacción actualizada correctamente'
                );
                this.cargarTransacciones();
              },
            });

          this.subscriptions.add(actualizarSub);
        }
      }
    });

    this.subscriptions.add(subscription);
  }

  /**
   * Obtiene el nombre de origen para mostrar en la tabla
   */
  obtenerNombreOrigen(trans: Transaccion): string {
    // Usar el objeto si está disponible
    if (trans.cuenta_origen)
      return `Cuenta: ${trans.cuenta_origen.numero_cuenta}`;
    if (trans.bolsillo_origen)
      return `Bolsillo: ${trans.bolsillo_origen.nombre}`;
    
    // Si no hay objeto pero hay ID, usar el ID
    if (trans.id_cuenta_origen)
      return `Cuenta: ${trans.id_cuenta_origen}`;
    if (trans.id_bolsillo_origen)
      return `Bolsillo: ${trans.id_bolsillo_origen}`;
    
    // Si no hay origen, es una consignación desde el banco
    return 'Banco';
  }

  /**
   * Obtiene el nombre de destino para mostrar en la tabla
   */
  obtenerNombreDestino(trans: Transaccion): string {
    // Usar el objeto si está disponible
    if (trans.cuenta_destino)
      return `Cuenta: ${trans.cuenta_destino.numero_cuenta}`;
    if (trans.bolsillo_destino)
      return `Bolsillo: ${trans.bolsillo_destino.nombre}`;
    
    // Si no hay objeto pero hay ID, usar el ID
    if (trans.id_cuenta_destino)
      return `Cuenta: ${trans.id_cuenta_destino}`;
    if (trans.id_bolsillo_destino)
      return `Bolsillo: ${trans.id_bolsillo_destino}`;
    
    // Si no hay destino, es un retiro al banco
    return 'Banco';
  }
}
