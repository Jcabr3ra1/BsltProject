import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { UsuariosService } from '../../../services/usuarios.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-crear-usuario-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  templateUrl: './crear-usuario-dialog.component.html',
  styleUrls: ['./crear-usuario-dialog.component.scss']
})
export class CrearUsuarioDialogComponent implements OnInit {
  form!: FormGroup;
  roles: any[] = [];
  estados: any[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CrearUsuarioDialogComponent>,
    private usuariosService: UsuariosService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rol_id: ['', Validators.required],
      estado_id: ['', Validators.required]
    });

    this.usuariosService.getRoles().subscribe(data => this.roles = data);
    this.usuariosService.getEstados().subscribe(data => this.estados = data);
  }

  guardar() {
    if (this.form.valid) {
      this.usuariosService.crearUsuario(this.form.value).subscribe(() => {
        this.dialogRef.close(true);
      });
    }
  }

  cancelar() {
    this.dialogRef.close(false);
  }
}
