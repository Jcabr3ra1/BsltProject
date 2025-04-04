import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TipoTransaccion } from '@core/models/finanzas/tipo-transaccion.model';

interface DialogData {
  titulo: string;
  tipoTransaccion?: TipoTransaccion;
}

@Component({
  selector: 'app-tipo-transaccion-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule
  ],
  template: `
    <h2 mat-dialog-title>{{ titulo }}</h2>
    <form [formGroup]="tipoTransaccionForm" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <div class="form-container">
          <mat-form-field appearance="outline">
            <mat-label>Nombre</mat-label>
            <input matInput formControlName="nombre" placeholder="Nombre del tipo de transacción">
            <ng-container *ngIf="tipoTransaccionForm.get('nombre')?.hasError('required') && tipoTransaccionForm.get('nombre')?.touched">
              <mat-error>El nombre es requerido</mat-error>
            </ng-container>
            <ng-container *ngIf="tipoTransaccionForm.get('nombre')?.hasError('maxlength')">
              <mat-error>El nombre no puede exceder los 100 caracteres</mat-error>
            </ng-container>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Descripción</mat-label>
            <textarea matInput formControlName="descripcion" placeholder="Descripción del tipo de transacción" rows="3"></textarea>
            <ng-container *ngIf="tipoTransaccionForm.get('descripcion')?.hasError('maxlength')">
              <mat-error>La descripción no puede exceder los 255 caracteres</mat-error>
            </ng-container>
          </mat-form-field>

          <mat-checkbox formControlName="requiereDestino" color="primary">
            Requiere cuenta destino
          </mat-checkbox>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="onCancel()">Cancelar</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="!tipoTransaccionForm.valid">
          {{ tipoTransaccion ? 'Guardar' : 'Crear' }}
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [`
    .form-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      min-width: 300px;
      padding: 1rem 0;
    }

    mat-form-field {
      width: 100%;
    }

    mat-checkbox {
      margin: 0.5rem 0;
    }

    mat-dialog-actions {
      padding: 1rem 0;
    }
  `]
})
export class TipoTransaccionDialogComponent implements OnInit {
  tipoTransaccionForm: FormGroup;
  titulo: string;
  tipoTransaccion: TipoTransaccion | null = null;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<TipoTransaccionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.titulo = data.titulo;
    this.tipoTransaccion = data.tipoTransaccion || null;
    
    this.tipoTransaccionForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: ['', Validators.maxLength(255)],
      requiereDestino: [true]
    });
  }

  ngOnInit(): void {
    if (this.tipoTransaccion) {
      this.tipoTransaccionForm.patchValue({
        nombre: this.tipoTransaccion.nombre,
        descripcion: this.tipoTransaccion.descripcion,
        requiereDestino: this.tipoTransaccion.requiereDestino
      });
    }
  }

  onSubmit(): void {
    if (this.tipoTransaccionForm.valid) {
      const tipoTransaccion: TipoTransaccion = {
        ...this.tipoTransaccion,
        ...this.tipoTransaccionForm.value,
        activo: this.tipoTransaccion?.activo ?? true
      };
      this.dialogRef.close(tipoTransaccion);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
