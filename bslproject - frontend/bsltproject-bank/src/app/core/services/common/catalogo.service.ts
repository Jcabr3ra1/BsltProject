import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of, forkJoin } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';

import { EstadoTransaccionService } from '../finanzas/estado-transaccion.service';
import { TipoTransaccionService } from '../finanzas/tipo-transaccion.service';
import { RolService } from '../seguridad/rol.service';
import { EstadoService } from '../seguridad/estado.service';

import { EstadoTransaccion } from '@core/models/finanzas/estado-transaccion.enum';
import { TipoTransaccion } from '@core/models/finanzas/tipo-transaccion.model';

/**
 * Servicio centralizado para gestionar todos los catálogos de la aplicación
 * 
 * Este servicio permite obtener y cachear los datos de referencia como:
 * - Estados de transacción
 * - Tipos de transacción
 * - Roles
 * - Estados generales
 */
@Injectable({
  providedIn: 'root'
})
export class CatalogoService {
  // BehaviorSubjects para mantener los datos en memoria
  private estadosTransaccionSubject = new BehaviorSubject<EstadoTransaccion[]>([]);
  private tiposTransaccionSubject = new BehaviorSubject<TipoTransaccion[]>([]);
  private rolesSubject = new BehaviorSubject<any[]>([]);
  private estadosSubject = new BehaviorSubject<any[]>([]);

  // Observables públicos
  readonly estadosTransaccion$ = this.estadosTransaccionSubject.asObservable();
  readonly tiposTransaccion$ = this.tiposTransaccionSubject.asObservable();
  readonly roles$ = this.rolesSubject.asObservable();
  readonly estados$ = this.estadosSubject.asObservable();

  // Mapas para acceso rápido por ID
  private estadosTransaccionMap = new Map<string, EstadoTransaccion>();
  private tiposTransaccionMap = new Map<string, TipoTransaccion>();
  private rolesMap = new Map<string, any>();
  private estadosMap = new Map<string, any>();

  // Indicadores de carga
  private catalogosCargados = false;

  constructor(
    private estadoTransaccionService: EstadoTransaccionService,
    private tipoTransaccionService: TipoTransaccionService,
    private rolService: RolService,
    private estadoService: EstadoService
  ) {}

  /**
   * Carga todos los catálogos de la aplicación
   */
  cargarTodosCatalogos(): Observable<boolean> {
    if (this.catalogosCargados) {
      return of(true);
    }

    return forkJoin({
      estadosTransaccion: this.cargarEstadosTransaccion(),
      tiposTransaccion: this.cargarTiposTransaccion(),
      roles: this.cargarRoles(),
      estados: this.cargarEstados()
    }).pipe(
      map(() => {
        this.catalogosCargados = true;
        return true;
      }),
      catchError(error => {
        console.error('Error al cargar catálogos:', error);
        return of(false);
      })
    );
  }

  /**
   * Carga los estados de transacción
   */
  cargarEstadosTransaccion(): Observable<EstadoTransaccion[]> {
    return this.estadoTransaccionService.obtenerEstadosTransaccion().pipe(
      tap(estados => {
        this.estadosTransaccionSubject.next(estados);
        // Actualizar mapa
        this.estadosTransaccionMap.clear();
        estados.forEach(estado => {
          this.estadosTransaccionMap.set(estado.id, estado);
        });
      }),
      catchError(error => {
        console.error('Error al cargar estados de transacción:', error);
        return of([]);
      })
    );
  }

  /**
   * Carga los tipos de transacción
   */
  cargarTiposTransaccion(): Observable<TipoTransaccion[]> {
    return this.tipoTransaccionService.getTiposTransaccion().pipe(
      tap(tipos => {
        this.tiposTransaccionSubject.next(tipos);
        // Actualizar mapa
        this.tiposTransaccionMap.clear();
        tipos.forEach(tipo => {
          this.tiposTransaccionMap.set(tipo.id, tipo);
        });
      }),
      catchError(error => {
        console.error('Error al cargar tipos de transacción:', error);
        return of([]);
      })
    );
  }

  /**
   * Carga los roles
   */
  cargarRoles(): Observable<any[]> {
    return this.rolService.obtenerRoles().pipe(
      tap(roles => {
        this.rolesSubject.next(roles);
        // Actualizar mapa
        this.rolesMap.clear();
        roles.forEach(rol => {
          this.rolesMap.set(rol.id, rol);
        });
      }),
      catchError(error => {
        console.error('Error al cargar roles:', error);
        return of([]);
      })
    );
  }

  /**
   * Carga los estados generales
   */
  cargarEstados(): Observable<any[]> {
    return this.estadoService.obtenerEstados().pipe(
      tap(estados => {
        this.estadosSubject.next(estados);
        // Actualizar mapa
        this.estadosMap.clear();
        estados.forEach(estado => {
          this.estadosMap.set(estado.id, estado);
        });
      }),
      catchError(error => {
        console.error('Error al cargar estados:', error);
        return of([]);
      })
    );
  }

  /**
   * Obtiene un estado de transacción por su ID
   */
  getEstadoTransaccion(id: string): EstadoTransaccion | undefined {
    return this.estadosTransaccionMap.get(id);
  }

  /**
   * Obtiene un tipo de transacción por su ID
   */
  getTipoTransaccion(id: string): TipoTransaccion | undefined {
    return this.tiposTransaccionMap.get(id);
  }

  /**
   * Obtiene un rol por su ID
   */
  getRol(id: string): any | undefined {
    return this.rolesMap.get(id);
  }

  /**
   * Obtiene un estado por su ID
   */
  getEstado(id: string): any | undefined {
    return this.estadosMap.get(id);
  }

  /**
   * Obtiene el nombre de un estado de transacción
   */
  getNombreEstadoTransaccion(id: string): string {
    const estado = this.getEstadoTransaccion(id);
    return estado ? estado.nombre : id;
  }

  /**
   * Obtiene el nombre de un tipo de transacción
   */
  getNombreTipoTransaccion(id: string): string {
    const tipo = this.getTipoTransaccion(id);
    return tipo ? tipo.nombre : id;
  }

  /**
   * Obtiene el nombre de un rol
   */
  getNombreRol(id: string): string {
    const rol = this.getRol(id);
    return rol ? rol.nombre : id;
  }

  /**
   * Obtiene el nombre de un estado
   */
  getNombreEstado(id: string): string {
    const estado = this.getEstado(id);
    return estado ? estado.nombre : id;
  }

  /**
   * Obtiene todos los estados de transacción
   */
  getEstadosTransaccion(): EstadoTransaccion[] {
    return this.estadosTransaccionSubject.getValue();
  }

  /**
   * Obtiene todos los tipos de transacción
   */
  getTiposTransaccion(): TipoTransaccion[] {
    return this.tiposTransaccionSubject.getValue();
  }

  /**
   * Obtiene todos los roles
   */
  getRoles(): any[] {
    return this.rolesSubject.getValue();
  }

  /**
   * Obtiene todos los estados
   */
  getEstados(): any[] {
    return this.estadosSubject.getValue();
  }

  /**
   * Verifica si los catálogos ya fueron cargados
   */
  estanCatalogosCargados(): boolean {
    return this.catalogosCargados;
  }
}
