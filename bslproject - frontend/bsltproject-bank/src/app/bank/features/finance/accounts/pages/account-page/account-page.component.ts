import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';

import { CuentasService } from '../../services/cuentas.service';
import { Cuenta } from '../../../../../../core/models/cuenta.model';

import { CrearCuentaDialogComponent } from '../../shared/dialogs/crear-cuenta-dialog/crear-cuenta-dialog.component';
import { EditarCuentaDialogComponent } from '../../shared/dialogs/editar-cuenta-dialog/editar-cuenta-dialog.component';
import { AsignarCuentaDialogComponent } from '../../shared/dialogs/asignar-cuenta-dialog/asignar-cuenta-dialog.component';

@Component({
  selector: 'app-account-page',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
  ],
  templateUrl: './account-page.component.html',
  styleUrls: ['./account-page.component.scss'],
})
export class AccountPageComponent implements OnInit {
  cuentas: Cuenta[] = [];
  bolsillos: any[] = [];

  displayedColumns: string[] = [
    'tipo',
    'numero',
    'usuario',
    'saldo',
    'meta_ahorro',
    'color',
    'fecha',
    'tieneBolsillo',
    'acciones',
  ];

  constructor(
    private cuentasService: CuentasService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    forkJoin({
      cuentas: this.cuentasService.getCuentas(),
      usuarios: this.cuentasService.getUsuarios(),
      bolsillos: this.cuentasService.getBolsillos(),
    }).subscribe(({ cuentas, usuarios, bolsillos }) => {
      this.cuentas = cuentas.map((cuenta) => {
        const usuario = usuarios.find((u) => u.id === cuenta.usuario_id);
        const tieneBolsillo = bolsillos.some(
          (b) => b.id_cuenta === cuenta.id || b.id_cuenta === cuenta._id
        );

        return {
          ...cuenta,
          id: cuenta.id,
          usuarioNombre: usuario
            ? `${usuario.nombre} ${usuario.apellido}`
            : undefined,
          tieneBolsillo,
          fecha_creacion: cuenta.createdAt
            ? new Date(cuenta.createdAt)
            : undefined,
        };
      });
    });
  }

  abrirFormularioCuenta(): void {
    const dialogRef = this.dialog.open(CrearCuentaDialogComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        this.cuentasService.crearCuenta(resultado).subscribe(() => {
          this.cargarDatos();
        });
      }
    });
  }

  editarCuenta(cuenta: Cuenta): void {
    const dialogRef = this.dialog.open(EditarCuentaDialogComponent, {
      width: '400px',
      data: cuenta,
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        this.cargarDatos();
      }
    });
  }

  eliminarCuenta(cuenta: Cuenta): void {
    const cuentaId = cuenta._id || cuenta.id;
    const usuarioId = cuenta.usuario_id;

    if (!cuentaId) {
      console.warn('❌ No se pudo eliminar la cuenta. ID inválido:', cuentaId);
      return;
    }

    const confirmar = confirm(
      `¿Deseas eliminar la cuenta con número ${cuenta.numero_cuenta}?`
    );
    if (!confirmar) return;

    const eliminar = () => {
      this.cuentasService.eliminarCuenta(cuentaId).subscribe({
        next: () => this.cargarDatos(),
        error: (err) =>
          console.error('❌ Error al eliminar la cuenta:', err),
      });
    };

    if (usuarioId) {
      this.cuentasService
        .desasociarCuentaDeUsuario(usuarioId, cuentaId)
        .subscribe({
          next: () => eliminar(),
          error: (err) => {
            console.error('⚠️ Error al desasociar cuenta del usuario:', err);
            alert('No se pudo desasociar la cuenta del usuario');
          },
        });
    } else {
      eliminar();
    }
  }

  asignarCuenta(cuenta: Cuenta): void {
    const dialogRef = this.dialog.open(AsignarCuentaDialogComponent, {
      width: '400px',
      data: cuenta,
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        this.cargarDatos();
      }
    });
  }

  obtenerNombreTipo(tipo: string): string {
    const tiposLegibles: Record<string, string> = {
      CUENTA_AHORRO: 'Cuenta de ahorro',
      CUENTA_CORRIENTE: 'Cuenta corriente',
      CUENTA_NOMINA: 'Cuenta nómina',
      OTRO: 'Otro'
    };
    return tiposLegibles[tipo] || tipo;
  }  
}
