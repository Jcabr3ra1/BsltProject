import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule, MatSelectChange } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { CrearBolsilloDialogComponent } from '../../shared/dialogs/crear-bolsillo-dialog/crear-bolsillo-dialog.component';
import { EditarBolsilloDialogComponent } from '../../shared/dialogs/editar-bolsillo-dialog/editar-bolsillo-dialog.component';
import { AsignarBolsilloDialogComponent } from '../../shared/dialogs/asignar-bolsillo-dialog/asignar-bolsillo-dialog.component';

import { BolsillosService } from '../../services/bolsillos.service';
import { Bolsillo } from '../../../../../../core/models/bolsillo.model';
import { CuentasService } from '../../../accounts/services/cuentas.service';
import { Cuenta } from '../../../../../../core/models/cuenta.model';

@Component({
  standalone: true,
  selector: 'app-pocket-page',
  templateUrl: './pocket-page.component.html',
  styleUrls: ['./pocket-page.component.css'],
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSnackBarModule
  ],
})
export class PocketPageComponent implements OnInit {
  bolsillos: Bolsillo[] = [];
  cuentas: Cuenta[] = [];
  cargando: boolean = true;
  dataSource = new MatTableDataSource<Bolsillo>([]);
  pageSizeOptions: number[] = [5, 10, 20, 25];
  paginaActual: number = 0;
  tamanoActual: number = 5;
  
  columnasTabla: string[] = [
    'nombre',
    'saldo',
    'color',
    'cuenta',
    'acciones',
  ];

  @ViewChild(MatPaginator) paginador!: MatPaginator;
  get paginator(): MatPaginator {
    return this.paginador;
  }

