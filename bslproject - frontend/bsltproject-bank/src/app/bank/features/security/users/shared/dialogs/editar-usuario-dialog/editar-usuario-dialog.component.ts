import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { UsuariosService } from '../../../services/usuarios.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

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
    MatIconModule
  ],
  templateUrl: './editar-usuario-dialog.component.html',
  styleUrls: ['./editar-usuario-dialog.component.scss']
})
export class EditarUsuarioDialogComponent implements OnInit {
  form!: FormGroup;
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditarUsuarioDialogComponent>,
    private usuariosService: UsuariosService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    // Aseguramos que el diálogo tenga el estilo correcto
    this.dialogRef.addPanelClass('custom-dialog');
  }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.form = this.fb.group({
      nombre: [this.data.nombre, [Validators.required, Validators.maxLength(50)]],
      apellido: [this.data.apellido, [Validators.required, Validators.maxLength(50)]],
      email: [this.data.email, [Validators.required, Validators.email, Validators.maxLength(100)]]
    });
  }

  guardar(): void {
    if (this.form.invalid) {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        control?.markAsTouched();
      });
      return;
    }
    
    this.isLoading = true;
    const usuarioPayload = {
      nombre: this.form.value.nombre,
      apellido: this.form.value.apellido,
      email: this.form.value.email,
      // Mantener los roles y estado actuales
      roles: this.data.roles,
      estado: this.data.estado 
    };
  
    this.usuariosService.actualizarUsuario(this.data.id, usuarioPayload)
      .pipe(
        catchError(error => {
          console.error('Error al actualizar usuario:', error);
          this.errorMessage = 'No se pudo actualizar el usuario';
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
}