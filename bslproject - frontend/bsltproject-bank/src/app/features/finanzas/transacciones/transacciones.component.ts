import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransaccionListComponent } from './transaccion-list/transaccion-list.component';
import { RouterModule } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-transacciones',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TransaccionListComponent,
    MatTabsModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './transacciones.component.html',
  styleUrls: ['./transacciones.component.scss']
})
export class TransaccionesComponent {
  // Este componente actúa como contenedor para los subcomponentes de transacciones
}
