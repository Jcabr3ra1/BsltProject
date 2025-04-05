import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RolService } from '../../../core/services/seguridad/rol.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { firstValueFrom } from 'rxjs';
import { ModalPermisosComponent } from '../../../shared/components/modals/modal-permisos/modal-permisos.component';

interface Rol {
  id: string;
  nombre: string;
  descripcion?: string;
  permisos: Permiso[];
}

interface Permiso {
  id: string;
  nombre: string;
  descripcion?: string;
}

@Component({
  selector: 'app-rol',
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
    MatSelectModule,
    MatMenuModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatExpansionModule
  ],
  templateUrl: './rol.component.html',
  styleUrls: ['./rol.component.scss'],
})
export class RolComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  roles: Rol[] = [];
  rolForm!: FormGroup;
  editandoRol: boolean = false;
  rolSeleccionado: Rol | null = null;
  displayedColumns: string[] = ['nombre', 'descripcion', 'permisos', 'acciones'];
  mostrarFormulario: boolean = false;
  cargando: boolean = false;
  filtroTexto: string = '';
  
  constructor(
    private readonly fb: FormBuilder,
    private readonly rolService: RolService,
    private readonly snackBar: MatSnackBar,
    public readonly dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.obtenerRoles();
  }

  initForm(): void {
    this.rolForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['']
    });
  }

  obtenerRoles(): void {
    this.cargando = true;
    this.rolService.obtenerRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
        this.cargando = false;
        this.cargarPermisosParaRoles();
      },
      error: (err) => {
        this.mostrarMensaje(`Error al obtener roles: ${err.message}`, 'error');
        this.cargando = false;
      }
    });
  }

  cargarPermisosParaRoles(): void {
    // Cargar los permisos para cada rol
    for (const rol of this.roles) {
      if (!rol.permisos || rol.permisos.length === 0) {
        console.log(`Cargando permisos para rol: ${rol.nombre} (ID: ${rol.id})`);
        this.rolService.obtenerPermisosDeRol(rol.id).subscribe({
          next: (permisos) => {
            console.log(`Permisos cargados para rol ${rol.nombre}:`, permisos);
            rol.permisos = permisos;
          },
          error: (err) => {
            // Solo mostramos el error si no es un 403 (que ya manejamos en el servicio)
            if (err?.status !== 403) {
              console.error(`Error al obtener permisos para rol ${rol.nombre}:`, err);
            } else {
              console.log(`Usando permisos simulados para rol ${rol.nombre} debido a error 403`);
            }
          }
        });
      }
    }
  }

  guardarRol(): void {
    if (this.rolForm.invalid) return;

    const rolData = this.rolForm.value;
    this.cargando = true;
    
    if (this.editandoRol && this.rolSeleccionado) {
      this.rolService.actualizarRol(this.rolSeleccionado.id, rolData).subscribe({
        next: () => {
          this.mostrarMensaje('Rol actualizado exitosamente', 'success');
          this.obtenerRoles();
          this.cancelarEdicion();
        },
        error: (err) => {
          this.mostrarMensaje(`Error al actualizar rol: ${err.message}`, 'error');
          this.cargando = false;
        }
      });
    } else {
      this.rolService.crearRol(rolData).subscribe({
        next: () => {
          this.mostrarMensaje('Rol creado exitosamente', 'success');
          this.obtenerRoles();
          this.rolForm.reset();
          this.mostrarFormulario = false;
        },
        error: (err) => {
          this.mostrarMensaje(`Error al crear rol: ${err.message}`, 'error');
          this.cargando = false;
        }
      });
    }
  }

  editarRol(rol: Rol): void {
    this.rolSeleccionado = rol;
    this.editandoRol = true;
    this.rolForm.patchValue({
      nombre: rol.nombre,
      descripcion: rol.descripcion || ''
    });
    this.mostrarFormulario = true;
  }

  cancelarEdicion(): void {
    this.rolSeleccionado = null;
    this.editandoRol = false;
    this.rolForm.reset();
    this.mostrarFormulario = false;
  }

  eliminarRol(id: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar este rol?')) {
      this.cargando = true;
      this.rolService.eliminarRol(id).subscribe({
        next: () => {
          this.mostrarMensaje('Rol eliminado exitosamente', 'success');
          this.obtenerRoles();
        },
        error: (err) => {
          this.mostrarMensaje(`Error al eliminar rol: ${err.message}`, 'error');
          this.cargando = false;
        }
      });
    }
  }

  async verPermisos(rol: Rol): Promise<void> {
    // Si el rol no tiene permisos cargados, obtenerlos primero
    if (!rol.permisos || rol.permisos.length === 0) {
      try {
        rol.permisos = await firstValueFrom(this.rolService.obtenerPermisosDeRol(rol.id));
      } catch (error) {
        console.error('Error al obtener permisos:', error);
        this.mostrarMensaje('Error al obtener permisos del rol', 'error');
        return;
      }
    }
    
    this.dialog.open(ModalPermisosComponent, {
      width: '600px',
      data: { 
        nombre: rol.nombre,
        permisos: rol.permisos 
      }
    });
  }

  filtrarRoles(): Rol[] {
    if (!this.filtroTexto.trim()) {
      return this.roles;
    }
    
    const filtro = this.filtroTexto.toLowerCase().trim();
    return this.roles.filter(rol => 
      rol.nombre.toLowerCase().includes(filtro) || 
      (rol.descripcion && rol.descripcion.toLowerCase().includes(filtro))
    );
  }

  trackById(index: number, item: Permiso): string {
    return item.id;
  }

  mostrarMensaje(mensaje: string, tipo: 'success' | 'error'): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: tipo === 'success' ? ['success-snackbar'] : ['error-snackbar']
    });
  }
}