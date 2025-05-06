import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BolsillosService } from '../../../services/bolsillos.service';
import { CuentasService } from '../../../../accounts/services/cuentas.service';
import { Cuenta } from '../../../../../../../core/models/cuenta.model';

@Component({
  selector: 'app-crear-bolsillo-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './crear-bolsillo-dialog.component.html',
  styleUrls: ['./crear-bolsillo-dialog.component.scss'],
})
export class CrearBolsilloDialogComponent implements OnInit {
  form!: FormGroup;
  isLoading = false;
  tiposBolsillo = ['Vacaciones', 'Salud', 'Compras', 'Ahorro', 'Personalizado'];
  coloresPredefinidos: Record<string, string> = {
    Vacaciones: '#ffb300',
    Salud: '#4caf50',
    Compras: '#f44336',
    Ahorro: '#2196f3',
  };

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CrearBolsilloDialogComponent>,
    private bolsilloService: BolsillosService,
    private cuentaService: CuentasService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      tipo: ['', Validators.required],
      nombrePersonalizado: [''],
      colorPersonalizado: ['#a46cf5'],
      saldo: [0, [Validators.required, Validators.min(0.01)]], // ✅ aquí debe llamarse saldo
    });

    this.form.get('tipo')?.valueChanges.subscribe((tipo) => {
      if (tipo !== 'Personalizado') {
        this.form.get('nombrePersonalizado')?.clearValidators();
        this.form.get('colorPersonalizado')?.clearValidators();
      } else {
        this.form
          .get('nombrePersonalizado')
          ?.setValidators([Validators.required]);
        this.form
          .get('colorPersonalizado')
          ?.setValidators([Validators.required]);
      }
      this.form.get('nombrePersonalizado')?.updateValueAndValidity();
      this.form.get('colorPersonalizado')?.updateValueAndValidity();
    });
  }

  getColorPorTipo(tipo: string): string {
    return this.coloresPredefinidos[tipo] || '#a46cf5';
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }

  guardar(): void {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach(control => control.markAsTouched());
      return;
    }
  
    this.isLoading = true;
    const user = JSON.parse(localStorage.getItem('user') || '{}');
  
    if (!user.id) {
      this.isLoading = false;
      alert('⚠️ Usuario no encontrado en sesión');
      return;
    }
  
    this.cuentaService.getCuentasPorUsuario(user.id).subscribe({
      next: (cuentas: Cuenta[]) => {
        if (!cuentas || cuentas.length === 0) {
          this.isLoading = false;
          alert('⚠️ No tienes cuentas asociadas');
          return;
        }
  
        const cuenta = cuentas[0];
        const cuentaId = cuenta.id || cuenta._id;
  
        if (!cuentaId) {
          this.isLoading = false;
          alert('⚠️ ID de cuenta no disponible');
          return;
        }
  
        const tipo = this.form.value.tipo;
        const nombre = tipo === 'Personalizado' ? this.form.value.nombrePersonalizado : tipo;
        const color = tipo === 'Personalizado' ? this.form.value.colorPersonalizado : this.getColorPorTipo(tipo);
        const saldo = parseFloat(this.form.value.saldo);
  
        if (isNaN(saldo) || saldo <= 0) {
          this.isLoading = false;
          alert('⚠️ El saldo debe ser mayor que 0');
          return;
        }
  
        const bolsillo = {
          nombre,
          color,
          saldo,
          id_cuenta: cuentaId
        };
  
        console.log('🟠 Enviando bolsillo:', bolsillo);
  
        this.bolsilloService.crearBolsillo(bolsillo).subscribe({
          next: (res) => {
            console.log('✅ Bolsillo creado:', res);
            this.isLoading = false;
            this.dialogRef.close(true);
          },
          error: (err) => {
            this.isLoading = false;
            console.error('❌ Error completo:', err);
            const msg = err?.error?.mensaje || 'Error al crear bolsillo (422)';
            alert(`❌ ${msg}`);
          }
        });
      },
      error: (err) => {
        console.error('❌ Error al obtener cuentas:', err);
        this.isLoading = false;
        alert('❌ Error al obtener la cuenta del usuario');
      }
    });
  }  
}
