import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { HttpService } from '../http/http.service';
import { User, Role, State, LoginResponse } from '../../models/seguridad/usuario.model';
import { of } from 'rxjs';

describe('AuthService', () => {
  let service: AuthService;
  let httpService: HttpService;

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

  const mockLoginResponse: LoginResponse = {
    token: 'mock-token',
    refreshToken: 'mock-refresh-token',
    user: mockUser,
    expiracion: 3600
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService, HttpService]
    });
    service = TestBed.inject(AuthService);
    httpService = TestBed.inject(HttpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should login successfully', (done) => {
      const email = 'john@example.com';
      const password = 'password123';

      spyOn(httpService, 'post').and.returnValue(of(mockLoginResponse));

      service.login(email, password).subscribe({
        next: (response) => {
          expect(response).toEqual(mockLoginResponse);
          expect(localStorage.getItem('token')).toBe('mock-token');
          expect(localStorage.getItem('refreshToken')).toBe('mock-refresh-token');
          done();
        },
        error: done.fail
      });
    });

    it('should handle login error', (done) => {
      const email = 'john@example.com';
      const password = 'wrong-password';
      const mockError = { message: 'Invalid credentials' };

      spyOn(httpService, 'post').and.returnValue(of(mockError));

      service.login(email, password).subscribe({
        next: () => done.fail('Should have failed'),
        error: (error) => {
          expect(error).toEqual(mockError);
          expect(localStorage.getItem('token')).toBeNull();
          expect(localStorage.getItem('refreshToken')).toBeNull();
          done();
        }
      });
    });
  });

  describe('logout', () => {
    it('should clear local storage and reset authentication state', (done) => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('refreshToken', 'test-refresh-token');
      localStorage.setItem('user', JSON.stringify(mockUser));

      service.logout().subscribe({
        next: () => {
          expect(localStorage.getItem('token')).toBeNull();
          expect(localStorage.getItem('refreshToken')).toBeNull();
          expect(localStorage.getItem('user')).toBeNull();
          done();
        },
        error: done.fail
      });
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', (done) => {
      localStorage.setItem('refreshToken', 'old-refresh-token');

      const mockRefreshResponse: LoginResponse = {
        token: 'new-token',
        refreshToken: 'new-refresh-token',
        expiracion: 3600
      };

      spyOn(httpService, 'post').and.returnValue(of(mockRefreshResponse));

      service.refreshToken().subscribe({
        next: (response) => {
          expect(response).toEqual(mockRefreshResponse);
          expect(localStorage.getItem('token')).toBe('new-token');
          expect(localStorage.getItem('refreshToken')).toBe('new-refresh-token');
          done();
        },
        error: done.fail
      });
    });

    it('should handle refresh token error', (done) => {
      localStorage.setItem('refreshToken', 'invalid-refresh-token');
      const mockError = { message: 'Invalid refresh token' };

      spyOn(httpService, 'post').and.returnValue(of(mockError));

      service.refreshToken().subscribe({
        next: () => done.fail('Should have failed'),
        error: (error) => {
          expect(error).toEqual(mockError);
          done();
        }
      });
    });
  });
});
