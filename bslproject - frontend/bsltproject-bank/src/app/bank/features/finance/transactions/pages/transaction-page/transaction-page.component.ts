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
import { MatSelectModule, MatSelectChange } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { HttpErrorResponse } from '@angular/common/http';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Observable, Subscription, forkJoin, firstValueFrom } from 'rxjs';
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
  styleUrls: ['./transaction-page.component.css'],
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
  @ViewChild(MatPaginator) paginator!: MatPaginator;

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

  pageSizeOptions: number[] = [5, 10, 25, 50];
  paginaActual: number = 0;
  tamanoActual: number = 10;

  usuarioResumen: {
    nombre: string;
    totalCuentas: number;
    totalBolsillos: number;
    cuentas: Cuenta[];
    bolsillos: Bolsillo[];
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
    
    const userId = JSON.parse(localStorage.getItem('user') || '{}')?.id;
    if (userId) {
      this.autoApproveService.startAutoApproveCheck(userId);
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    
    this.autoApproveService.stopAutoApproveCheck();
  }

  cambiarTamanoPagina(event: MatSelectChange): void {
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

  
  inicializarDatos(): void {
    this.isLoading = true;
    this.cargarTransacciones();
    this.cargarResumenUsuario();
  }

  
  mostrarNotificacion(mensaje: string, duracion: number = 3000): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: duracion,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['snackbar-success'],
    });
  }

  
  aplicarFiltro(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
      this.paginaActual = 0;
    }
  }

  
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
          panelClass: 'custom-dark-dialog',
          disableClose: true,
        });

        const dialogSub = dialogRef.afterClosed().subscribe((result) => {
          if (!result) return;
          
          this.mostrarNotificacion('✅ Transacción registrada correctamente');
          
          setTimeout(() => {
            this.cargarTransacciones();
            this.cargarResumenUsuario();
            }, 1000);
        });

        this.subscriptions.add(dialogSub);
      })
      .catch((error) => {
        this.isLoading = false;
        this.mostrarNotificacion(
          '❌ Error al cargar los datos necesarios para la transacción',
          5000
        );
      });
  }

  
  ejecutarTransaccion(
    origen: string | undefined,
    destino: string | undefined,
    backendData: Partial<Transaccion> & { tipo_origen?: string; tipo_destino?: string }
  ): void {
    let request$: Observable<Transaccion> | null = null;
    
    if (origen && destino) {
      backendData.tipo_origen = origen;
      backendData.tipo_destino = destino;
      
      const transaccionData: Partial<Transaccion> = {
        ...backendData,
        fecha_transaccion: new Date().toISOString(),
        estado: 'PENDIENTE' // Las transacciones comienzan como pendientes
      };
      
      this.isLoading = true;
      request$ = this.transaccionService.crearTransaccion(transaccionData as Transaccion);

      if (request$) {
        const transaccionSub = request$
          .pipe(
            finalize(() => (this.isLoading = false)),
            catchError((error: HttpErrorResponse) => {
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
              this.mostrarNotificacion('✅ Transacción realizada con éxito');
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

  
  cargarResumenUsuario(): void {
    const rawUser = localStorage.getItem('user');
    const user = rawUser ? JSON.parse(rawUser) : null;

    if (!user || !user.id) {
      this.mostrarNotificacion('No hay usuario autenticado', 5000);
      return;
    }

    const esAdmin = user?.rol?.toUpperCase() === 'ADMIN';

    this.isLoading = true;
    const resumenSub = forkJoin({
      cuentas: this.cuentasService.getCuentas(),
      bolsillos: this.bolsillosService.getBolsillos(),
    })
      .pipe(
        finalize(() => {
          this.isLoading = false;
          }),
        catchError((error: HttpErrorResponse) => {
          this.mostrarNotificacion(
            '❌ Error al cargar datos financieros',
            5000
          );
          throw error;
        })
      )
      .subscribe({
        next: ({ cuentas, bolsillos }) => {
          if (!esAdmin) {
            cuentas = cuentas.filter(
              (c) => c.usuario_id === user.id || (c as Cuenta).usuario_id === user.id
            );

            const idsCuentasUsuario = cuentas.map((c) => c.id || c._id);
            bolsillos = bolsillos.filter(
              (b) =>
                b.usuario_id === user.id ||
                idsCuentasUsuario.includes(b.id_cuenta)
            );
            
            }

          const totalCuentas = cuentas.reduce(
            (acc, c) => acc + (typeof c.saldo === 'string' ? parseFloat(c.saldo) || 0 : (c.saldo || 0)),
            0
          );
          const totalBolsillos = bolsillos.reduce(
            (acc, b) => acc + (typeof b.saldo === 'string' ? parseFloat(b.saldo) || 0 : (b.saldo || 0)),
            0
          );

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

  private cargaEnProgreso = false;
  
  
  cargarTransacciones(): void {
    if (this.cargaEnProgreso) {
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
    const request$ = esAdmin
      ? this.transaccionService.getTransacciones()
      : this.transaccionService.getTransaccionesPorUsuario(user.id);

    const transaccionesSub = request$
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cargaEnProgreso = false;
          }),
        catchError((error: HttpErrorResponse) => {
          this.mostrarNotificacion(
            '❌ Error al cargar las transacciones',
            5000
          );
          throw error;
        })
      )
      .subscribe({
        next: (data) => {
          data.forEach((t, index) => {
            });
        
          const transaccionesFiltradas = data.filter(t => {
            const incluir = t.estado !== 'ELIMINADA' && t.estado !== 'ANULADA';
            if (!incluir) {
              }
            return incluir;
          });
          
        this.transacciones = transaccionesFiltradas.sort((a, b) => {
          const fechaA = new Date(a.fecha_transaccion).getTime();
          const fechaB = new Date(b.fecha_transaccion).getTime();
          return fechaB - fechaA;
        });
          
          this.dataSource.data = this.transacciones;
          
          if (this.paginator) {
            this.dataSource.paginator = this.paginator;
          }
        },
      });

    this.subscriptions.add(transaccionesSub);
  }

  
  anularTransaccion(transaccion: Transaccion): void {
    const confirmacion = confirm('¿Estás seguro de anular esta transacción? El dinero será reintegrado a la cuenta de origen y la transacción será eliminada permanentemente.');
    const id = transaccion.id || transaccion._id;

    if (confirmacion && id) {
      this.isLoading = true;
      this.transacciones = this.transacciones.map(t => {
        const transId = t.id || t._id;
        if (transId === id) {
          return { ...t, estado: 'ANULADA' };
        }
        return t;
      });
      
      this.dataSource.data = this.transacciones;
      
      this.cargarResumenUsuario();
      
      const anularSub = this.transaccionService
        .anularTransaccion(id)
        .pipe(
          finalize(() => {
            this.isLoading = false;
            }),
          catchError((error: HttpErrorResponse) => {
            this.mostrarNotificacion('❌ Error al anular la transacción', 5000);
            
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
            this.mostrarNotificacion('✅ Transacción anulada correctamente. El dinero ha sido reintegrado.');
            
            this.transacciones = this.transacciones.filter(t => {
              const transId = t.id || t._id;
              return transId !== id;
            });
            
            this.dataSource.data = this.transacciones;
            
            this.mostrarNotificacion('Transacción anulada y dinero reintegrado correctamente', 2000);
            
            setTimeout(() => {
              this.transaccionService.eliminarTransaccionPermanente(id).subscribe({
                next: (response) => {
                  this.mostrarNotificacion('Transacción eliminada permanentemente de la base de datos', 2000);
                },
                error: (err) => {
                }
              });
            }, 1000);
            
            setTimeout(() => {
              this.cargarResumenUsuario();
            }, 1500);
          },
        });

      this.subscriptions.add(anularSub);
    }
  }

  
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
              catchError((error: HttpErrorResponse) => {
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

  
  obtenerNombreOrigen(trans: Transaccion): string {
    if (trans.cuenta_origen)
      return `Cuenta: ${trans.cuenta_origen.numero_cuenta}`;
    if (trans.bolsillo_origen)
      return `Bolsillo: ${trans.bolsillo_origen.nombre}`;
    
    if (trans.id_cuenta_origen)
      return `Cuenta: ${trans.id_cuenta_origen}`;
    if (trans.id_bolsillo_origen)
      return `Bolsillo: ${trans.id_bolsillo_origen}`;
    
    return 'Banco';
  }

  
  obtenerNombreDestino(trans: Transaccion): string {
    if (trans.cuenta_destino)
      return `Cuenta: ${trans.cuenta_destino.numero_cuenta}`;
    if (trans.bolsillo_destino)
      return `Bolsillo: ${trans.bolsillo_destino.nombre}`;
    
    if (trans.id_cuenta_destino)
      return `Cuenta: ${trans.id_cuenta_destino}`;
    if (trans.id_bolsillo_destino)
      return `Bolsillo: ${trans.id_bolsillo_destino}`;
    
    return 'Banco';
  }
}
