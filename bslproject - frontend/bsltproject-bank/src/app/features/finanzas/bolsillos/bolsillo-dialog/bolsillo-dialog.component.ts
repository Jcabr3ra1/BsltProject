import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { BolsilloService, CuentaService } from '../../../../core/services/finanzas';
import { Cuenta } from '../../../../core/models/cuenta.model';

@Component({
  selector: 'app-bolsillo-dialog',
  templateUrl: './bolsillo-dialog.component.html',
  styleUrls: ['./bolsillo-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSlideToggleModule
  ]
})
export class BolsilloDialogComponent implements OnInit {
  form: FormGroup;
  isLoading = false;
  cuentas: Cuenta[] = [];

  private dialogRef = inject(MatDialogRef<BolsilloDialogComponent>);
  private bolsilloService = inject(BolsilloService);
  private cuentaService = inject(CuentaService);
  private fb = inject(FormBuilder);

  constructor() {
    this.form = this.fb.group({
      nombre: ['', [Validators.required]],
      cuentaId: ['', [Validators.required]],
      saldoInicial: ['', [Validators.required, Validators.min(1000)]],
      esAhorro: [false]
    });
  }

  ngOnInit(): void {
    this.loadCuentas();
  }

  loadCuentas(): void {
    this.isLoading = true;
    this.cuentaService.getCuentas().subscribe({
      next: (cuentas) => {
        this.cuentas = cuentas;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar cuentas:', error);
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.isLoading = true;
      this.bolsilloService.crearBolsillo(this.form.value).subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: (error: any) => {
          console.error('Error al crear bolsillo:', error);
          this.isLoading = false;
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
