import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Cuenta } from '../../../../../../../core/models/cuenta.model';
import { Bolsillo } from '../../../../../../../core/models/bolsillo.model';
import { TipoMovimiento } from '../../../../../../../core/models/movement-type.model';
import { TipoTransaccion } from '../../../../../../../core/models/tipo_transaccion.model';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  standalone: true,
  selector: 'app-crear-transaccion-dialog',
  templateUrl: './crear-transaccion-dialog.component.html',
  styleUrls: ['./crear-transaccion-dialog.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule,
  ],
})
export class CrearTransaccionDialogComponent {
  form: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<CrearTransaccionDialogComponent>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      cuentas: Cuenta[];
      bolsillos: Bolsillo[];
      tiposMovimiento: TipoMovimiento[];
      tiposTransaccion: TipoTransaccion[];
    }
  ) {
    this.form = this.fb.group({
      id_tipo_movimiento: [null, Validators.required],
      id_tipo_transaccion: [null, Validators.required],
      id_cuenta_origen: [null],
      id_cuenta_destino: [null],
      id_bolsillo_origen: [null],
      id_bolsillo_destino: [null],
      monto: [null, Validators.required],
      descripcion: ['', Validators.required],
    });
  }

  get tipoMovimientoSeleccionado(): TipoMovimiento | undefined {
    return this.data.tiposMovimiento.find(
      (t) =>
        t.id === this.form.value.id_tipo_movimiento ||
        t._id === this.form.value.id_tipo_movimiento
    );
  }

  // Nuevo método para seleccionar tipo de transacción por icono
  seleccionarTipoTransaccion(id: string | undefined): void {
    if (id) {
      this.form.get('id_tipo_transaccion')?.setValue(id);
      this.form.get('id_tipo_transaccion')?.markAsDirty();
    }
  }

  // Nuevo método para seleccionar tipo de movimiento por icono
  seleccionarTipoMovimiento(id: string | undefined): void {
    if (id) {
      this.form.get('id_tipo_movimiento')?.setValue(id);
      this.form.get('id_tipo_movimiento')?.markAsDirty();
    }
  }

  // Método para obtener ícono de movimiento basado en el tipo
  obtenerIconoMovimiento(tipo: TipoMovimiento): string {
    const origen = tipo.codigo_origen.toUpperCase();
    const destino = tipo.codigo_destino.toUpperCase();

    if (origen === 'ACCOUNT' && destino === 'ACCOUNT') return '↔';
    if (origen === 'ACCOUNT' && destino === 'WALLET') return '→';
    if (origen === 'BANK' && destino === 'WALLET') return '↓';
    if (origen === 'BANK' && destino === 'ACCOUNT') return '↓';
    if (origen === 'WALLET' && destino === 'ACCOUNT') return '←';
    if (origen === 'ACCOUNT' && destino === 'BANK') return '↑';
    if (origen === 'WALLET' && destino === 'BANK') return '↑';
    if (origen === 'WALLET' && destino === 'WALLET') return '↔';
    return '→';
  }

  obtenerDescripcionCorta(tipo: TipoMovimiento): string {
    const origen = tipo.codigo_origen.toUpperCase();
    const destino = tipo.codigo_destino.toUpperCase();
  
    if (origen === 'ACCOUNT' && destino === 'ACCOUNT') 
      return 'Transferir dinero entre cuentas';
    if (origen === 'ACCOUNT' && destino === 'WALLET')
      return 'Mover dinero de mi cuenta a un bolsillo';
    if (origen === 'BANK' && destino === 'WALLET') 
      return 'Consignar dinero desde banco externo a mi bolsillo';
    if (origen === 'BANK' && destino === 'ACCOUNT') 
      return 'Consignar dinero desde banco externo a mi cuenta';
    if (origen === 'WALLET' && destino === 'ACCOUNT')
      return 'Devolver dinero de un bolsillo a mi cuenta';
    if (origen === 'ACCOUNT' && destino === 'BANK') 
      return 'Retirar dinero de mi cuenta a banco externo';
    if (origen === 'WALLET' && destino === 'BANK') 
      return 'Retirar dinero de mi bolsillo a banco externo';
    if (origen === 'WALLET' && destino === 'WALLET') 
      return 'Transferir fondos entre mis bolsillos';
    return `${origen} → ${destino}`;
  }

  mostrarCampo(campo: string): boolean {
    const tipo = this.tipoMovimientoSeleccionado;
    if (!tipo) return false;

    const origen = tipo.codigo_origen.toUpperCase();
    const destino = tipo.codigo_destino.toUpperCase();

    if (campo === 'cuenta_origen') return origen === 'ACCOUNT';
    if (campo === 'cuenta_destino') return destino === 'ACCOUNT';
    if (campo === 'bolsillo_origen') return origen === 'WALLET';
    if (campo === 'bolsillo_destino') return destino === 'WALLET';

    return false;
  }

  obtenerNombreCorto(desc: string): string {
    const lower = desc.toLowerCase();

    if (lower.includes('cuenta') && lower.includes('bolsillo'))
      return 'Cuenta → Bolsillo';
    if (lower.includes('bolsillo') && lower.includes('cuenta'))
      return 'Bolsillo → Cuenta';
    if (lower.includes('banco') && lower.includes('cuenta'))
      return 'Banco → Cuenta';
    if (lower.includes('cuenta') && lower.includes('banco'))
      return 'Cuenta → Banco';
    if (lower.includes('banco') && lower.includes('bolsillo'))
      return 'Banco → Bolsillo';
    if (lower.includes('bolsillo') && lower.includes('banco'))
      return 'Bolsillo → Banco';
    if (lower.includes('cuentas')) return 'Cuenta ↔ Cuenta';

    return desc;
  }

  obtenerDescripcionExtendida(tipo: TipoMovimiento): string {
    const origen = tipo.codigo_origen.toUpperCase();
    const destino = tipo.codigo_destino.toUpperCase();

    if (origen === 'ACCOUNT' && destino === 'ACCOUNT')
      return '↔ Transferencia entre cuentas (ACCOUNT → ACCOUNT)';
    if (origen === 'ACCOUNT' && destino === 'WALLET')
      return '→ Transferencia de cuenta a bolsillo (ACCOUNT → WALLET)';
    if (origen === 'BANK' && destino === 'WALLET')
      return '↓ Consignación desde el banco a bolsillo (BANK → WALLET)';
    if (origen === 'BANK' && destino === 'ACCOUNT')
      return '↓ Consignación desde el banco a cuenta (BANK → ACCOUNT)';
    if (origen === 'WALLET' && destino === 'ACCOUNT')
      return '← Retiro de bolsillo a cuenta (WALLET → ACCOUNT)';
    if (origen === 'ACCOUNT' && destino === 'BANK')
      return '↑ Retiro de cuenta a banco (ACCOUNT → BANK)';
    if (origen === 'WALLET' && destino === 'BANK')
      return '↑ Retiro de bolsillo a banco (WALLET → BANK)';
    if (origen === 'WALLET' && destino === 'WALLET')
      return '↔ Transferencia entre bolsillos (WALLET → WALLET)'; 
    return `${tipo.descripcion} (${origen} → ${destino})`;
  }

  guardar(): void {
    if (this.form.invalid) {
      alert('⚠️ Por favor completa todos los campos obligatorios.');
      return;
    }

    const tipo = this.tipoMovimientoSeleccionado;
    const origen = tipo?.codigo_origen.toUpperCase();
    const destino = tipo?.codigo_destino.toUpperCase();

    if (origen === 'ACCOUNT' && !this.form.value.id_cuenta_origen) {
      alert('⚠️ Debes seleccionar una cuenta de origen.');
      return;
    }

    if (destino === 'ACCOUNT' && !this.form.value.id_cuenta_destino) {
      alert('⚠️ Debes seleccionar una cuenta de destino.');
      return;
    }

    if (origen === 'WALLET' && !this.form.value.id_bolsillo_origen) {
      alert('⚠️ Debes seleccionar un bolsillo de origen.');
      return;
    }

    if (destino === 'WALLET' && !this.form.value.id_bolsillo_destino) {
      alert('⚠️ Debes seleccionar un bolsillo de destino.');
      return;
    }

    const data = {
      ...this.form.value,
      id_tipo_transaccion: this.form.value.id_tipo_transaccion,
    };

    this.dialogRef.close(data);
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
