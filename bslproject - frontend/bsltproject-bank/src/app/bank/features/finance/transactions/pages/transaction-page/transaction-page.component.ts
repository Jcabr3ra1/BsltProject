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
    MatProgressSpinnerModule
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
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.inicializarDatos();
  }

  ngAfterViewInit(): void {
    // Conectar el dataSource con el paginador después de que la vista esté inicializada
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void {
    // Asegurar que todas las suscripciones se cancelen al destruir el componente
    this.subscriptions.unsubscribe();
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
    const fin = Math.min((this.paginaActual + 1) * this.tamanoActual, this.transacciones.length);
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
      panelClass: ['snackbar-success']
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

        const dialogRef = this.dialog.open(CrearTransaccionDialogComponent, {
          data: {
            tiposMovimiento,
            tiposTransaccion,
            cuentas,
            bolsillos,
          },
          width: '800px',
          maxWidth: '90vw',
          panelClass: ['custom-dialog', 'custom-dark-dialog'],
          disableClose: true,
        });

        const dialogSub = dialogRef.afterClosed().subscribe((data) => {
          if (!data) return;

          // ✅ Adjuntar el id_usuario antes de enviar
          const user = JSON.parse(localStorage.getItem('user')!);
          if (!user?.id) {
            console.warn('⚠️ No hay ID de usuario autenticado');
            return;
          }
          data.id_usuario = user.id;

          const tipo = tiposMovimiento.find(
            (t) =>
              t.id === data.id_tipo_movimiento ||
              t._id === data.id_tipo_movimiento
          );
          const origen = tipo?.codigo_origen?.toUpperCase();
          const destino = tipo?.codigo_destino?.toUpperCase();

          // Adaptando los nombres de campos al formato backend
          const backendData = {
            cuentaOrigenId: data.id_cuenta_origen,
            cuentaDestinoId: data.id_cuenta_destino,
            bolsilloOrigenId: data.id_bolsillo_origen,
            bolsilloDestinoId: data.id_bolsillo_destino,
            tipoMovimientoId: data.id_tipo_movimiento,
            tipoTransaccionId: data.id_tipo_transaccion,
            monto: data.monto,
            descripcion: data.descripcion,
          };

          this.ejecutarTransaccion(origen, destino, backendData);
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

    if (origen === 'ACCOUNT' && destino === 'ACCOUNT') {
      request$ = this.transaccionService.transferenciaCuentaCuenta(backendData);
    } else if (origen === 'ACCOUNT' && destino === 'WALLET') {
      request$ =
        this.transaccionService.transferenciaCuentaBolsillo(backendData);
    } else if (origen === 'WALLET' && destino === 'ACCOUNT') {
      request$ =
        this.transaccionService.transferenciaBolsilloCuenta(backendData);
    } else if (origen === 'BANK' && destino === 'ACCOUNT') {
      request$ = this.transaccionService.consignacionBancoCuenta(backendData);
    } else if (origen === 'BANK' && destino === 'WALLET') {
      request$ = this.transaccionService.consignacionBancoBolsillo(backendData);
    } else if (origen === 'ACCOUNT' && destino === 'BANK') {
      request$ = this.transaccionService.retiroCuentaBanco(backendData);
    } else if (origen === 'WALLET' && destino === 'BANK') {
      request$ = this.transaccionService.retiroBolsilloBanco(backendData);
    } else if (origen === 'WALLET' && destino === 'WALLET') {
      request$ =
        this.transaccionService.transferenciaBolsilloBolsillo(backendData);
    }

    if (request$) {
      this.isLoading = true;
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
            // Recargar datos
            setTimeout(() => {
              this.cargarTransacciones();
              this.cargarResumenUsuario();
            }, 500);
          },
        });

      this.subscriptions.add(transaccionSub);
    } else {
      this.mostrarNotificacion(
        '❌ No se pudo determinar el tipo de transacción.',
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
  
    if (!user?.id) {
      this.mostrarNotificacion('⚠️ No hay usuario autenticado', 5000);
      return;
    }
  
    const esAdmin = user.rol === 'ADMIN';
  
    this.isLoading = true;
  
    const resumenSub = forkJoin({
      cuentas: this.cuentasService.getCuentas(),
      bolsillos: this.bolsillosService.getBolsillos(),
    })
      .pipe(
        finalize(() => (this.isLoading = false)),
        catchError((error) => {
          console.error('Error al cargar resumen:', error);
          this.mostrarNotificacion(
            '❌ Error al cargar el resumen financiero',
            5000
          );
          throw error;
        })
      )
      .subscribe({
        next: ({ cuentas, bolsillos }) => {
          const cuentasAsignadas = esAdmin
            ? cuentas
            : cuentas.filter((c) => c.usuario_id === user.id);
            
          const bolsillosAsignados = esAdmin
            ? bolsillos
            : bolsillos.filter((b) => cuentasAsignadas.some(c => c.id === b.id_cuenta || c._id === b.id_cuenta));
  
          const totalCuentas = cuentasAsignadas.reduce(
            (acc, c) => acc + (c.saldo || 0),
            0
          );
  
          const totalBolsillos = bolsillosAsignados.reduce(
            (acc, b) => acc + (b.saldo || 0),
            0
          );
  
          this.usuarioResumen = {
            nombre: esAdmin ? 'Administrador' : `${user.nombre} ${user.apellido || ''}`,
            totalCuentas,
            totalBolsillos,
            cuentas: cuentasAsignadas,
            bolsillos: bolsillosAsignados,
          };
        },
      });
  
    this.subscriptions.add(resumenSub);
  }

  /**
   * Carga las transacciones del usuario
   */
  cargarTransacciones(): void {
    const rawUser = localStorage.getItem('user');
    const user = rawUser ? JSON.parse(rawUser) : null;
  
    if (!user?.id) {
      console.warn('⚠️ No se pudo obtener el ID de usuario desde localStorage');
      this.mostrarNotificacion('⚠️ No hay usuario autenticado', 5000);
      return;
    }
  
    const esAdmin = user.rol === 'ADMIN'; // o el campo real que uses para el rol
  
    this.isLoading = true;
    const request$ = esAdmin
      ? this.transaccionService.getTransacciones()
      : this.transaccionService.getTransaccionesPorUsuario(user.id);
  
    const transaccionesSub = request$
      .pipe(
        finalize(() => (this.isLoading = false)),
        catchError((error) => {
          console.error('Error al cargar transacciones:', error);
          this.mostrarNotificacion('❌ Error al cargar las transacciones', 5000);
          throw error;
        })
      )
      .subscribe({
        next: (data) => {
          this.transacciones = data;
          this.dataSource = new MatTableDataSource<Transaccion>(data);
          if (this.paginator) this.dataSource.paginator = this.paginator;
        },
      });
  
    this.subscriptions.add(transaccionesSub);
  }
  

  /**
   * Anula una transacción existente
   */
  anularTransaccion(transaccion: Transaccion): void {
    const confirmacion = confirm('¿Estás seguro de anular esta transacción?');
    const id = transaccion.id || transaccion._id;

    if (confirmacion && id) {
      this.isLoading = true;
      const anularSub = this.transaccionService
        .anularTransaccion(id)
        .pipe(
          finalize(() => (this.isLoading = false)),
          catchError((error) => {
            console.error('Error al anular transacción:', error);
            this.mostrarNotificacion('❌ Error al anular la transacción', 5000);
            throw error;
          })
        )
        .subscribe({
          next: () => {
            this.mostrarNotificacion('✅ Transacción anulada correctamente');
            this.cargarTransacciones();
            this.cargarResumenUsuario();
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
    if (trans.cuenta_origen)
      return `Cuenta: ${trans.cuenta_origen.numero_cuenta}`;
    if (trans.bolsillo_origen)
      return `Bolsillo: ${trans.bolsillo_origen.nombre}`;
    return 'Banco';
  }

  /**
   * Obtiene el nombre de destino para mostrar en la tabla
   */
  obtenerNombreDestino(trans: Transaccion): string {
    if (trans.cuenta_destino)
      return `Cuenta: ${trans.cuenta_destino.numero_cuenta}`;
    if (trans.bolsillo_destino)
      return `Bolsillo: ${trans.bolsillo_destino.nombre}`;
    return 'Banco';
  }
}