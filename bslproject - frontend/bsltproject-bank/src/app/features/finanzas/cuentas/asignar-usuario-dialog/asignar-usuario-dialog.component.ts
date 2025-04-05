import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UsuarioService } from '@core/services/seguridad/usuario.service';
import { CuentaService } from '@core/services/finanzas/cuenta.service';
import { Usuario } from '@core/models/seguridad/usuario.model';
import { Cuenta } from '@core/models/finanzas/cuenta.model';
import { finalize } from 'rxjs/operators';
import { AuthService } from '@core/services/seguridad/auth.service';

@Component({
  selector: 'app-asignar-usuario-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './asignar-usuario-dialog.component.html',
  styleUrls: ['./asignar-usuario-dialog.component.scss']
})
export class AsignarUsuarioDialogComponent implements OnInit {
  form: FormGroup;
  usuarios: Usuario[] = [];
  loading = false;
  submitting = false;
  error = '';
  account: Cuenta | null = null;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AsignarUsuarioDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { account: Cuenta },
    private usuarioService: UsuarioService,
    private cuentaService: CuentaService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      usuarioId: ['', Validators.required]
    });
    
    // Validar y guardar los datos de la cuenta al inicializar
    if (data && data.account) {
      // Tratar los datos como any para acceder a propiedades que pueden no estar en la interfaz Account
      const accountRaw = data.account as any;
      
      // Normalizar los datos de la cuenta para manejar tanto id como _id
      const accountData: Cuenta = {
        ...data.account,
        id: data.account.id || accountRaw._id || '',
        numero: data.account.numero || accountRaw.numero_cuenta || `Cuenta-${Math.floor(Math.random() * 10000)}`
      };
      
      this.account = accountData;
      console.log('Cuenta normalizada en el diálogo:', this.account);
    } else {
      console.error('No se recibieron datos de cuenta válidos');
    }
  }

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.loading = true;
    this.error = '';

    // Usar el servicio real para cargar usuarios en lugar de datos de prueba
    this.usuarioService.obtenerTodos()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (usuarios) => {
          this.usuarios = usuarios;
          console.log('Usuarios cargados desde el servicio:', usuarios);
          
          // Intentar obtener el usuario actual como opción predeterminada
          const currentUser = this.authService.currentUserValue;
          if (currentUser && currentUser.id) {
            console.log('Usuario actual:', currentUser);
            
            // Establecer el usuario actual como valor predeterminado si está en la lista
            const userExists = this.usuarios.some(u => u.id === currentUser.id);
            if (userExists) {
              this.form.get('usuarioId')?.setValue(currentUser.id);
            }
          }
        },
        error: (error) => {
          console.error('Error al cargar usuarios:', error);
          this.error = 'Error al cargar usuarios: ' + (error.error?.detail || error.message || 'Error desconocido');
          this.snackBar.open(this.error, 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          
          // Si falla la carga, usar usuarios de prueba como respaldo
          this.cargarUsuariosDePrueba();
        }
      });
  }

  cargarUsuariosDePrueba(): void {
    console.log('Cargando usuarios de prueba como respaldo');
    
    // Usuarios de prueba para desarrollo
    const usuariosPrueba: Usuario[] = [
      {
        id: '67a2661729e4496e2f332d59',
        nombre: 'Admin',
        apellido: 'Sistema',
        email: 'admin@bsltproject.com',
        rol: 'ADMIN',
        estado: 'ACTIVO'
      },
      {
        id: '67d362f17a90d255eaf9c510',
        nombre: 'Usuario',
        apellido: 'Test',
        email: 'test@bsltproject.com',
        rol: 'CLIENTE',
        estado: 'ACTIVO'
      },
      {
        id: '67d381c27a90d255eaf9c515',
        nombre: 'Cliente',
        apellido: 'Cuenta10',
        email: 'cuenta10@bsltproject.com',
        rol: 'CLIENTE',
        estado: 'ACTIVO'
      }
    ];

    // Intentar obtener el usuario actual como opción predeterminada
    const currentUser = this.authService.currentUserValue;
    if (currentUser && currentUser.id) {
      console.log('Usuario actual:', currentUser);
      
      // Verificar si el usuario actual ya está en la lista
      const userExists = usuariosPrueba.some(u => u.id === currentUser.id);
      
      // Si no está en la lista, agregarlo
      if (!userExists) {
        usuariosPrueba.push(currentUser);
      }
      
      // Establecer el usuario actual como valor predeterminado
      this.form.get('usuarioId')?.setValue(currentUser.id);
    }

    this.usuarios = usuariosPrueba;
    console.log('Usuarios cargados (de prueba):', this.usuarios);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    this.submitting = true;
    const usuarioId = this.form.get('usuarioId')?.value;
    
    // Verificar que la cuenta exista y tenga un ID válido
    if (!this.account || !this.account.id) {
      console.error('Error: Datos de cuenta no disponibles');
      this.snackBar.open('Error: Datos de cuenta no disponibles', 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      this.submitting = false;
      return;
    }
    
    console.log('Asignando usuario:', usuarioId, 'a cuenta:', this.account.id);

    // Asegurarse de que el ID de la cuenta sea un string
    const accountId = this.account.id.toString();
    
    this.cuentaService.asignarUsuario(accountId, usuarioId)
      .pipe(finalize(() => this.submitting = false))
      .subscribe({
        next: (result) => {
          console.log('Usuario asignado correctamente:', result);
          this.snackBar.open('Usuario asignado correctamente', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.dialogRef.close(result);
        },
        error: (error) => {
          console.error('Error al asignar usuario:', error);
          const errorMessage = 'Error al asignar usuario: ' + (error.error?.detail || error.message || 'Error desconocido');
          this.snackBar.open(errorMessage, 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getUsuarioNombreCompleto(usuario: Usuario): string {
    return `${usuario.nombre} ${usuario.apellido} (${usuario.email})`;
  }

  getTipoCuentaDisplay(tipo: string): string {
    switch (tipo) {
      case 'CUENTA_CORRIENTE':
        return 'Cuenta Corriente';
      case 'CUENTA_AHORRO':
        return 'Cuenta de Ahorro';
      case 'CUENTA_NOMINA':
        return 'Cuenta Nómina';
      case 'CUENTA_INFANTIL':
        return 'Cuenta Infantil';
      case 'CUENTA_JOVEN':
        return 'Cuenta Joven';
      case 'BOLSILLO':
        return 'Bolsillo';
      default:
        return tipo;
    }
  }
}