  constructor(
    private bolsillosService: BolsillosService,
    private cuentasService: CuentasService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  ngAfterViewInit() {
    if (this.paginador) {
      this.dataSource.paginator = this.paginador;
    }
  }

  getNombreColor(hex: string): string {
    const colores: { [key: string]: string } = {
      '#ff0000': 'Rojo',
      '#00ff00': 'Verde',
      '#0000ff': 'Azul',
      '#a46cf5': 'Morado',
      '#1976d2': 'Azul Oscuro',
      '#f44336': 'Rojo Intenso',
      '#4caf50': 'Verde Brillante',
      '#2196f3': 'Azul Brillante',
      '#ff9800': 'Naranja',
    };
  
    return colores[hex.toLowerCase()] || 'Color personalizado';
  }
  
  cargarDatos(): void {
    this.cargando = true;
    
    this.cuentasService.getCuentas().subscribe({
      next: (cuentas) => {
        this.cuentas = cuentas;
        this.cargarBolsillos();
      },
      error: (err) => {
        this.cargando = false;
      }
    });
  }

  mostrarNotificacion(mensaje: string, duracion: number = 3000): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: duracion,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['snackbar-success'],
    });
  }
  
  cargarBolsillos(): void {
    const rawUser = localStorage.getItem('user');
    const user = rawUser ? JSON.parse(rawUser) : null;
  
    if (!user?.id) {
      this.mostrarNotificacion('⚠️ No hay usuario autenticado', 5000);
      this.cargando = false;
      return;
    }
  
  const esAdmin = user.roles?.includes('ADMIN') || user.rol === 'ADMIN';
    this.bolsillosService.getBolsillos().subscribe({
      next: (bolsillos) => {
        if (esAdmin) {
          this.bolsillos = bolsillos;
          } else {
          this.bolsillos = bolsillos.filter((b) =>
            this.cuentas.some(
              (c) =>
                (c.id === b.id_cuenta || c._id === b.id_cuenta) &&
                c.usuario_id === user.id
            )
          );
          }
  
        this.dataSource.data = this.bolsillos;
        this.cargando = false;
  
        setTimeout(() => {
          if (this.paginador) {
            this.dataSource.paginator = this.paginador;
          }
        });
      },
      error: (error) => {
        this.mostrarNotificacion('❌ Error al cargar bolsillos', 5000);
        this.cargando = false;
      }
    });
  }
  
  getNumeroCuenta(id: string): string {
    const cuenta = this.cuentas.find(c => c.id === id || c._id === id);
  
    if (!cuenta) return 'Sin asignar';
  
    const tipoMap: Record<string, string> = {
      CUENTA_AHORRO: 'Cuenta de ahorro',
      CUENTA_CORRIENTE: 'Cuenta corriente',
      CUENTA_NOMINA: 'Cuenta nómina',
      OTRO: 'Otro'
    };
  
    const tipoNombre = tipoMap[cuenta.tipo] || cuenta.tipo || 'Tipo desconocido';
  
    return `${tipoNombre} - ${cuenta.numero_cuenta}`;
  }
  
  eliminarBolsillo(bolsillo: Bolsillo): void {
    const id = bolsillo.id || bolsillo._id;
    if (!id) {
      this.snackBar.open('ID de bolsillo no válido.', 'Cerrar', { duration: 3000 });
      return;
    }
  
    const confirmar = confirm('¿Estás seguro de eliminar este bolsillo? Se desasociará de la cuenta y se reintegrará el saldo.');
    if (!confirmar) return;
  
    this.cargando = true;
    this.bolsillosService.desasociarYEliminarBolsillo(id).subscribe({
      next: (res) => {
        this.snackBar.open(
          (res as { mensaje?: string })?.mensaje || 'Bolsillo eliminado y saldo reintegrado.',
          'Cerrar',
          { duration: 5000, panelClass: ['snackbar-success'] }
        );
        this.cargarDatos();
      },
      error: () => {
        this.snackBar.open('Error al eliminar el bolsillo o al desasociarlo de la cuenta.', 'Cerrar', { duration: 3000 });
        this.cargando = false;
      }
    });
  }
  
  abrirCrearBolsillo(): void {
    this.abrirCrear();
  }

  abrirCrear(): void {
    const dialogRef = this.dialog.open(CrearBolsilloDialogComponent, {
      width: '450px',
      panelClass: ['custom-dialog', 'custom-dark-dialog']
    });
  
    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado === true) {
        this.cargarDatos();
      }
    });
  }

  editarBolsillo(bolsillo: Bolsillo): void {
    this.abrirEditar(bolsillo);
  }

  abrirEditar(bolsillo: Bolsillo): void {
    const dialogRef = this.dialog.open(EditarBolsilloDialogComponent, {
      width: '450px',
      data: {
        id: bolsillo.id || bolsillo._id,
        nombre: bolsillo.nombre,
        color: bolsillo.color,
        saldo: bolsillo.saldo,
      },
      panelClass: ['custom-dialog', 'custom-dark-dialog']
    });

    dialogRef.afterClosed().subscribe((actualizado) => {
      if (actualizado && actualizado.id) {
        this.cargando = true;
        this.bolsillosService
          .actualizarBolsillo(actualizado.id, {
            nombre: actualizado.nombre,
            color: actualizado.color,
            saldo: actualizado.saldo,
          })
          .subscribe({
            next: () => this.cargarDatos(),
            error: (err) => {
              this.cargando = false;
            }
          });
      }
    });
  }

  abrirAsignar(bolsillo: Bolsillo): void {
    const dialogRef = this.dialog.open(AsignarBolsilloDialogComponent, {
      width: '450px',
      data: { id_bolsillo: bolsillo.id || bolsillo._id },
      panelClass: ['custom-dialog', 'custom-dark-dialog']
    });
  
    dialogRef.afterClosed().subscribe((asignado) => {
      if (asignado?.id_bolsillo && asignado?.id_cuenta) {
        this.cargando = true;
        this.bolsillosService.asignarBolsilloACuenta(asignado.id_bolsillo, asignado.id_cuenta)
          .subscribe({
            next: () => this.cargarDatos(),
            error: (err) => {
              this.cargando = false;
            }
          });
      }
    });
  }
  
  cambiarTamanoPagina(event: MatSelectChange): void {
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
    return Math.ceil(this.bolsillos.length / this.tamanoActual);
  }
  
  getInfoPaginacion(): string {
    if (this.bolsillos.length === 0) return '0 - 0 de 0';
    
    const inicio = this.paginaActual * this.tamanoActual + 1;
    const fin = Math.min((this.paginaActual + 1) * this.tamanoActual, this.bolsillos.length);
    return `${inicio} - ${fin} de ${this.bolsillos.length}`;
  }
}