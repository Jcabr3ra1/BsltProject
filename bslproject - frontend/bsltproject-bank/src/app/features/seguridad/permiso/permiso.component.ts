import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PermisoService } from '../../../core/services/seguridad/permiso.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-permiso',
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
    MatSelectModule
  ],
  templateUrl: './permiso.component.html',
  styleUrls: ['./permiso.component.scss']
})
export class PermisoComponent implements OnInit {
  permisoForm!: FormGroup;
  asignacionForm!: FormGroup;
  permisos: any[] = [];
  roles: any[] = [];
  editandoPermiso: boolean = false;
  permisoSeleccionado: any = null;
  mostrarFormulario: boolean = false;
  mostrarAsignacion: boolean = false;

  constructor(
    private fb: FormBuilder,
    private permisoService: PermisoService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.cargarDatos();
  }

  // ✅ Inicializar Formularios
  initForms() {
    this.permisoForm = this.fb.group({
      nombre: ['', Validators.required]
    });

    this.asignacionForm = this.fb.group({
      rolId: ['', Validators.required],
      permisoId: ['', Validators.required]
    });
  }

  // ✅ Cargar datos de permisos y roles
  cargarDatos() {
    this.obtenerPermisos();
    this.obtenerRoles();
  }

  obtenerPermisos() {
    this.permisoService.obtenerPermisos().subscribe({
      next: (permisos) => (this.permisos = permisos),
      error: () => this.mostrarMensaje('Error al obtener permisos', 'error')
    });
  }

  obtenerRoles() {
    this.permisoService.obtenerRoles().subscribe({
      next: (roles) => (this.roles = roles),
      error: () => this.mostrarMensaje('Error al obtener roles', 'error')
    });
  }

  // ✅ Guardar o Actualizar Permiso
  guardarPermiso() {
    if (this.permisoForm.invalid) return;

    const permisoData = this.permisoForm.value;
    if (this.editandoPermiso) {
      this.permisoService.actualizarPermiso(this.permisoSeleccionado.id, permisoData).subscribe({
        next: () => {
          this.mostrarMensaje('Permiso actualizado', 'success');
          this.obtenerPermisos();
          this.cancelarEdicion();
        },
        error: () => this.mostrarMensaje('Error al actualizar', 'error')
      });
    } else {
      this.permisoService.crearPermiso(permisoData).subscribe({
        next: () => {
          this.mostrarMensaje('Permiso creado', 'success');
          this.obtenerPermisos();
          this.permisoForm.reset();
        },
        error: () => this.mostrarMensaje('Error al crear', 'error')
      });
    }
  }

  // ✅ Asignar Permiso a Rol (CORREGIDO)
  asignarPermiso() {
    if (this.asignacionForm.invalid) return;
  
    const permisoId = this.asignacionForm.value.permisoId;
    const rolId = this.asignacionForm.value.rolId;
  
    console.log(`Asignando permiso: ${permisoId} al rol: ${rolId}`);

    // 🔥 CORREGIDO: Orden correcto (primero permiso, luego rol)
    this.permisoService.asignarPermisoARol(permisoId, rolId).subscribe({
      next: () => {
        this.mostrarMensaje('Permiso asignado correctamente', 'success');
        this.obtenerPermisos(); // Recargar permisos
      },
      error: (err) => {
        console.error('Error en asignación:', err);
        this.mostrarMensaje('Error al asignar permiso', 'error');
      }
    });
  }
  
  // ✅ Editar Permiso
  editarPermiso(permiso: any) {
    this.permisoSeleccionado = permiso;
    this.editandoPermiso = true;
    this.mostrarFormulario = true;
    this.permisoForm.patchValue(permiso);
  }

  // ✅ Cancelar Edición
  cancelarEdicion() {
    this.editandoPermiso = false;
    this.permisoSeleccionado = null;
    this.permisoForm.reset();
    this.mostrarFormulario = false;
  }

  // ✅ Eliminar Permiso
  eliminarPermiso(id: string) {
    if (confirm('¿Estás seguro de eliminar este permiso?')) {
      this.permisoService.eliminarPermiso(id).subscribe({
        next: () => {
          this.mostrarMensaje('Permiso eliminado', 'success');
          this.obtenerPermisos();
        },
        error: () => this.mostrarMensaje('Error al eliminar', 'error')
      });
    }
  }

  mostrarMensaje(mensaje: string, tipo: 'success' | 'error') {
    this.snackBar.open(mensaje, 'Cerrar', { duration: 3000, panelClass: tipo });
  }
}
