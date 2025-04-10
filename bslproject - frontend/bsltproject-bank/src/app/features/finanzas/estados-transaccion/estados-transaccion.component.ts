import { Component, OnInit } from '@angular/core';
import { EstadoTransaccion } from '@core/models/finanzas/estado-transaccion.model';
import { EstadoTransaccionService } from '@core/services/finanzas/estado-transaccion.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-estados-transaccion',
  templateUrl: './estados-transaccion.component.html',
  styleUrls: ['./estados-transaccion.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatSnackBarModule]
})
export class EstadosTransaccionComponent implements OnInit {
  estados: EstadoTransaccion[] = [];
  cargando = false;
  error = '';

  constructor(
    private estadoTransaccionService: EstadoTransaccionService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.cargarEstados();
  }

  cargarEstados(): void {
    this.cargando = true;
    this.error = '';
    
    this.estadoTransaccionService.obtenerEstadosTransaccion().subscribe({
      next: (estados) => {
        this.estados = estados;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar estados de transacción:', err);
        this.error = 'Error al cargar estados de transacción';
        this.cargando = false;
      }
    });
  }

  inicializarEstadosPredeterminados(): void {
    this.cargando = true;
    this.error = '';
    
    this.estadoTransaccionService.inicializarEstadosPredeterminados().subscribe({
      next: (resultado) => {
        this.snackBar.open('Estados de transacción inicializados correctamente', 'Cerrar', {
          duration: 3000
        });
        this.cargarEstados();
      },
      error: (err) => {
        console.error('Error al inicializar estados de transacción:', err);
        this.error = 'Error al inicializar estados de transacción';
        this.cargando = false;
        this.snackBar.open('Error al inicializar estados de transacción', 'Cerrar', {
          duration: 3000
        });
      }
    });
  }
}
