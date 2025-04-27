import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CuentasService } from '../../../services/cuentas.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

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
        MatInputModule]
})
export class AsignarCuentaDialogComponent implements OnInit {
  form!: FormGroup;
  usuarios: any[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AsignarCuentaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private cuentasService: CuentasService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      usuario_id: [null, Validators.required]
    });
  
    this.cuentasService.getUsuarios().subscribe((data) => {
      // Filtrar usuarios que no tengan cuentaId
      this.usuarios = data.filter((usuario: any) => !usuario.cuentaId);
    });
  }
  
  asignar() {
    if (this.form.valid) {
      const cuentaId = this.data?.id || this.data?._id;
      const usuarioId = this.form.value.usuario_id;

      if (!cuentaId || !usuarioId) {
        console.error('❌ ID faltante:', { cuentaId, usuarioId });
        return;
      }

      this.cuentasService.asignarCuentaAUsuario(cuentaId, usuarioId).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => {
          console.error('❌ Error al asignar cuenta:', err);
          alert('No se pudo asignar la cuenta');
        }
      });
    }
  }

  cancelar() {
    this.dialogRef.close(false);
  }
}


