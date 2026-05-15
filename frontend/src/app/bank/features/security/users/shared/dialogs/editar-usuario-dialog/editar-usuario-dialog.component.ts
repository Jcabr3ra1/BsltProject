import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { UsuariosService } from '../../../services/usuarios.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { Usuario } from '../../../../../../../core/models/usuario.model';
import { Rol } from '../../../../../../../core/models/rol.model';
import { Estado } from '../../../../../../../core/models/estado.model';

@Component({
  selector: 'app-editar-usuario-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatOptionModule
  ],
  templateUrl: './editar-usuario-dialog.component.html',
  styleUrls: ['./editar-usuario-dialog.component.css']
})
export class EditarUsuarioDialogComponent implements OnInit {
  form!: FormGroup;
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditarUsuarioDialogComponent>,
    private usuariosService: UsuariosService,
    @Inject(MAT_DIALOG_DATA) public data: { usuario: Usuario; roles: Rol[]; estados: Estado[] }
  ) {
    this.dialogRef.addPanelClass('custom-dialog');
  }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    const currentRolId = this.data.usuario.roles?.[0]?.id || '';
    const currentEstadoId = this.data.usuario.estado?.id || '';
    
    this.form = this.fb.group({
      nombre: [this.data.usuario.nombre, [Validators.required, Validators.maxLength(50)]],
      apellido: [this.data.usuario.apellido, [Validators.required, Validators.maxLength(50)]],
      email: [this.data.usuario.email, [Validators.required, Validators.email, Validators.maxLength(100)]],
      rolId: [currentRolId, [Validators.required]],
      estadoId: [currentEstadoId, [Validators.required]]
    });
  }

  guardar(): void {
    if (this.form.invalid) {
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        control?.markAsTouched();
      });
      return;
    }
    
    this.isLoading = true;
    
    const selectedRol = this.data.roles.find((rol: Rol) => rol.id === this.form.value.rolId);
    const selectedEstado = this.data.estados.find((estado: Estado) => estado.id === this.form.value.estadoId);
    
    const usuarioPayload = {
      nombre: this.form.value.nombre,
      apellido: this.form.value.apellido,
      email: this.form.value.email,
      roles: selectedRol ? [selectedRol] : this.data.usuario.roles,
      estado: selectedEstado || this.data.usuario.estado
    };
  
    this.usuariosService.actualizarUsuario(this.data.usuario.id!, usuarioPayload)
      .pipe(
        catchError(error => {
          this.errorMessage = 'No se pudo actualizar el usuario';
          
          this.dialogRef.close({ error: error.error?.message || 'Error al actualizar usuario' });
          return of(null);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe(result => {
        if (result !== null) {
          this.dialogRef.close(true);
        }
      });
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }
  
  trackRolById(index: number, rol: Rol): string {
    return rol.id!;
  }
  
  trackEstadoById(index: number, estado: Estado): string {
    return estado.id!;
  }
}