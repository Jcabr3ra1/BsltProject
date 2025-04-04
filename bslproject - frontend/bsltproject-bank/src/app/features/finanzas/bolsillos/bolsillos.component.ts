import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

interface Bolsillo {
  id: string;
  nombre: string;
  descripcion: string;
  monto: number;
  meta: number;
  cuentaId: string;
  usuarioId: string;
  fechaCreacion: Date;
  estado: string;
}

interface Cuenta {
  id: string;
  numero: string;
  tipo: string;
}

@Component({
  selector: 'app-bolsillos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatCardModule,
    MatProgressBarModule,
    MatChipsModule,
    MatDividerModule,
    MatDialogModule
  ],
  templateUrl: './bolsillos.component.html',
  styleUrls: ['./bolsillos.component.scss']
})
export class BolsillosComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  bolsillos: Bolsillo[] = [];
  bolsillosFiltrados: Bolsillo[] = [];
  cuentas: Cuenta[] = [];
  nuevoBolsillo: Bolsillo = this.inicializarNuevoBolsillo();
  bolsilloSeleccionado: Bolsillo | null = null;
  displayedColumns: string[] = ['id', 'nombre', 'monto', 'meta', 'progreso', 'cuenta', 'estado', 'acciones'];
  errorMessage: string = '';
  
  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}
  
  ngOnInit(): void {
    // Cargar datos iniciales
    this.cargarBolsillos();
    this.cargarCuentas();
  }
  
  cargarBolsillos() {
    // Simulación de datos para el ejemplo
    this.bolsillos = [
      {
        id: '1',
        nombre: 'Vacaciones',
        descripcion: 'Ahorro para vacaciones de verano',
        monto: 1500000,
        meta: 3000000,
        cuentaId: '123456',
        usuarioId: '1',
        fechaCreacion: new Date(),
        estado: 'Activo'
      },
      {
        id: '2',
        nombre: 'Emergencias',
        descripcion: 'Fondo de emergencias',
        monto: 2000000,
        meta: 5000000,
        cuentaId: '123456',
        usuarioId: '1',
        fechaCreacion: new Date(),
        estado: 'Activo'
      },
      {
        id: '3',
        nombre: 'Nuevo carro',
        descripcion: 'Ahorro para comprar un carro',
        monto: 5000000,
        meta: 20000000,
        cuentaId: '654321',
        usuarioId: '1',
        fechaCreacion: new Date(),
        estado: 'Activo'
      }
    ];
    this.bolsillosFiltrados = [...this.bolsillos];
  }
  
  cargarCuentas() {
    // Simulación de datos para el ejemplo
    this.cuentas = [
      { id: '123456', numero: '123456', tipo: 'Ahorros' },
      { id: '654321', numero: '654321', tipo: 'Corriente' }
    ];
  }
  
  inicializarNuevoBolsillo(): Bolsillo {
    return {
      id: '',
      nombre: '',
      descripcion: '',
      monto: 0,
      meta: 0,
      cuentaId: '',
      usuarioId: '1', // Usuario actual
      fechaCreacion: new Date(),
      estado: 'Activo'
    };
  }
  
  crearBolsillo() {
    if (!this.nuevoBolsillo.nombre || !this.nuevoBolsillo.meta || !this.nuevoBolsillo.cuentaId) {
      this.mostrarMensaje('Por favor complete todos los campos requeridos', 'error');
      return;
    }
    
    // Implementación para crear un nuevo bolsillo
    console.log('Creando bolsillo:', this.nuevoBolsillo);
    this.bolsillos.push({...this.nuevoBolsillo, id: (this.bolsillos.length + 1).toString()});
    this.bolsillosFiltrados = [...this.bolsillos];
    this.mostrarMensaje('Bolsillo creado exitosamente');
    this.nuevoBolsillo = this.inicializarNuevoBolsillo();
  }
  
  editarBolsillo(bolsillo: Bolsillo) {
    this.bolsilloSeleccionado = {...bolsillo};
  }
  
  actualizarBolsillo() {
    if (this.bolsilloSeleccionado) {
      if (!this.bolsilloSeleccionado.nombre || !this.bolsilloSeleccionado.meta || !this.bolsilloSeleccionado.cuentaId) {
        this.mostrarMensaje('Por favor complete todos los campos requeridos', 'error');
        return;
      }
      
      const index = this.bolsillos.findIndex(b => b.id === this.bolsilloSeleccionado!.id);
      if (index !== -1) {
        this.bolsillos[index] = {...this.bolsilloSeleccionado};
        this.bolsillosFiltrados = [...this.bolsillos];
        this.mostrarMensaje('Bolsillo actualizado exitosamente');
        this.bolsilloSeleccionado = null;
      }
    }
  }
  
  eliminarBolsillo(id: string) {
    if (confirm('¿Estás seguro de que deseas eliminar este bolsillo?')) {
      const index = this.bolsillos.findIndex(b => b.id === id);
      if (index !== -1) {
        this.bolsillos.splice(index, 1);
        this.bolsillosFiltrados = [...this.bolsillos];
        this.mostrarMensaje('Bolsillo eliminado exitosamente');
      }
    }
  }
  
  agregarFondos(bolsillo: Bolsillo) {
    // Aquí se implementaría la lógica para abrir un diálogo para agregar fondos
    console.log('Agregar fondos a bolsillo:', bolsillo);
    const monto = prompt('Ingrese el monto a agregar:');
    if (monto && !isNaN(Number(monto)) && Number(monto) > 0) {
      const index = this.bolsillos.findIndex(b => b.id === bolsillo.id);
      if (index !== -1) {
        this.bolsillos[index].monto += Number(monto);
        this.bolsillosFiltrados = [...this.bolsillos];
        this.mostrarMensaje(`Se han agregado ${this.formatearMonto(Number(monto))} al bolsillo ${bolsillo.nombre}`);
      }
    } else if (monto !== null) {
      this.mostrarMensaje('Por favor ingrese un monto válido', 'error');
    }
  }
  
  calcularProgreso(monto: number, meta: number): number {
    return Math.min(100, (monto / meta) * 100);
  }
  
  mostrarMensaje(mensaje: string, tipo: string = 'success') {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: tipo === 'success' ? ['success-snackbar'] : ['error-snackbar']
    });
  }
  
  cancelarEdicion() {
    this.bolsilloSeleccionado = null;
  }
  
  formatearMonto(monto: number): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(monto);
  }
  
  // Métodos adicionales para el componente
  
  getTotalAhorrado(): number {
    return this.bolsillos.reduce((total, bolsillo) => total + bolsillo.monto, 0);
  }
  
  getTotalMeta(): number {
    return this.bolsillos.reduce((total, bolsillo) => total + bolsillo.meta, 0);
  }
  
  getCuentaNombre(cuentaId: string): string {
    const cuenta = this.cuentas.find(c => c.id === cuentaId);
    return cuenta ? `${cuenta.numero} - ${cuenta.tipo}` : 'No disponible';
  }
  
  filtrarBolsillos(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.bolsillosFiltrados = this.bolsillos.filter(bolsillo => 
      bolsillo.nombre.toLowerCase().includes(filterValue) || 
      bolsillo.descripcion.toLowerCase().includes(filterValue)
    );
  }
  
  trackCuentaById(index: number, cuenta: Cuenta): string {
    return cuenta.id;
  }
}
