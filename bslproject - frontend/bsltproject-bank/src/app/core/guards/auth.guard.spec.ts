import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../services/seguridad/auth.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let authStateSubject: BehaviorSubject<boolean>;

  beforeEach(() => {
    authStateSubject = new BehaviorSubject<boolean>(false);
    
    const authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      isAuthenticated$: authStateSubject.asObservable()
    });

    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    guard = TestBed.inject(AuthGuard);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow access when authenticated', (done: DoneFn) => {
    authStateSubject.next(true);

    guard.canActivate().subscribe(allowed => {
      expect(allowed).toBe(true);
      expect(router.navigate).not.toHaveBeenCalled();
      done();
    });
  });

  it('should redirect to login and deny access when not authenticated', (done: DoneFn) => {
    authStateSubject.next(false);

    guard.canActivate().subscribe(allowed => {
      expect(allowed).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
      done();
    });
  });
});
