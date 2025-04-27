import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';

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
  ],
})
export class EstadoPageComponent implements OnInit {
  estados: Estado[] = [];
  cargando: boolean = true;

  constructor(
    private estadosService: EstadosService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.obtenerEstados();
  }

  obtenerEstados(): void {
    this.cargando = true;
    this.estadosService.getEstados().subscribe({
      next: (data) => {
        this.estados = data;
        this.cargando = false;
      },
      error: (error) => {
        console.error('❌ Error al obtener estados', error);
        this.cargando = false;
      },
    });
  }

  abrirCrearEstado(): void {
    const dialogRef = this.dialog.open(CrearEstadoDialogComponent, {
      width: '400px',
      data: {},
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
      width: '400px',
      data: { estado }
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
