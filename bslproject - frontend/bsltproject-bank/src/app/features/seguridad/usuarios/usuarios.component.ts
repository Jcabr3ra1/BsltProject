import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Usuario, RolUsuario, EstadoUsuario } from '../../../core/models/seguridad/usuario.model';
import { UsuariosService } from '../../../core/services/seguridad/usuarios.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { UsuarioDialogComponent } from './usuario-dialog/usuario-dialog.component';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss']
})
export class UsuariosComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  // Datos y configuración
  dataSource = new MatTableDataSource<Usuario>([]);
  displayedColumns: string[] = ['id', 'nombre', 'email', 'rol', 'estado', 'cuenta', 'acciones'];
  loading = false;
  error: string | null = null;
  
  // Filtros
  filtroForm = new FormGroup({
    texto: new FormControl(''),
    rol: new FormControl(''),
    estado: new FormControl('')
  });
  filtroRol: string | null = null;
  filtroEstado: string | null = null;
  filtroTexto: string = '';
  
  // Definición de roles y estados
  roles: { id: string; name: string; icon: string; class: string }[] = [
    { id: 'ADMIN', name: 'Administrador', icon: 'admin_panel_settings', class: 'rol-admin' },
    { id: 'CLIENTE', name: 'Cliente', icon: 'person', class: 'rol-cliente' },
    { id: 'EMPLEADO', name: 'Empleado', icon: 'badge', class: 'rol-empleado' },
    // Añadir roles adicionales que puedan venir de la base de datos
    { id: 'GERENTE', name: 'Gerente', icon: 'business', class: 'rol-admin' },
    { id: 'SUPERVISOR', name: 'Supervisor', icon: 'supervisor_account', class: 'rol-empleado' },
    { id: 'ANALISTA', name: 'Analista', icon: 'analytics', class: 'rol-empleado' }
  ];

  estados: { id: string; name: string; class: string; icon: string }[] = [
    { id: 'ACTIVO', name: 'Activo', class: 'estado-activo', icon: 'check_circle' },
    { id: 'INACTIVO', name: 'Inactivo', class: 'estado-inactivo', icon: 'cancel' },
    { id: 'PENDIENTE', name: 'Pendiente', class: 'estado-pendiente', icon: 'schedule' },
    { id: 'BLOQUEADO', name: 'Bloqueado', class: 'estado-bloqueado', icon: 'block' },
    // Añadir estados adicionales que puedan venir de la base de datos
    { id: 'SUSPENDIDO', name: 'Suspendido', class: 'estado-bloqueado', icon: 'pause_circle' },
    { id: 'VERIFICANDO', name: 'Verificando', class: 'estado-pendiente', icon: 'fact_check' }
  ];
  
  // Control de permisos
  tienePermisosAdmin = true; // Esto debería venir de un servicio de autenticación

  intervaloRecarga: any;

  constructor(
    private usuariosService: UsuariosService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // Inicializar la lista de roles y estados
    this.inicializarRolesYEstados();
    
    // Cargar los usuarios
    this.cargarUsuarios();
    
    // Configurar el intervalo para recargar los usuarios cada 30 segundos
    this.intervaloRecarga = setInterval(() => {
      this.cargarUsuarios(false);
    }, 30000);
  }

  ngOnDestroy(): void {
    clearInterval(this.intervaloRecarga);
  }

  /**
   * Inicializa las listas de roles y estados
   */
  inicializarRolesYEstados(): void {
    // Puedes agregar lógica aquí para inicializar roles y estados dinámicamente
  }

  /**
   * Carga los usuarios desde el servicio
   */
  cargarUsuarios(mostrarCarga: boolean = true): void {
    if (mostrarCarga) {
      this.loading = true;
    }
    this.error = null;
    
    // Obtener el token para las peticiones
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
    
    // Intentar obtener los datos directamente del API Gateway
    this.http.get(`${this.usuariosService.getApiUrl()}/seguridad/usuarios`, { headers }).subscribe({
      next: (response) => {
        console.log('Respuesta directa del API Gateway:', response);
      },
      error: (error) => {
        console.error('Error al obtener datos directamente del API Gateway:', error);
      }
    });
    
    // Continuar con la carga normal a través del servicio
    this.usuariosService.getUsuarios().subscribe({
      next: (usuarios) => {
        console.log('Usuarios cargados (datos crudos):', JSON.stringify(usuarios));
        
        if (usuarios.length === 0) {
          console.warn('No se encontraron usuarios en la respuesta del servidor');
          this.error = 'No se encontraron usuarios.';
          this.loading = false;
          return;
        }
        
        // Procesar los usuarios para asegurarnos de que tienen todos los campos necesarios
        const usuariosProcesados = usuarios.map(usuario => {
          console.log('Usuario antes de procesar:', JSON.stringify(usuario));
          
          // Asegurarnos de que tenemos todas las propiedades necesarias
          const usuarioProcesado: Usuario = {
            // Propiedades requeridas
            id: usuario.id || usuario._id || '',
            nombre: usuario.nombre || usuario.name || '',
            email: usuario.email || usuario.correo || '',
            
            // Propiedades opcionales con tipado correcto
            apellido: usuario.apellido || usuario.lastName || '',
            rol: this.normalizarRol(usuario.rol || usuario.role),
            estado: this.normalizarEstado(usuario.estado || usuario.status),
            
            // Normalizar cuenta - asegurarse de que es string | Cuenta | undefined
            cuenta: usuario.cuenta || usuario.account || undefined,
            
            // Extraer ID de cuenta de manera segura
            accountId: this.extraerAccountId(usuario)
          };
          
          console.log('Usuario después de procesar:', JSON.stringify(usuarioProcesado));
          return usuarioProcesado;
        });
        
        // Asignar datos procesados al dataSource
        this.dataSource.data = usuariosProcesados;
        
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.dataSource.filterPredicate = this.filterPredicate;
        this.loading = false;
        
        // Aplicar filtros si hay alguno activo
        this.aplicarFiltros();
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        this.error = 'Error al cargar usuarios. Por favor, intente nuevamente.';
        this.loading = false;
      }
    });
  }
  
  /**
   * Extrae el ID de cuenta de un usuario con verificación de tipos
   */
  private extraerAccountId(usuario: any): string | undefined {
    if (usuario.accountId) {
      return usuario.accountId;
    }
    
    if (usuario.cuentaId) {
      return usuario.cuentaId;
    }
    
    // Verificar cuenta como objeto
    if (usuario.cuenta && typeof usuario.cuenta === 'object') {
      if (usuario.cuenta.id) {
        return usuario.cuenta.id;
      }
      if (usuario.cuenta._id) {
        return usuario.cuenta._id;
      }
    }
    
    // Verificar account como objeto
    if (usuario.account && typeof usuario.account === 'object') {
      if (usuario.account.id) {
        return usuario.account.id;
      }
      if (usuario.account._id) {
        return usuario.account._id;
      }
    }
    
    // Verificar si cuenta es directamente un string (ID)
    if (usuario.cuenta && typeof usuario.cuenta === 'string') {
      return usuario.cuenta;
    }
    
    // Verificar si account es directamente un string (ID)
    if (usuario.account && typeof usuario.account === 'string') {
      return usuario.account;
    }
    
    return undefined;
  }

  /**
   * Normaliza el rol para asegurar consistencia
   */
  normalizarRol(rol: any): string {
    if (!rol) return 'DESCONOCIDO';
    
    // Si es un objeto, intentar extraer el ID o nombre
    if (typeof rol === 'object') {
      return (rol.id || rol._id || rol.nombre || rol.name || 'DESCONOCIDO').toString().toUpperCase();
    }
    
    // Si es string, convertir a mayúsculas
    return rol.toString().toUpperCase();
  }
  
  /**
   * Normaliza el estado para asegurar consistencia
   */
  normalizarEstado(estado: any): string {
    if (!estado) return 'DESCONOCIDO';
    
    // Si es un objeto, intentar extraer el ID o nombre
    if (typeof estado === 'object') {
      return (estado.id || estado._id || estado.nombre || estado.name || 'DESCONOCIDO').toString().toUpperCase();
    }
    
    // Si es string, convertir a mayúsculas
    return estado.toString().toUpperCase();
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.filtroTexto = filterValue.trim().toLowerCase();
    this.aplicarFiltros();
  }

  /**
   * Aplica los filtros seleccionados a la tabla
   */
  aplicarFiltros(): void {
    // Guardar una copia de los datos originales si no existe
    const datosOriginales = this.dataSource.data;
    
    const filtroTexto = this.filtroForm.get('texto')?.value || '';
    const filtroRol = this.filtroForm.get('rol')?.value || '';
    const filtroEstado = this.filtroForm.get('estado')?.value || '';
    
    // Primero aplicamos los filtros de rol y estado
    let datosFiltrados = [...datosOriginales]; // Hacer una copia para no mutar los originales
    
    if (filtroRol || filtroEstado) {
      datosFiltrados = datosFiltrados.filter(usuario => {
        const matchesRol = !filtroRol || usuario.rol === filtroRol;
        const matchesEstado = !filtroEstado || usuario.estado === filtroEstado;
        return matchesRol && matchesEstado;
      });
    }
    
    // Actualizar la data source con los datos filtrados
    this.dataSource.data = datosFiltrados;
    
    // Luego aplicamos el filtro de texto
    if (filtroTexto) {
      this.dataSource.filter = filtroTexto.trim().toLowerCase();
    } else {
      this.dataSource.filter = '';
    }
    
    // Si el paginador existe, volver a la primera página
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  /**
   * Función de filtrado personalizada para la tabla
   */
  private get filterPredicate(): (data: Usuario, filter: string) => boolean {
    return (data: Usuario, filter: string): boolean => {
      if (!filter) return true;
      
      const filterValue = filter.toLowerCase();
      
      // Datos a filtrar
      const nombre = data.nombre ? data.nombre.toLowerCase() : '';
      const apellido = data.apellido ? data.apellido.toLowerCase() : '';
      const email = data.email ? data.email.toLowerCase() : '';
      const rolName = this.getRolName(data.rol as string).toLowerCase();
      const estadoName = this.getEstadoName(data.estado as string).toLowerCase();
      const cuentaInfo = this.getCuentaInfo(data).toLowerCase();
      
      // Verificar si alguno de los campos contiene el texto de filtro
      return nombre.includes(filterValue) || 
             apellido.includes(filterValue) || 
             email.includes(filterValue) || 
             rolName.includes(filterValue) || 
             estadoName.includes(filterValue) || 
             cuentaInfo.includes(filterValue);
    };
  }

  toggleEstadoUsuario(usuario: Usuario): void {
    const nuevoEstado = usuario.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    this.onEstadoChange(usuario, nuevoEstado);
  }

  onEstadoChange(usuario: Usuario, nuevoEstado: string): void {
    const usuarioActualizado = { ...usuario, estado: nuevoEstado };
    
    this.usuariosService.actualizarUsuario(usuario.id, usuarioActualizado).subscribe({
      next: () => {
        // Actualizar el usuario en la tabla
        const index = this.dataSource.data.findIndex(u => u.id === usuario.id);
        if (index !== -1) {
          this.dataSource.data[index].estado = nuevoEstado;
          this.dataSource._updateChangeSubscription();
        }
        
        this.snackBar.open(`Estado del usuario actualizado a ${this.getEstadoName(nuevoEstado)}`, 'Cerrar', {
          duration: 3000,
          panelClass: 'success-snackbar'
        });
      },
      error: (error) => {
        console.error('Error al actualizar estado del usuario:', error);
        this.snackBar.open('Error al actualizar el estado del usuario', 'Cerrar', {
          duration: 3000,
          panelClass: 'error-snackbar'
        });
      }
    });
  }

  onRolChange(usuario: Usuario, nuevoRol: string): void {
    const usuarioActualizado = { ...usuario, rol: nuevoRol };
    
    this.usuariosService.actualizarUsuario(usuario.id, usuarioActualizado).subscribe({
      next: () => {
        // Actualizar el usuario en la tabla
        const index = this.dataSource.data.findIndex(u => u.id === usuario.id);
        if (index !== -1) {
          this.dataSource.data[index].rol = nuevoRol;
          this.dataSource._updateChangeSubscription();
        }
        
        this.snackBar.open(`Rol del usuario actualizado a ${this.getRolName(nuevoRol)}`, 'Cerrar', {
          duration: 3000,
          panelClass: 'success-snackbar'
        });
      },
      error: (error) => {
        console.error('Error al actualizar rol del usuario:', error);
        this.snackBar.open('Error al actualizar el rol del usuario', 'Cerrar', {
          duration: 3000,
          panelClass: 'error-snackbar'
        });
      }
    });
  }

  editarUsuario(usuario: Usuario): void {
    const dialogRef = this.dialog.open(UsuarioDialogComponent, {
      width: '500px',
      data: { usuario: { ...usuario }, modo: 'editar' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarUsuarios();
      }
    });
  }

  eliminarUsuario(usuario: Usuario): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmar eliminación',
        message: `¿Está seguro que desea eliminar al usuario ${usuario.nombre} ${usuario.apellido}?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.usuariosService.eliminarUsuario(usuario.id).subscribe({
          next: () => {
            this.dataSource.data = this.dataSource.data.filter(u => u.id !== usuario.id);
            this.snackBar.open('Usuario eliminado correctamente', 'Cerrar', {
              duration: 3000,
              panelClass: 'success-snackbar'
            });
          },
          error: (error) => {
            console.error('Error al eliminar usuario:', error);
            this.snackBar.open('Error al eliminar el usuario', 'Cerrar', {
              duration: 3000,
              panelClass: 'error-snackbar'
            });
          }
        });
      }
    });
  }

  crearNuevoUsuario(): void {
    const dialogRef = this.dialog.open(UsuarioDialogComponent, {
      width: '500px',
      data: { usuario: {}, modo: 'crear' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarUsuarios();
      }
    });
  }

  asignarCuenta(usuario: Usuario): void {
    // Implementar lógica para asignar cuenta
    this.snackBar.open('Funcionalidad de asignación de cuenta en desarrollo', 'Cerrar', {
      duration: 3000
    });
  }

  /**
   * Limpia todos los filtros y recarga los datos originales
   */
  limpiarFiltros(): void {
    // Resetear el formulario
    this.filtroForm.reset({
      texto: '',
      rol: '',
      estado: ''
    });
    
    // Recargar los usuarios originales
    this.cargarUsuarios();
  }

  /**
   * Obtiene el nombre del rol a partir de su código
   */
  getRolName(rol: string): string {
    console.log('Obteniendo nombre del rol:', rol);
    
    if (!rol) {
      return 'Desconocido';
    }
    
    // Convertir a mayúsculas para asegurar la coincidencia
    const rolUpperCase = typeof rol === 'string' ? rol.toUpperCase() : rol;
    
    switch (rolUpperCase) {
      case 'ADMIN':
        return 'Administrador';
      case 'CLIENTE':
        return 'Cliente';
      case 'EMPLEADO':
        return 'Empleado';
      default:
        // Si el rol no coincide con ninguno de los valores predefinidos,
        // pero tiene un valor, mostrarlo tal cual
        return rol || 'Desconocido';
    }
  }

  /**
   * Obtiene el nombre del estado a partir de su código
   */
  getEstadoName(estado: string): string {
    console.log('Obteniendo nombre del estado:', estado);
    
    if (!estado) {
      return 'Desconocido';
    }
    
    // Convertir a mayúsculas para asegurar la coincidencia
    const estadoUpperCase = typeof estado === 'string' ? estado.toUpperCase() : estado;
    
    switch (estadoUpperCase) {
      case 'ACTIVO':
        return 'Activo';
      case 'INACTIVO':
        return 'Inactivo';
      case 'PENDIENTE':
        return 'Pendiente';
      case 'BLOQUEADO':
        return 'Bloqueado';
      default:
        // Si el estado no coincide con ninguno de los valores predefinidos,
        // pero tiene un valor, mostrarlo tal cual
        return estado || 'Desconocido';
    }
  }

  /**
   * Obtiene el icono del rol según su ID
   */
  getRolIcon(rolId: string): string {
    if (!rolId) return 'help_outline';
    
    // Normalizar el ID del rol (convertir a mayúsculas)
    const rolIdNormalizado = typeof rolId === 'string' ? rolId.toUpperCase() : rolId;
    
    // Buscar el rol en la lista de roles
    const rol = this.roles.find(r => r.id === rolIdNormalizado);
    
    return rol ? rol.icon : 'help_outline';
  }

  /**
   * Obtiene la clase CSS del rol según su ID
   */
  getRolClass(rolId: string): string {
    if (!rolId) return 'rol-default';
    
    // Normalizar el ID del rol (convertir a mayúsculas)
    const rolIdNormalizado = typeof rolId === 'string' ? rolId.toUpperCase() : rolId;
    
    // Buscar el rol en la lista de roles
    const rol = this.roles.find(r => r.id === rolIdNormalizado);
    
    return rol ? rol.class : 'rol-default';
  }

  /**
   * Obtiene el icono del estado según su ID
   */
  getEstadoIcon(estadoId: string): string {
    if (!estadoId) return 'help_outline';
    
    // Normalizar el ID del estado (convertir a mayúsculas)
    const estadoIdNormalizado = typeof estadoId === 'string' ? estadoId.toUpperCase() : estadoId;
    
    // Buscar el estado en la lista de estados
    const estado = this.estados.find(e => e.id === estadoIdNormalizado);
    
    return estado ? estado.icon : 'help_outline';
  }

  /**
   * Obtiene la clase CSS del estado según su ID
   */
  getEstadoClass(estadoId: string): string {
    if (!estadoId) return 'estado-default';
    
    // Normalizar el ID del estado (convertir a mayúsculas)
    const estadoIdNormalizado = typeof estadoId === 'string' ? estadoId.toUpperCase() : estadoId;
    
    // Buscar el estado en la lista de estados
    const estado = this.estados.find(e => e.id === estadoIdNormalizado);
    
    return estado ? estado.class : 'estado-default';
  }

  /**
   * Verifica si un usuario tiene cuenta asignada
   */
  tieneCuenta(usuario: Usuario): boolean {
    if (!usuario) return false;
    const cuentaId = this.getCuentaId(usuario);
    return cuentaId !== undefined && cuentaId !== null && cuentaId !== '';
  }

  /**
   * Obtiene el ID de la cuenta del usuario, considerando diferentes formatos
   */
  getCuentaId(usuario: Usuario): string | undefined {
    if (!usuario) return undefined;
    
    // Verificar todas las posibles ubicaciones del ID de cuenta
    if (usuario.accountId) {
      return usuario.accountId;
    }
    
    if (usuario.cuentaId) {
      return usuario.cuentaId;
    }
    
    // Verificar si cuenta es un objeto
    if (usuario.cuenta && typeof usuario.cuenta === 'object') {
      if (usuario.cuenta.id) {
        return usuario.cuenta.id;
      }
      
      if (usuario.cuenta._id) {
        return usuario.cuenta._id;
      }
    }
    
    // Verificar si cuenta es directamente un string (ID)
    if (usuario.cuenta && typeof usuario.cuenta === 'string') {
      return usuario.cuenta;
    }
    
    // Si no encontramos un ID de cuenta, devolver undefined
    return undefined;
  }

  /**
   * Obtiene la información de la cuenta del usuario
   */
  getCuentaInfo(usuario: Usuario): string {
    if (!usuario) return 'Sin información';
    
    // Verificar todas las posibles ubicaciones del ID de cuenta
    const accountId = this.getCuentaId(usuario);
    
    if (!accountId) {
      return 'Sin cuenta asignada';
    }
    
    // Si tenemos información detallada de la cuenta, mostrarla
    if (usuario.cuenta && typeof usuario.cuenta === 'object') {
      const cuenta = usuario.cuenta;
      const numero = cuenta.numero || cuenta.numero_cuenta || cuenta.number || 'N/A';
      
      // Corregir la condición para saldo/balance
      const saldo = cuenta.saldo !== undefined ? `$${cuenta.saldo.toFixed(2)}` : 
                   cuenta.balance !== undefined ? `$${cuenta.balance.toFixed(2)}` : 'N/A';
      
      const tipo = cuenta.tipo || cuenta.type || 'Cuenta';
      
      return `${tipo} - ${numero} (${saldo})`;
    }
    
    return `ID: ${accountId}`;
  }
}
