import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CuentaService } from '../../../core/services/finanzas'; // Importar desde el barrel file
import { UsuariosService } from '../../../core/services/seguridad'; // Importar el servicio de usuarios desde seguridad
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
  selector: 'app-cuenta',
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
  templateUrl: './cuentas.component.html',
  styleUrls: ['./cuentas.component.scss']
})
export class CuentasComponent implements OnInit {
  cuentaForm!: FormGroup;
  cuentas: any[] = [];
  usuarios: any[] = []; 
  tiposCuenta: string[] = ['Ahorros', 'Corriente']; 
  displayedColumns: string[] = ['numeroCuenta', 'saldo', 'tipoCuenta', 'usuario', 'acciones']; 
  mostrarFormulario: boolean = false; 
  editandoCuenta: boolean = false;
  cuentaSeleccionada: any = null;

  constructor(
    private fb: FormBuilder,
    private cuentaService: CuentaService,
    private usuariosService: UsuariosService, // Inyectar el servicio de usuarios
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.cargarCuentas();
    this.cargarUsuarios();
  }

  initForm() {
    this.cuentaForm = this.fb.group({
      numeroCuenta: ['', Validators.required],
      saldo: ['', Validators.required],
      tipoCuenta: ['', Validators.required],
      usuarioId: ['', Validators.required] 
    });
  }

  cargarCuentas() {
    this.cuentaService.getCuentas().subscribe({
      next: (cuentas) => (this.cuentas = cuentas),
      error: () => this.mostrarMensaje('Error al obtener cuentas', 'error')
    });
  }

  cargarUsuarios() {
    this.usuariosService.obtenerUsuarios().subscribe({
      next: (usuarios) => (this.usuarios = usuarios),
      error: () => this.mostrarMensaje('Error al obtener usuarios', 'error')
    });
  }

  toggleFormulario() {
    this.mostrarFormulario = !this.mostrarFormulario;
  }

  guardarCuenta() {
    if (this.cuentaForm.invalid) return;
    const cuentaData = this.cuentaForm.value;
    
    if (this.editandoCuenta) {
      this.cuentaService.actualizarCuenta(this.cuentaSeleccionada.id, cuentaData).subscribe({
        next: () => {
          this.mostrarMensaje('Cuenta actualizada', 'success');
          this.cargarCuentas();
          this.cancelarEdicion();
        },
        error: () => this.mostrarMensaje('Error al actualizar cuenta', 'error')
      });
    } else {
      this.cuentaService.crearCuenta(cuentaData).subscribe({
        next: () => {
          this.mostrarMensaje('Cuenta creada', 'success');
          this.cargarCuentas();
          this.cuentaForm.reset();
          this.mostrarFormulario = false; 
        },
        error: () => this.mostrarMensaje('Error al crear cuenta', 'error')
      });
    }
  }

  editarCuenta(cuenta: any) {
    this.cuentaSeleccionada = cuenta;
    this.editandoCuenta = true;
    this.mostrarFormulario = true; 
    this.cuentaForm.patchValue(cuenta);
  }

  cancelarEdicion() {
    this.editandoCuenta = false;
    this.cuentaSeleccionada = null;
    this.cuentaForm.reset();
    this.mostrarFormulario = false;
  }

  eliminarCuenta(id: string) {
    if (confirm('¿Estás seguro de eliminar esta cuenta?')) {
      this.cuentaService.eliminarCuenta(id).subscribe({
        next: () => {
          this.mostrarMensaje('Cuenta eliminada', 'success');
          this.cargarCuentas();
        },
        error: () => this.mostrarMensaje('Error al eliminar cuenta', 'error')
      });
    }
  }

  mostrarMensaje(mensaje: string, tipo: 'success' | 'error') {
    this.snackBar.open(mensaje, 'Cerrar', { duration: 3000, panelClass: tipo });
  }
}
