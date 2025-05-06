import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableDataSource } from '@angular/material/table';

import { CuentasService } from '../../services/cuentas.service';
import { Cuenta } from '../../../../../../core/models/cuenta.model';

import { CrearCuentaDialogComponent } from '../../shared/dialogs/crear-cuenta-dialog/crear-cuenta-dialog.component';
import { EditarCuentaDialogComponent } from '../../shared/dialogs/editar-cuenta-dialog/editar-cuenta-dialog.component';
import { AsignarCuentaDialogComponent } from '../../shared/dialogs/asignar-cuenta-dialog/asignar-cuenta-dialog.component';

@Component({
  selector: 'app-account-page',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  templateUrl: './account-page.component.html',
  styleUrls: ['./account-page.component.scss'],
})
export class AccountPageComponent implements OnInit {
  cuentas: Cuenta[] = [];
  bolsillos: any[] = [];
  isAdmin: boolean = false;
  cargando: boolean = true;
  dataSource = new MatTableDataSource<Cuenta>([]);
  pageSizeOptions: number[] = [5, 10, 25, 50];
  paginaActual: number = 0;
  tamanoActual: number = 5;

  displayedColumns: string[] = [
    'tipo',
    'numero',
    'usuario',
    'saldo',
    'meta_ahorro',
    'color',
    'fecha',
    'tieneBolsillo',
    'acciones',
  ];

  @ViewChild(MatPaginator) paginador!: MatPaginator;

  constructor(
    private cuentasService: CuentasService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const roles = Array.isArray(user.roles)
      ? user.roles.map((r: any) => (typeof r === 'string' ? r : r.nombre))
      : [];
    this.isAdmin = roles.includes('ADMIN');

    this.cargarDatos();
  }

  ngAfterViewInit() {
    if (this.paginador) {
      this.dataSource.paginator = this.paginador;
    }
  }

  cargarDatos(): void {
    this.cargando = true;

    const rawUser = localStorage.getItem('user');
    const user = rawUser ? JSON.parse(rawUser) : null;

    if (!user) {
      console.warn('⚠️ No hay usuario autenticado');
      this.cargando = false;
      return;
    }

    const cuentas$ = this.isAdmin
      ? this.cuentasService.getCuentas()
      : this.cuentasService.getCuentasPorUsuario(user.id);

    forkJoin({
      cuentas: cuentas$,
      usuarios: this.cuentasService.getUsuarios(),
      bolsillos: this.cuentasService.getBolsillos(),
    }).subscribe({
      next: ({ cuentas, usuarios, bolsillos }) => {
        this.cuentas = cuentas.map((cuenta) => {
          const usuario = usuarios.find((u) => u.id === cuenta.usuario_id);
          const tieneBolsillo = bolsillos.some(
            (b) => b.id_cuenta === cuenta.id || b.id_cuenta === cuenta._id
          );

          return {
            ...cuenta,
            id: cuenta.id,
            usuarioNombre: usuario
              ? `${usuario.nombre} ${usuario.apellido}`
              : undefined,
            tieneBolsillo,
            fecha_creacion: cuenta.createdAt
              ? new Date(cuenta.createdAt)
              : undefined,
          };
        });

        this.dataSource.data = this.cuentas;
        this.cargando = false;

        setTimeout(() => {
          if (this.paginador) {
            this.dataSource.paginator = this.paginador;
          }
        });
      },
      error: (error) => {
        console.error('❌ Error al cargar datos:', error);
        this.cargando = false;
      },
    });
  }

  cambiarTamanoPagina(event: any): void {
    this.tamanoActual = event.value;
    this.paginaActual = 0;

    if (this.paginador) {
      this.paginador.pageSize = this.tamanoActual;
      this.paginador.pageIndex = 0;
    }
  }

  irAPrimeraPagina(): void {
    this.paginaActual = 0;
    if (this.paginador) {
      this.paginador.firstPage();
    }
  }

