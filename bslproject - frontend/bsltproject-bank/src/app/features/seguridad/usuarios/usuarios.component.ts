import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';

import { UsuariosService } from '../../../core/services/seguridad/usuarios.service';
import { User, Role, State } from '../../../core/models/seguridad/usuario.model';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatSelectModule,
    MatPaginatorModule,
    MatSortModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule
  ],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss']
})
export class UsuariosComponent implements OnInit, AfterViewInit {
  readonly displayedColumns: string[] = ['id', 'nombre', 'apellido', 'email', 'rol', 'estado', 'actions'];
  dataSource: MatTableDataSource<User>;
  users: User[] = [];
  roles: Role[] = [];
  states: State[] = [];
  loading = false;
  error: string | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private readonly usuariosService: UsuariosService) {
    this.dataSource = new MatTableDataSource<User>();
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
    this.loadStates();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  loadUsers(): void {
    this.loading = true;
    this.error = null;
    this.usuariosService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.dataSource.data = users;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error completo en loadUsers:', error);
        this.error = `Error al cargar usuarios: ${error.message || 'Error desconocido'}. Estado: ${error.status || 'N/A'}. Detalles: ${error.error?.detail || JSON.stringify(error.error) || 'Sin detalles'}`;
        this.loading = false;
      }
    });
  }

  loadRoles(): void {
    this.usuariosService.getRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
      },
      error: (error: any) => {
        console.error('Error completo en loadRoles:', error);
        this.error = `Error al cargar roles: ${error.message || 'Error desconocido'}. Estado: ${error.status || 'N/A'}. Detalles: ${error.error?.detail || JSON.stringify(error.error) || 'Sin detalles'}`;
      }
    });
  }

  loadStates(): void {
    this.usuariosService.getStates().subscribe({
      next: (states) => {
        this.states = states;
      },
      error: (error: any) => {
        console.error('Error completo en loadStates:', error);
        this.error = `Error al cargar estados: ${error.message || 'Error desconocido'}. Estado: ${error.status || 'N/A'}. Detalles: ${error.error?.detail || JSON.stringify(error.error) || 'Sin detalles'}`;
      }
    });
  }

  deleteUser(userId: string): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.usuariosService.deleteUser(userId).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (error: any) => {
          this.error = 'Error deleting user: ' + error.message;
        }
      });
    }
  }

  updateUser(user: User): void {
    this.usuariosService.updateUser(user.id, user).subscribe({
      next: () => {
        this.loadUsers();
      },
      error: (error: any) => {
        this.error = 'Error updating user: ' + error.message;
      }
    });
  }

  assignRole(userId: string, roleId: string): void {
    this.usuariosService.assignRole(userId, roleId).subscribe({
      next: () => {
        this.loadUsers();
      },
      error: (error: any) => {
        this.error = 'Error assigning role: ' + error.message;
      }
    });
  }

  assignState(userId: string, stateId: string): void {
    this.usuariosService.assignState(userId, stateId).subscribe({
      next: () => {
        this.loadUsers();
      },
      error: (error: any) => {
        this.error = 'Error updating state: ' + error.message;
      }
    });
  }
}
