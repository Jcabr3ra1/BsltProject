import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { CrearBolsilloDialogComponent } from '../../shared/dialogs/crear-bolsillo-dialog/crear-bolsillo-dialog.component';
import { EditarBolsilloDialogComponent } from '../../shared/dialogs/editar-bolsillo-dialog/editar-bolsillo-dialog.component';
import { AsignarBolsilloDialogComponent } from '../../shared/dialogs/asignar-bolsillo-dialog/asignar-bolsillo-dialog.component';

import { BolsillosService } from '../../services/bolsillos.service';
import { Bolsillo } from '../../../../../../core/models/bolsillo.model';
import { CuentasService } from '../../../accounts/services/cuentas.service';
import { Cuenta } from '../../../../../../core/models/cuenta.model';


@Component({
  standalone: true,
  selector: 'app-pocket-page',
  templateUrl: './pocket-page.component.html',
  styleUrls: ['./pocket-page.component.scss'],
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
  ],
})
export class PocketPageComponent implements OnInit {
  bolsillos: Bolsillo[] = [];
  cuentas: Cuenta[] = [];
  displayedColumns: string[] = [
    'nombre',
    'color',
    'saldo',
    'id_cuenta',
    'acciones',
  ];

  constructor(
    private bolsillosService: BolsillosService,
    private cuentasService: CuentasService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.cargarBolsillos();
    this.cuentasService.getCuentas().subscribe((data) => {
      this.cuentas = data;
    });
  }
  

  cargarBolsillos(): void {
    this.bolsillosService.getBolsillos().subscribe({
      next: (data) => (this.bolsillos = data),
      error: (err) => console.error('Error al obtener bolsillos', err),
    });
  }

  getNumeroCuenta(id: string): string {
    const cuenta = this.cuentas.find(c => c.id === id || c._id === id);
  
    if (!cuenta) return 'Sin asignar';
  
    const tipoMap: Record<string, string> = {
      ahorro: 'Cuenta de ahorro',
      corriente: 'Cuenta corriente',
      nómina: 'Cuenta nómina',
      otro: 'Otro'
    };
  
    const tipoNombre = tipoMap[cuenta.tipo || cuenta.numero_cuenta] || cuenta.tipo || 'Tipo desconocido';
  
    return `${tipoNombre} - ${cuenta.numero_cuenta}`;
  }
  
  

  eliminarBolsillo(id: string): void {
    if (!id) {
      alert('ID de bolsillo no válido.');
      return;
    }
  
    const confirmar = confirm('¿Estás seguro de eliminar este bolsillo? Se desasociará de la cuenta si existe.');
    if (!confirmar) return;
  
    this.bolsillosService.desasociarYEliminarBolsillo(id).subscribe({
      next: () => this.cargarBolsillos(),
      error: () => alert('❌ Error al eliminar el bolsillo o al desasociarlo de la cuenta.')
    });
  }
  

  abrirCrear(): void {
    const dialogRef = this.dialog.open(CrearBolsilloDialogComponent);

    dialogRef.afterClosed().subscribe((nuevoBolsillo) => {
      if (nuevoBolsillo) {
        this.bolsillosService.crearBolsillo(nuevoBolsillo).subscribe(() => {
          this.cargarBolsillos();
        });
      }
    });
  }

  abrirEditar(bolsillo: Bolsillo): void {
    const dialogRef = this.dialog.open(EditarBolsilloDialogComponent, {
      data: {
        id: bolsillo.id || bolsillo._id, // 👈 esto cubre ambos casos
        nombre: bolsillo.nombre,
        color: bolsillo.color,
        saldo: bolsillo.saldo,
      },
    });

    dialogRef.afterClosed().subscribe((actualizado) => {
      if (actualizado && actualizado.id) {
        this.bolsillosService
          .actualizarBolsillo(actualizado.id, {
            nombre: actualizado.nombre,
            color: actualizado.color,
            saldo: actualizado.saldo,
          })
          .subscribe(() => this.cargarBolsillos());
      } else {
        alert(
          '❌ No se recibió un ID válido. No se pudo actualizar el bolsillo.'
        );
      }
    });
  }

  abrirAsignar(bolsillo: Bolsillo): void {
    const dialogRef = this.dialog.open(AsignarBolsilloDialogComponent, {
      data: { id_bolsillo: bolsillo.id || bolsillo._id } // ✅ aseguramos ID
    });
  
    dialogRef.afterClosed().subscribe((asignado) => {
      if (asignado?.id_bolsillo && asignado?.id_cuenta) {
        this.bolsillosService.asignarBolsilloACuenta(asignado.id_bolsillo, asignado.id_cuenta)
          .subscribe(() => {
            this.cargarBolsillos();
          });
      } else {
        alert('❌ ID de bolsillo o cuenta no válido.');
      }
    });
  }
}
