import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../../../environments/environment';
import { UsuariosService } from './usuarios.service';
import { User, Role, State } from '../../models/seguridad/usuario.model';

describe('UsuariosService', () => {
  let service: UsuariosService;
  let httpMock: HttpTestingController;

  const baseUrl = `${environment.securityUrl}/users`;
  const rolesUrl = `${environment.securityUrl}/roles`;
  const statesUrl = `${environment.securityUrl}/states`;

  const mockRole: Role = {
    id: '1',
    name: 'USER',
    description: 'Regular user'
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

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UsuariosService]
    });

    service = TestBed.inject(UsuariosService);
    httpMock = TestBed.inject(HttpTestingController);

    // Mock token in localStorage
    localStorage.setItem('token', 'mock-token');
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('User Management', () => {
    it('should get all users', (done) => {
      const mockUsers = [mockUser];

      service.getUsers().subscribe({
        next: (users) => {
          expect(users).toEqual(mockUsers);
          done();
        }
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe('Bearer mock-token');
      req.flush(mockUsers);
    });

    it('should get a single user', (done) => {
      service.getUser('1').subscribe({
        next: (user) => {
          expect(user).toEqual(mockUser);
          done();
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);
    });

    it('should create a new user', (done) => {
      const newUser: Partial<User> = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        role: mockRole,
        state: mockState
      };

      service.createUser(newUser).subscribe({
        next: (user) => {
          expect(user.firstName).toBe(newUser.firstName);
          done();
        }
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newUser);
      req.flush({ ...mockUser, ...newUser });
    });

    it('should update a user', (done) => {
      const updates: Partial<User> = {
        firstName: 'John Updated'
      };

      service.updateUser('1', updates).subscribe({
        next: (user) => {
          expect(user.firstName).toBe(updates.firstName);
          done();
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updates);
      req.flush({ ...mockUser, ...updates });
    });

    it('should delete a user', (done) => {
      service.deleteUser('1').subscribe({
        next: () => {
          done();
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('Role Management', () => {
    it('should get all roles', (done) => {
      const mockRoles = [mockRole];

      service.getRoles().subscribe({
        next: (roles) => {
          expect(roles).toEqual(mockRoles);
          done();
        }
      });

      const req = httpMock.expectOne(rolesUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockRoles);
    });

    it('should get a single role', (done) => {
      service.getRole('1').subscribe({
        next: (role) => {
          expect(role).toEqual(mockRole);
          done();
        }
      });

      const req = httpMock.expectOne(`${rolesUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockRole);
    });

    it('should assign a role to a user', (done) => {
      service.assignRole('1', '1').subscribe({
        next: () => {
          done();
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/1/roles/1`);
      expect(req.request.method).toBe('POST');
      req.flush(null);
    });
  });

  describe('State Management', () => {
    it('should get all states', (done) => {
      const mockStates = [mockState];

      service.getStates().subscribe({
        next: (states) => {
          expect(states).toEqual(mockStates);
          done();
        }
      });

      const req = httpMock.expectOne(statesUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockStates);
    });

    it('should get a single state', (done) => {
      service.getState('1').subscribe({
        next: (state) => {
          expect(state).toEqual(mockState);
          done();
        }
      });

      const req = httpMock.expectOne(`${statesUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockState);
    });

    it('should update a user state', (done) => {
      service.updateState('1', '1').subscribe({
        next: () => {
          done();
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/1/states/1`);
      expect(req.request.method).toBe('POST');
      req.flush(null);
    });
  });

  describe('Error Handling', () => {
    it('should handle HTTP errors', (done) => {
      service.getUsers().subscribe({
        error: (error) => {
          expect(error.message).toContain('Server error: 404');
          done();
        }
      });

      const req = httpMock.expectOne(baseUrl);
      req.flush('Not Found', {
        status: 404,
        statusText: 'Not Found'
      });
    });

    it('should handle client-side errors', (done) => {
      service.getUsers().subscribe({
        error: (error) => {
          expect(error.message).toContain('Client error');
          done();
        }
      });

      const req = httpMock.expectOne(baseUrl);
      req.error(new ErrorEvent('Network error'));
    });

    it('should handle missing authorization token', (done) => {
      localStorage.removeItem('token');

      service.getUsers().subscribe({
        error: (error) => {
          expect(error.message).toContain('Unauthorized');
          done();
        }
      });

      const req = httpMock.expectOne(baseUrl);
      req.flush('Unauthorized', {
        status: 401,
        statusText: 'Unauthorized'
      });
    });
  });
});
