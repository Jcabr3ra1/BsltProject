import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EstadoService } from '../../../core/services/seguridad/estado.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Estado } from '@core/models/seguridad/estado.model';

@Component({
  selector: 'app-estado',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatCheckboxModule
  ],
  templateUrl: './estado.component.html',
  styleUrls: ['./estado.component.scss']
})
export class EstadoComponent implements OnInit {
  estados: Estado[] = []; // Lista de estados obtenidos del backend
  estadoForm!: FormGroup; // Formulario reactivo
  editandoEstado: boolean = false; // Modo edición
  estadoSeleccionado: Estado | null = null; // Estado actualmente seleccionado para editar
  mostrarFormulario: boolean = false; // Controla la visibilidad del formulario
  displayedColumns: readonly string[] = ['nombre', 'acciones']; // Columnas para la tabla

  constructor(
    private readonly fb: FormBuilder,
    private readonly estadoService: EstadoService,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.obtenerEstados();
  }

  // Inicializar el formulario
  initForm(): void {
    this.estadoForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      activo: [true]
    });
  }

  // Obtener todos los estados desde el backend
  obtenerEstados(): void {
    console.log('Obteniendo estados...');
    this.estadoService.obtenerEstados().subscribe({
      next: (estados) => {
        console.log('Estados recibidos:', estados);
        this.estados = estados;
      },
      error: (err: Error) => {
        console.error('Error al obtener estados:', err);
        this.mostrarMensaje(`Error al obtener estados: ${err.message}`, 'error');
      }
    });
  }

  // Guardar o actualizar estado
  guardarEstado(): void {
    if (this.estadoForm.invalid) return;
    
    const estadoData = this.estadoForm.value;
    console.log('Datos del formulario:', estadoData);
    
    if (this.editandoEstado && this.estadoSeleccionado) {
      this.estadoService.actualizarEstado(this.estadoSeleccionado.id, estadoData).subscribe({
        next: () => {
          this.mostrarMensaje('Estado actualizado exitosamente', 'success');
          this.obtenerEstados();
          this.cancelarEdicion();
          this.mostrarFormulario = false;
        },
        error: (err: Error) => {
          console.error('Error al actualizar estado:', err);
          this.mostrarMensaje(`Error al actualizar estado: ${err.message}`, 'error');
        }
      });
    } else {
      this.estadoService.crearEstado(estadoData).subscribe({
        next: () => {
          this.mostrarMensaje('Estado creado exitosamente', 'success');
          this.obtenerEstados();
          this.estadoForm.reset();
          this.mostrarFormulario = false;
        },
        error: (err: Error) => {
          console.error('Error al crear estado:', err);
          this.mostrarMensaje(`Error al crear estado: ${err.message}`, 'error');
        }
      });
    }
  }

  // Cargar datos en el formulario para editar
  editarEstado(estado: Estado): void {
    this.estadoSeleccionado = estado;
    this.editandoEstado = true;
    this.estadoForm.patchValue({
      nombre: estado.nombre,
      descripcion: estado.descripcion || '',
      activo: estado.activo
    });
    this.mostrarFormulario = true;
  }

  // Cancelar edición
  cancelarEdicion(): void {
    this.estadoSeleccionado = null;
    this.editandoEstado = false;
    this.estadoForm.reset();
  }

  // Eliminar un estado
  eliminarEstado(id: string): void {
    if (confirm('¿Está seguro de eliminar este estado?')) {
      this.estadoService.eliminarEstado(id).subscribe({
        next: () => {
          this.mostrarMensaje('Estado eliminado exitosamente', 'success');
          this.obtenerEstados();
        },
        error: (err: Error) => {
          console.error('Error al eliminar estado:', err);
          this.mostrarMensaje(`Error al eliminar estado: ${err.message}`, 'error');
        }
      });
    }
  }

  // Método para mostrar mensajes
  mostrarMensaje(mensaje: string, tipo: 'success' | 'error'): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      panelClass: tipo === 'success' ? ['success-snackbar'] : ['error-snackbar']
    });
  }

  // Método para trackBy en listas
  trackById(index: number, estado: Estado): string {
    return estado.id;
  }
}
