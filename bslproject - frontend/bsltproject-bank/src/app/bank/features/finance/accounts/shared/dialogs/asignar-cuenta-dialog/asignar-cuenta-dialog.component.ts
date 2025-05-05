import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CuentasService } from '../../../services/cuentas.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-asignar-cuenta-dialog',
  templateUrl: './asignar-cuenta-dialog.component.html',
  styleUrls: ['./asignar-cuenta-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ]
})
export class AsignarCuentaDialogComponent implements OnInit {
  form!: FormGroup;
  usuarios: any[] = [];
  cargando: boolean = false;
  mensajeError: string = '';

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AsignarCuentaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private cuentasService: CuentasService
  ) {
    // Configurar clases para el diálogo
    this.dialogRef.addPanelClass(['custom-dialog', 'custom-dark-dialog']);
  }

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarUsuarios();
  }

  inicializarFormulario(): void {
    this.form = this.fb.group({
      usuario_id: [null, Validators.required]
    });
  }

  cargarUsuarios(): void {
    this.cargando = true;
    this.cuentasService.getUsuarios().subscribe({
      next: (data) => {
        // Filtrar usuarios que no tengan cuentaId
        this.usuarios = data.filter((usuario: any) => !usuario.cuentaId);
        this.cargando = false;
        
        if (this.usuarios.length === 0) {
          this.mensajeError = 'No hay usuarios disponibles para asignar a esta cuenta.';
        }
      },
      error: (error) => {
        console.error('❌ Error al cargar usuarios', error);
        this.mensajeError = 'Error al cargar la lista de usuarios.';
        this.cargando = false;
      }
    });
  }
  
  asignar(): void {
    if (this.form.valid) {
      this.cargando = true;
      const cuentaId = this.data?.id || this.data?._id;
      const usuarioId = this.form.value.usuario_id;

      if (!cuentaId || !usuarioId) {
        console.error('❌ ID faltante:', { cuentaId, usuarioId });
        this.mensajeError = 'Error: ID de cuenta o usuario no válido.';
        this.cargando = false;
        return;
      }

      this.cuentasService.asignarCuentaAUsuario(cuentaId, usuarioId).subscribe({
        next: () => {
          this.cargando = false;
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('❌ Error al asignar cuenta:', err);
          this.mensajeError = 'No se pudo asignar la cuenta al usuario.';
          this.cargando = false;
        }
      });
    } else {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
    }
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }
  
  // Método para obtener el label legible del tipo de cuenta
  getTipoCuentaLabel(tipo: string): string {
    const tipos: {[key: string]: string} = {
      'CUENTA_AHORRO': 'Cuenta de Ahorro',
      'CUENTA_CORRIENTE': 'Cuenta Corriente',
      'CUENTA_NOMINA': 'Cuenta Nómina',
      'OTRO': 'Otro tipo'
    };
    
    return tipos[tipo] || tipo;
  }
}