  irAPaginaAnterior(): void {
    if (this.paginaActual > 0) {
      this.paginaActual--;
      if (this.paginador) {
        this.paginador.previousPage();
      }
    }
  }

  irAPaginaSiguiente(): void {
    if (this.paginaActual < this.getTotalPaginas() - 1) {
      this.paginaActual++;
      if (this.paginador) {
        this.paginador.nextPage();
      }
    }
  }

  irAUltimaPagina(): void {
    this.paginaActual = this.getTotalPaginas() - 1;
    if (this.paginador) {
      this.paginador.lastPage();
    }
  }

  puedeRetroceder(): boolean {
    return this.paginaActual > 0;
  }

  puedeAvanzar(): boolean {
    return this.paginaActual < this.getTotalPaginas() - 1;
  }

  getTotalPaginas(): number {
    return Math.ceil(this.cuentas.length / this.tamanoActual);
  }

  getInfoPaginacion(): string {
    if (this.cuentas.length === 0) return '0 - 0 de 0';

    const inicio = this.paginaActual * this.tamanoActual + 1;
    const fin = Math.min(
      (this.paginaActual + 1) * this.tamanoActual,
      this.cuentas.length
    );
    return `${inicio} - ${fin} de ${this.cuentas.length}`;
  }

  abrirFormularioCuenta(): void {
    const dialogRef = this.dialog.open(CrearCuentaDialogComponent, {
      width: '450px',
      panelClass: ['custom-dialog', 'custom-dark-dialog'],
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        this.cargando = true;
        this.cuentasService.crearCuenta(resultado).subscribe({
          next: () => {
            this.cargarDatos();
          },
          error: (error) => {
            console.error('❌ Error al crear cuenta:', error);
            this.cargando = false;
          },
        });
      }
    });
  }

  editarCuenta(cuenta: Cuenta): void {
    const dialogRef = this.dialog.open(EditarCuentaDialogComponent, {
      width: '450px',
      data: cuenta,
      panelClass: ['custom-dialog', 'custom-dark-dialog'],
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        this.cargando = true;
        this.cargarDatos();
      }
    });
  }

  eliminarCuenta(cuenta: Cuenta): void {
    const cuentaId = cuenta._id || cuenta.id;
    const usuarioId = cuenta.usuario_id;

    if (!cuentaId) {
      console.warn('❌ No se pudo eliminar la cuenta. ID inválido:', cuentaId);
      return;
    }

    const confirmar = confirm(
      `¿Deseas eliminar la cuenta con número ${cuenta.numero_cuenta}?`
    );
    if (!confirmar) return;

    this.cargando = true;
    const eliminar = () => {
      this.cuentasService.eliminarCuenta(cuentaId).subscribe({
        next: () => this.cargarDatos(),
        error: (err) => {
          console.error('❌ Error al eliminar la cuenta:', err);
          this.cargando = false;
        },
      });
    };

    if (usuarioId) {
      this.cuentasService
        .desasociarCuentaDeUsuario(usuarioId, cuentaId)
        .subscribe({
          next: () => eliminar(),
          error: (err) => {
            console.error('⚠️ Error al desasociar cuenta del usuario:', err);
            alert('No se pudo desasociar la cuenta del usuario');
            this.cargando = false;
          },
        });
    } else {
      eliminar();
    }
  }

  asignarCuenta(cuenta: Cuenta): void {
    const dialogRef = this.dialog.open(AsignarCuentaDialogComponent, {
      width: '450px',
      data: cuenta,
      panelClass: ['custom-dialog', 'custom-dark-dialog'],
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        this.cargando = true;
        this.cargarDatos();
      }
    });
  }

  obtenerNombreTipo(tipo: string): string {
    const tiposLegibles: Record<string, string> = {
      CUENTA_AHORRO: 'Cuenta de ahorro',
      CUENTA_CORRIENTE: 'Cuenta corriente',
      CUENTA_NOMINA: 'Cuenta nómina',
      OTRO: 'Otro',
    };
    return tiposLegibles[tipo] || tipo;
  }
}
