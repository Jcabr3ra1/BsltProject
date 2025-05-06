import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { CuentasService } from '../../../../accounts/services/cuentas.service';
import { BolsillosService } from '../../../services/bolsillos.service';
import { Bolsillo } from '../../../../../../../core/models/bolsillo.model';
import { Cuenta } from '../../../../../../../core/models/cuenta.model';

@Component({
  standalone: true,
  selector: 'app-asignar-bolsillo-dialog',
  templateUrl: './asignar-bolsillo-dialog.component.html',
  styleUrls: ['./asignar-bolsillo-dialog.component.scss'],
  imports: [
    CommonModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule
  ]
})
export class AsignarBolsilloDialogComponent implements OnInit {
  form: FormGroup;
  cuentasDisponibles: Cuenta[] = [];
  bolsilloInfo: Bolsillo | null = null;
  isLoading = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { id_bolsillo: string },
    private dialogRef: MatDialogRef<AsignarBolsilloDialogComponent>,
    private fb: FormBuilder,
    private cuentasService: CuentasService,
    private bolsillosService: BolsillosService
  ) {
    this.form = this.fb.group({
      id_cuenta: ['', Validators.required]
    });
    
    // Configurar clases para el diálogo
    this.dialogRef.addPanelClass(['custom-dialog', 'custom-dark-dialog']);
  }

  ngOnInit(): void {
    this.cargarCuentas();
    this.cargarInfoBolsillo();
  }
  
  cargarCuentas(): void {
    this.isLoading = true;
    this.cuentasService.getCuentas().subscribe({
      next: (cuentas) => {
        // Filtrar cuentas que no tengan bolsillo asignado
        this.cuentasDisponibles = cuentas.filter(c => !c.id_bolsillo);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error al cargar cuentas:', error);
        this.isLoading = false;
      }
    });
  }
  
  cargarInfoBolsillo(): void {
    if (this.data?.id_bolsillo) {
      this.isLoading = true;
      this.bolsillosService.getBolsillos().subscribe({
        next: (bolsillos) => {
          // Encontrar el bolsillo específico por ID
          const bolsillo = bolsillos.find(b => 
            b.id === this.data.id_bolsillo || b._id === this.data.id_bolsillo
          );
          
          if (bolsillo) {
            this.bolsilloInfo = bolsillo;
          }
          
          this.isLoading = false;
        },
        error: (error) => {
          console.error('❌ Error al cargar información del bolsillo:', error);
          this.isLoading = false;
        }
      });
    }
  }

  guardar(): void {
    if (this.form.valid) {
      this.isLoading = true;
      
      const id_bolsillo = this.data.id_bolsillo;
      const id_cuenta = this.form.value.id_cuenta;
      
      if (!id_bolsillo || !id_cuenta) {
        console.error('❌ ID de bolsillo o cuenta no válido');
        this.isLoading = false;
        return;
      }
      
      // Llamar al servicio para asignar el bolsillo a la cuenta
      this.bolsillosService.asignarBolsilloACuenta(id_bolsillo, id_cuenta)
        .subscribe({
          next: () => {
            this.isLoading = false;
            this.dialogRef.close({
              id_bolsillo: id_bolsillo,
              id_cuenta: id_cuenta
            });
          },
          error: (error) => {
            console.error('❌ Error al asignar bolsillo a cuenta:', error);
            this.isLoading = false;
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
    this.dialogRef.close();
  }
  
  // Método para obtener el tipo de cuenta formateado
  getTipoCuentaLabel(tipo: string): string {
    const tipos: {[key: string]: string} = {
      'CUENTA_AHORRO': 'Cuenta de Ahorro',
      'ahorro': 'Cuenta de Ahorro',
      'CUENTA_CORRIENTE': 'Cuenta Corriente',
      'corriente': 'Cuenta Corriente',
      'CUENTA_NOMINA': 'Cuenta Nómina',
      'nómina': 'Cuenta Nómina',
      'OTRO': 'Otro tipo'
    };
    
    return tipos[tipo] || tipo;
  }
}