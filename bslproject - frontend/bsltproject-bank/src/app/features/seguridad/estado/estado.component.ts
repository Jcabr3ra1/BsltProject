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
    MatIconModule
  ],
  templateUrl: './estado.component.html',
  styleUrls: ['./estado.component.scss']
})
export class EstadoComponent implements OnInit {
  estados: any[] = []; // 📌 Lista de estados obtenidos del backend
  estadoForm!: FormGroup; // 📌 Formulario reactivo
  editandoEstado: boolean = false; // 📌 Modo edición
  estadoSeleccionado: any = null; // 📌 Estado actualmente seleccionado para editar
  mostrarFormulario: boolean = false; // 📌 Controla la visibilidad del formulario

  constructor(
    private fb: FormBuilder,
    private estadoService: EstadoService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.obtenerEstados();
  }

  // ✅ Inicializar el formulario
  initForm() {
    this.estadoForm = this.fb.group({
      nombre: ['', Validators.required]
    });
  }

  // ✅ Obtener todos los estados desde el backend
  obtenerEstados() {
    this.estadoService.obtenerEstados().subscribe({
      next: (estados) => this.estados = estados,
      error: (err) => this.mostrarMensaje(`Error al obtener estados: ${err.message}`, 'error')
    });
  }

  // ✅ Guardar o actualizar estado
  guardarEstado() {
    if (this.estadoForm.invalid) return;
    
    const estadoData = this.estadoForm.value;
    if (this.editandoEstado) {
      this.estadoService.actualizarEstado(this.estadoSeleccionado.id, estadoData).subscribe({
        next: () => {
          this.mostrarMensaje('Estado actualizado exitosamente', 'success');
          this.obtenerEstados();
          this.cancelarEdicion();
        },
        error: (err) => this.mostrarMensaje(`Error al actualizar estado: ${err.message}`, 'error')
      });
    } else {
      this.estadoService.crearEstado(estadoData).subscribe({
        next: () => {
          this.mostrarMensaje('Estado creado exitosamente', 'success');
          this.obtenerEstados();
          this.estadoForm.reset();
        },
        error: (err) => this.mostrarMensaje(`Error al crear estado: ${err.message}`, 'error')
      });
    }
  }

  // ✅ Cargar datos en el formulario para editar
  editarEstado(estado: any) {
    this.estadoSeleccionado = estado;
    this.editandoEstado = true;
    this.estadoForm.patchValue(estado);
    this.mostrarFormulario = true;
  }

  // ✅ Cancelar edición
  cancelarEdicion() {
    this.editandoEstado = false;
    this.estadoSeleccionado = null;
    this.estadoForm.reset();
    this.mostrarFormulario = false;
  }

  // ✅ Eliminar un estado
  eliminarEstado(id: string) {
    if (confirm('¿Estás seguro de eliminar este estado?')) {
      this.estadoService.eliminarEstado(id).subscribe({
        next: () => {
          this.mostrarMensaje('Estado eliminado correctamente', 'success');
          this.obtenerEstados();
        },
        error: (err) => this.mostrarMensaje(`Error al eliminar estado: ${err.message}`, 'error')
      });
    }
  }

  // ✅ Método para mostrar mensajes
  mostrarMensaje(mensaje: string, tipo: 'success' | 'error') {
    this.snackBar.open(mensaje, 'Cerrar', { duration: 3000, panelClass: tipo });
  }
}
