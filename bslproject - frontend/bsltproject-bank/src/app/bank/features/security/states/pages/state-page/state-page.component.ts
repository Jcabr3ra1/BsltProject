import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableDataSource } from '@angular/material/table';

import { EstadosService } from '../../services/estados.service';
import { Estado } from '../../../../../../core/models/estado.model';
import { CrearEstadoDialogComponent } from '../../shared/dialogs/crear-estado-dialog/crear-estado-dialog.component';
import { EditarEstadoDialogComponent } from '../../shared/dialogs/editar-estado-dialog/editar-estado-dialog.component';

@Component({
  selector: 'app-state-page',
  standalone: true,
  templateUrl: './state-page.component.html',
  styleUrls: ['./state-page.component.scss'],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatSelectModule
  ],
})
export class EstadoPageComponent implements OnInit {
  estados: Estado[] = [];
  dataSource = new MatTableDataSource<Estado>([]);
  cargando: boolean = true;
  pageSizeOptions: number[] = [5, 10, 25, 50];
  paginaActual: number = 0;
  tamanoActual: number = 5;

  @ViewChild(MatPaginator) paginador!: MatPaginator;

  constructor(
    private estadosService: EstadosService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.obtenerEstados();
  }

  ngAfterViewInit() {
    if (this.paginador) {
      this.dataSource.paginator = this.paginador;
    }
  }

  obtenerEstados(): void {
    this.cargando = true;
    this.estadosService.getEstados().subscribe({
      next: (data) => {
        this.estados = data;
        this.dataSource.data = this.estados;
        this.cargando = false;
        
        // Actualizamos el paginador después de cargar los datos
        setTimeout(() => {
          if (this.paginador) {
            this.dataSource.paginator = this.paginador;
          }
        });
      },
      error: (error) => {
        console.error('❌ Error al obtener estados', error);
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
    return Math.ceil(this.estados.length / this.tamanoActual);
  }
  
  getInfoPaginacion(): string {
    if (this.estados.length === 0) return '0 - 0 de 0';
    
    const inicio = this.paginaActual * this.tamanoActual + 1;
    const fin = Math.min((this.paginaActual + 1) * this.tamanoActual, this.estados.length);
    return `${inicio} - ${fin} de ${this.estados.length}`;
  }

  abrirCrearEstado(): void {
    const dialogRef = this.dialog.open(CrearEstadoDialogComponent, {
      width: '450px',
      data: {},
      panelClass: ['custom-dialog', 'custom-dark-dialog']
    });

    dialogRef.afterClosed().subscribe((nuevoEstado: Estado) => {
      if (nuevoEstado) {
        this.estadosService
          .crearEstado(nuevoEstado)
          .subscribe(() => this.obtenerEstados());
      }
    });
  }

  abrirEditarEstado(estado: Estado): void {
    const dialogRef = this.dialog.open(EditarEstadoDialogComponent, {
      width: '450px',
      data: { estado },
      panelClass: ['custom-dialog', 'custom-dark-dialog']
    });
  
    dialogRef.afterClosed().subscribe((estadoActualizado: Estado) => {
      if (estadoActualizado) {
        this.estadosService.actualizarEstado(estado.id!, estadoActualizado).subscribe(() => this.obtenerEstados());
      }
    });
  }

  eliminarEstado(id: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar este estado?')) {
      this.estadosService.eliminarEstado(id).subscribe({
        next: () => {
          console.log('✅ Estado eliminado');
          this.obtenerEstados();
        },
        error: (error) => {
          console.error('❌ Error al eliminar estado', error);
        },
      });
    }
  }
}