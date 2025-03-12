import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/seguridad/auth.service';
import { of } from 'rxjs';

describe('authGuard', () => {
  let router: Router;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    authService = jasmine.createSpyObj('AuthService', ['isAuthenticated$']);
    
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authService }
      ]
    });

    router = TestBed.inject(Router);
  });

  it('should redirect to login and return false when not authenticated', (done) => {
    const navigateSpy = spyOn(router, 'navigate');
    authService.isAuthenticated$ = of(false);

    const guard = authGuard();
    guard.subscribe(result => {
      expect(result).toBeFalse();
      expect(navigateSpy).toHaveBeenCalledWith(['/auth/login']);
      done();
    });
  });

  it('should return true when authenticated', (done) => {
    authService.isAuthenticated$ = of(true);

    const guard = authGuard();
    guard.subscribe(result => {
      expect(result).toBeTrue();
      done();
    });
  });
});
