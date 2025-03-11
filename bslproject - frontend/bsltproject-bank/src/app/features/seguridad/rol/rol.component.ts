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
import { ModalPermisosComponent } from '../../../shared/components/modals/modal-permisos/modal-permisos.component';

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
    MatTooltipModule
  ],
  templateUrl: './rol.component.html',
  styleUrls: ['./rol.component.scss'],
})
export class RolComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  roles: any[] = [];
  rolForm!: FormGroup;
  editandoRol: boolean = false;
  rolSeleccionado: any = null;
  displayedColumns: string[] = ['nombre', 'descripcion', 'permisos', 'acciones'];
  mostrarFormulario: boolean = false;

  constructor(
    private fb: FormBuilder,
    private rolService: RolService,
    private snackBar: MatSnackBar,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.obtenerRoles();
  }

  initForm() {
    this.rolForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['']
    });
  }

  obtenerRoles() {
    this.rolService.obtenerRoles().subscribe({
      next: (roles) => (this.roles = roles),
      error: (err) => this.mostrarMensaje(`Error al obtener roles: ${err.message}`, 'error')
    });
  }

  guardarRol() {
    if (this.rolForm.invalid) return;

    const rolData = this.rolForm.value;
    if (this.editandoRol) {
      this.rolService.actualizarRol(this.rolSeleccionado.id, rolData).subscribe({
        next: () => {
          this.mostrarMensaje('Rol actualizado exitosamente', 'success');
          this.obtenerRoles();
          this.cancelarEdicion();
        },
        error: (err) => this.mostrarMensaje(`Error al actualizar rol: ${err.message}`, 'error')
      });
    } else {
      this.rolService.crearRol(rolData).subscribe({
        next: () => {
          this.mostrarMensaje('Rol creado exitosamente', 'success');
          this.obtenerRoles();
          this.rolForm.reset();
          this.mostrarFormulario = false;
        },
        error: (err) => this.mostrarMensaje(`Error al crear rol: ${err.message}`, 'error')
      });
    }
  }

  editarRol(rol: any) {
    this.rolSeleccionado = rol;
    this.editandoRol = true;
    this.rolForm.patchValue(rol);
    this.mostrarFormulario = true;
  }

  cancelarEdicion() {
    this.rolSeleccionado = null;
    this.editandoRol = false;
    this.rolForm.reset();
    this.mostrarFormulario = false;
  }

  eliminarRol(id: string) {
    if (confirm('¿Estás seguro de que deseas eliminar este rol?')) {
      this.rolService.eliminarRol(id).subscribe({
        next: () => {
          this.mostrarMensaje('Rol eliminado exitosamente', 'success');
          this.obtenerRoles();
        },
        error: (err) => this.mostrarMensaje(`Error al eliminar rol: ${err.message}`, 'error')
      });
    }
  }

  verPermisos(rol: any) {
    this.dialog.open(ModalPermisosComponent, {
      width: '600px',
      data: { rol }
    });
  }

  mostrarMensaje(mensaje: string, tipo: 'success' | 'error') {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: tipo === 'success' ? ['success-snackbar'] : ['error-snackbar']
    });
  }
}