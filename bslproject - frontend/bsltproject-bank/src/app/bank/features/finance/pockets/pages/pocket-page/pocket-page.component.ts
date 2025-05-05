import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableDataSource } from '@angular/material/table';

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
  styleUrls: ['./pocket-page.component.scss'],
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
    MatSelectModule
  ],
})
export class PocketPageComponent implements OnInit {
  bolsillos: Bolsillo[] = [];
  cuentas: Cuenta[] = [];
  cargando: boolean = true;
  dataSource = new MatTableDataSource<Bolsillo>([]);
  pageSizeOptions: number[] = [5, 10, 25];
  paginaActual: number = 0;
  tamanoActual: number = 5;
  
  displayedColumns: string[] = [
    'nombre',
    'color',
    'saldo',
    'id_cuenta',
    'acciones',
  ];

  @ViewChild(MatPaginator) paginador!: MatPaginator;

  constructor(
    private bolsillosService: BolsillosService,
    private cuentasService: CuentasService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  ngAfterViewInit() {
    if (this.paginador) {
      this.dataSource.paginator = this.paginador;
    }
  }

  cargarDatos(): void {
    this.cargando = true;
    
    // Cargamos cuentas y bolsillos
    this.cuentasService.getCuentas().subscribe({
      next: (cuentas) => {
        this.cuentas = cuentas;
        this.cargarBolsillos();
      },
      error: (err) => {
        console.error('Error al obtener cuentas', err);
        this.cargando = false;
      }
    });
  }

  cargarBolsillos(): void {
    this.bolsillosService.getBolsillos().subscribe({
      next: (data) => {
        this.bolsillos = data;
        this.dataSource.data = this.bolsillos;
        this.cargando = false;
        
        // Actualizamos el paginador después de cargar los datos
        setTimeout(() => {
          if (this.paginador) {
            this.dataSource.paginator = this.paginador;
          }
        });
      },
      error: (err) => {
        console.error('Error al obtener bolsillos', err);
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
  
  eliminarBolsillo(id: string): void {
    if (!id) {
      alert('ID de bolsillo no válido.');
      return;
    }
  
    const confirmar = confirm('¿Estás seguro de eliminar este bolsillo? Se desasociará de la cuenta si existe.');
    if (!confirmar) return;
  
    this.cargando = true;
    this.bolsillosService.desasociarYEliminarBolsillo(id).subscribe({
      next: () => this.cargarDatos(),
      error: () => {
        alert('❌ Error al eliminar el bolsillo o al desasociarlo de la cuenta.');
        this.cargando = false;
      }
    });
  }

  abrirCrear(): void {
    const dialogRef = this.dialog.open(CrearBolsilloDialogComponent, {
      width: '450px',
      panelClass: ['custom-dialog', 'custom-dark-dialog']
    });

    dialogRef.afterClosed().subscribe((nuevoBolsillo) => {
      if (nuevoBolsillo) {
        this.cargando = true;
        this.bolsillosService.crearBolsillo(nuevoBolsillo).subscribe({
          next: () => this.cargarDatos(),
          error: (err) => {
            console.error('Error al crear bolsillo', err);
            this.cargando = false;
          }
        });
      }
    });
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
              console.error('Error al actualizar bolsillo', err);
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
              console.error('Error al asignar bolsillo', err);
              this.cargando = false;
            }
          });
      }
    });
  }
  
  // Funciones de paginación
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
    return Math.ceil(this.bolsillos.length / this.tamanoActual);
  }
  
  getInfoPaginacion(): string {
    if (this.bolsillos.length === 0) return '0 - 0 de 0';
    
    const inicio = this.paginaActual * this.tamanoActual + 1;
    const fin = Math.min((this.paginaActual + 1) * this.tamanoActual, this.bolsillos.length);
    return `${inicio} - ${fin} de ${this.bolsillos.length}`;
  }
}