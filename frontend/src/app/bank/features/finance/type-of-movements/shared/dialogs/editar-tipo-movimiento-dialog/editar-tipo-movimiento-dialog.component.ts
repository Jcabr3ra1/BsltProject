import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';
import { TipoMovimiento } from '../../../../../../../core/models/movement-type.model';

@Component({
  selector: 'app-editar-tipo-movimiento-dialog',
  standalone: true,
  templateUrl: './editar-tipo-movimiento-dialog.component.html',
  styleUrls: ['./editar-tipo-movimiento-dialog.component.css'],
  imports: [
    CommonModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ]
})
export class EditarTipoMovimientoDialogComponent implements OnInit, OnDestroy {
  form: FormGroup;
  isLoading = false;
  private valueChangesSubs: Subscription[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: TipoMovimiento,
    private dialogRef: MatDialogRef<EditarTipoMovimientoDialogComponent>,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      codigo_origen: [data.codigo_origen, Validators.required],
      codigo_destino: [data.codigo_destino, Validators.required],
      descripcion: [data.descripcion, [Validators.required, Validators.minLength(3)]]
    });
    
    this.dialogRef.addPanelClass(['custom-dialog', 'custom-dark-dialog']);
  }

  ngOnInit(): void {
    this.valueChangesSubs.push(
      this.form.get('codigo_origen')!.valueChanges.subscribe(() => {})
    );
    this.valueChangesSubs.push(
      this.form.get('codigo_destino')!.valueChanges.subscribe(() => {})
    );
  }

  ngOnDestroy(): void {
    this.valueChangesSubs.forEach(s => s.unsubscribe());
  }

  guardar(): void {
    if (this.form.valid) {
      this.isLoading = true;
      
      const actualizado = {
        id: this.data.id || this.data._id, // asegura compatibilidad con Mongo
        ...this.form.value
      };
      
      setTimeout(() => {
        this.isLoading = false;
        this.dialogRef.close(actualizado);
      }, 500);
    } else {
      this.form.markAllAsTouched();
    }
  }

  cancelar(): void {
    this.dialogRef.close();
  }
  
  esIngreso(): boolean {
    const origen = this.form.get('codigo_origen')?.value;
    const destino = this.form.get('codigo_destino')?.value;
    return origen === '0' && destino !== '0' && destino !== '';
  }
  
  esGasto(): boolean {
    const origen = this.form.get('codigo_origen')?.value;
    const destino = this.form.get('codigo_destino')?.value;
    return origen !== '0' && origen !== '' && destino === '0';
  }
  
  esTransferencia(): boolean {
    const origen = this.form.get('codigo_origen')?.value;
    const destino = this.form.get('codigo_destino')?.value;
    return origen !== '0' && origen !== '' && destino !== '0' && destino !== '';
  }
  
  getTipoClase(): string {
    if (this.esIngreso()) return 'ingreso';
    if (this.esGasto()) return 'gasto';
    if (this.esTransferencia()) return 'transferencia';
    return 'desconocido';
  }
  
  getTipoIcono(): string {
    if (this.esIngreso()) return 'arrow_downward';
    if (this.esGasto()) return 'arrow_upward';
    if (this.esTransferencia()) return 'swap_horiz';
    return 'help_outline';
  }
  
  getTipoEtiqueta(): string {
    if (this.esIngreso()) return 'Ingreso';
    if (this.esGasto()) return 'Gasto';
    if (this.esTransferencia()) return 'Transferencia';
    return 'Tipo de movimiento';
  }
  
  getTipoDescripcion(): string {
    if (this.esIngreso()) {
      return 'Entrada de dinero a una cuenta desde fuera del sistema.';
    }
    if (this.esGasto()) {
      return 'Salida de dinero de una cuenta hacia fuera del sistema.';
    }
    if (this.esTransferencia()) {
      return 'Movimiento de dinero entre dos cuentas del sistema.';
    }
    return 'Completa los códigos de origen y destino para determinar el tipo de movimiento.';
  }
}