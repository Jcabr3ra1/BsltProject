import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { UsuariosComponent } from './usuarios.component';
import { UsuariosService } from '../../../core/services/seguridad/usuarios.service';
import { User, Role, State } from '../../../core/models/seguridad/usuario.model';
import { of } from 'rxjs';

describe('UsuariosComponent', () => {
  let component: UsuariosComponent;
  let fixture: ComponentFixture<UsuariosComponent>;
  let usuariosService: jasmine.SpyObj<UsuariosService>;

  const mockRole: Role = {
    id: '1',
    name: 'USER',
    description: 'Regular user',
    permissions: ['READ', 'WRITE']
  };

  const mockState: State = {
    id: '1',
    name: 'ACTIVE',
    description: 'Active user'
  };

  const mockUser: User = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    role: mockRole,
    state: mockState,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const updatedMockUser: User = {
    ...mockUser,
    firstName: 'Jane'
  };

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('UsuariosService', [
      'getUsers',
      'getRoles',
      'getStates',
      'deleteUser',
      'updateUser',
      'assignRole',
      'updateState'
    ]);
    spy.getUsers.and.returnValue(of([mockUser]));
    spy.getRoles.and.returnValue(of([mockRole]));
    spy.getStates.and.returnValue(of([mockState]));

    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatSelectModule,
        MatPaginatorModule,
        MatTooltipModule,
        MatProgressSpinnerModule,
        MatInputModule,
        MatFormFieldModule,
        MatDialogModule,
        NoopAnimationsModule,
        HttpClientTestingModule
      ],
      declarations: [UsuariosComponent],
      providers: [
        { provide: UsuariosService, useValue: spy }
      ]
    }).compileComponents();

    usuariosService = TestBed.inject(UsuariosService) as jasmine.SpyObj<UsuariosService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UsuariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load users on init', () => {
    expect(usuariosService.getUsers).toHaveBeenCalled();
    expect(component.users).toEqual([mockUser]);
    expect(component.dataSource.data).toEqual([mockUser]);
  });

  it('should load roles on init', () => {
    expect(usuariosService.getRoles).toHaveBeenCalled();
    expect(component.roles).toEqual([mockRole]);
  });

  it('should load states on init', () => {
    expect(usuariosService.getStates).toHaveBeenCalled();
    expect(component.states).toEqual([mockState]);
  });

  it('should apply filter', () => {
    const event = new Event('input');
    Object.defineProperty(event, 'target', { value: { value: 'john' } });
    
    component.applyFilter(event);
    expect(component.dataSource.filter).toBe('john');
  });

  it('should handle empty filter', () => {
    const event = new Event('input');
    Object.defineProperty(event, 'target', { value: { value: '' } });
    
    component.applyFilter(event);
    expect(component.dataSource.filter).toBe('');
  });

  it('should handle whitespace filter', () => {
    const event = new Event('input');
    Object.defineProperty(event, 'target', { value: { value: '  john  ' } });
    
    component.applyFilter(event);
    expect(component.dataSource.filter).toBe('john');
  });

  it('should delete user', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    usuariosService.deleteUser.and.returnValue(of(void 0));

    component.deleteUser('1');
    expect(usuariosService.deleteUser).toHaveBeenCalledWith('1');
    expect(usuariosService.getUsers).toHaveBeenCalled();
  });

  it('should not delete user if not confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(false);

    component.deleteUser('1');
    expect(usuariosService.deleteUser).not.toHaveBeenCalled();
  });

  it('should update user', () => {
    usuariosService.updateUser.and.returnValue(of(updatedMockUser));

    component.updateUser(mockUser);
    expect(usuariosService.updateUser).toHaveBeenCalledWith('1', mockUser);
    expect(usuariosService.getUsers).toHaveBeenCalled();
  });

  it('should assign role', () => {
    usuariosService.assignRole.and.returnValue(of(void 0));

    component.assignRole('1', '2');
    expect(usuariosService.assignRole).toHaveBeenCalledWith('1', '2');
    expect(usuariosService.getUsers).toHaveBeenCalled();
  });

  it('should update state', () => {
    usuariosService.updateState.and.returnValue(of(void 0));

    component.updateState('1', '2');
    expect(usuariosService.updateState).toHaveBeenCalledWith('1', '2');
    expect(usuariosService.getUsers).toHaveBeenCalled();
  });
});
