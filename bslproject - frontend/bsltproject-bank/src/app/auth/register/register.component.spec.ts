import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { RegisterComponent } from './register.component';
import { AuthService } from '../../core/services/seguridad/auth.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let routerMock: jasmine.SpyObj<Router>;
  let snackBarMock: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    authServiceMock = jasmine.createSpyObj('AuthService', ['register']);
    routerMock = jasmine.createSpyObj('Router', ['navigate']);
    snackBarMock = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        RegisterComponent,
        ReactiveFormsModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: MatSnackBar, useValue: snackBarMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.registerForm.value).toEqual({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  });

  it('should validate required fields', () => {
    const form = component.registerForm;
    expect(form.valid).toBeFalsy();
    
    form.patchValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'Pass123!',
      confirmPassword: 'Pass123!'
    });
    
    expect(form.valid).toBeTruthy();
  });

  it('should validate email format', () => {
    const emailControl = component.registerForm.get('email');
    emailControl?.setValue('invalid-email');
    expect(emailControl?.valid).toBeFalsy();
    
    emailControl?.setValue('valid@example.com');
    expect(emailControl?.valid).toBeTruthy();
  });

  it('should validate password match', () => {
    const form = component.registerForm;
    
    form.patchValue({
      password: 'Pass123!',
      confirmPassword: 'DifferentPass'
    });
    
    expect(form.hasError('passwordMismatch')).toBeTruthy();
    
    form.patchValue({
      confirmPassword: 'Pass123!'
    });
    
    expect(form.hasError('passwordMismatch')).toBeFalsy();
  });

  it('should toggle password visibility', () => {
    expect(component.hidePassword).toBeTruthy();
    component.togglePasswordVisibility();
    expect(component.hidePassword).toBeFalsy();
  });

  it('should handle successful registration', () => {
    authServiceMock.register.and.returnValue(of({ message: 'Registration successful' }));
    
    component.registerForm.patchValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'Pass123!',
      confirmPassword: 'Pass123!'
    });
    
    component.onSubmit();
    
    expect(authServiceMock.register).toHaveBeenCalled();
    expect(snackBarMock.open).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/auth/login'], jasmine.any(Object));
  });

  it('should handle registration error', () => {
    const errorMessage = 'Email already in use';
    authServiceMock.register.and.returnValue(throwError(() => ({ message: errorMessage })));
    
    component.registerForm.patchValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'Pass123!',
      confirmPassword: 'Pass123!'
    });
    
    component.onSubmit();
    
    expect(authServiceMock.register).toHaveBeenCalled();
    expect(component.errorMessage).toBe(errorMessage);
    expect(snackBarMock.open).toHaveBeenCalled();
  });
});
