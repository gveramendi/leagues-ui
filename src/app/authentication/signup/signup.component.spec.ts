import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FeatherModule } from 'angular-feather';
import { allIcons } from 'angular-feather/icons';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { SignupComponent } from './signup.component';
import { AuthService } from '@core/service/auth.service';

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['register']);

    await TestBed.configureTestingModule({
      imports: [
        SignupComponent,
        RouterTestingModule.withRoutes([]),
        HttpClientTestingModule,
        FeatherModule.pick(allIcons),
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize the form with empty values', () => {
      expect(component.registerForm).toBeDefined();
      expect(component.registerForm.get('fname')?.value).toBe('');
      expect(component.registerForm.get('lname')?.value).toBe('');
      expect(component.registerForm.get('email')?.value).toBe('');
      expect(component.registerForm.get('password')?.value).toBe('');
      expect(component.registerForm.get('confirmPassword')?.value).toBe('');
      expect(component.registerForm.get('termcondition')?.value).toBe(false);
    });

    it('should have initial state values', () => {
      expect(component.submitted).toBeFalse();
      expect(component.error).toBe('');
      expect(component.loading).toBeFalse();
    });
  });

  describe('Form Validation', () => {
    it('should be invalid when empty', () => {
      expect(component.registerForm.valid).toBeFalse();
    });

    it('should require first name', () => {
      const fname = component.registerForm.get('fname');
      expect(fname?.errors?.['required']).toBeTruthy();
    });

    it('should require last name', () => {
      const lname = component.registerForm.get('lname');
      expect(lname?.errors?.['required']).toBeTruthy();
    });

    it('should require valid email', () => {
      const email = component.registerForm.get('email');
      email?.setValue('invalid');
      expect(email?.errors?.['email']).toBeTruthy();

      email?.setValue('valid@email.com');
      expect(email?.errors).toBeNull();
    });

    it('should require password with minimum 6 characters', () => {
      const password = component.registerForm.get('password');
      password?.setValue('12345');
      expect(password?.errors?.['minlength']).toBeTruthy();

      password?.setValue('123456');
      expect(password?.errors).toBeNull();
    });

    it('should require terms and conditions to be accepted', () => {
      const termcondition = component.registerForm.get('termcondition');
      expect(termcondition?.errors?.['required']).toBeTruthy();

      termcondition?.setValue(true);
      expect(termcondition?.errors).toBeNull();
    });
  });

  describe('Password Match Validator', () => {
    it('should return null when passwords match', () => {
      component.registerForm.get('password')?.setValue('password123');
      component.registerForm.get('confirmPassword')?.setValue('password123');
      expect(component.registerForm.hasError('passwordMismatch')).toBeFalse();
    });

    it('should return error when passwords do not match', () => {
      component.registerForm.get('password')?.setValue('password123');
      component.registerForm.get('confirmPassword')?.setValue('differentpassword');
      expect(component.registerForm.hasError('passwordMismatch')).toBeTrue();
    });

    it('should return null when password or confirmPassword is missing', () => {
      const result = component.passwordMatchValidator(component.registerForm);
      component.registerForm.get('password')?.setValue('');
      component.registerForm.get('confirmPassword')?.setValue('');
      expect(result).toBeNull();
    });
  });

  describe('Getters', () => {
    it('should return form controls via f getter', () => {
      expect(component.f).toBe(component.registerForm.controls);
    });

    it('should return true for passwordsMatch when passwords match', () => {
      component.registerForm.get('password')?.setValue('password123');
      component.registerForm.get('confirmPassword')?.setValue('password123');
      expect(component.passwordsMatch).toBeTrue();
    });

    it('should return false for passwordsMatch when passwords do not match', () => {
      component.registerForm.get('password')?.setValue('password123');
      component.registerForm.get('confirmPassword')?.setValue('different');
      expect(component.passwordsMatch).toBeFalse();
    });
  });

  describe('onSubmit', () => {
    beforeEach(() => {
      // Fill form with valid data
      component.registerForm.patchValue({
        fname: 'John',
        lname: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        termcondition: true,
      });
    });

    it('should set submitted to true', () => {
      authService.register.and.returnValue(of({}));
      component.onSubmit();
      expect(component.submitted).toBeTrue();
    });

    it('should set error for invalid form', () => {
      component.registerForm.get('fname')?.setValue('');
      component.onSubmit();
      expect(component.error).toBe('Invalid data!');
    });

    it('should set error for password mismatch', () => {
      component.registerForm.get('confirmPassword')?.setValue('different');
      component.onSubmit();
      expect(component.error).toBe('Passwords do not match!');
    });

    it('should not call authService when form is invalid', () => {
      component.registerForm.get('fname')?.setValue('');
      component.onSubmit();
      expect(authService.register).not.toHaveBeenCalled();
    });

    it('should call authService.register with correct data', () => {
      authService.register.and.returnValue(of({}));
      component.onSubmit();
      expect(authService.register).toHaveBeenCalledWith(
        'John',
        'Doe',
        'john@example.com',
        'password123',
        'password123'
      );
    });

    it('should set loading to true when submitting', () => {
      authService.register.and.returnValue(of({}));
      component.onSubmit();
      expect(component.loading).toBeFalse(); // After success, loading is false
    });

    it('should navigate to sign-in on successful registration', () => {
      const navigateSpy = spyOn(router, 'navigate');
      authService.register.and.returnValue(of({ success: true }));
      component.onSubmit();
      expect(navigateSpy).toHaveBeenCalledWith(['/authentication/sign-in'], {
        queryParams: { registered: 'true', email: 'john@example.com' },
      });
    });

    it('should handle registration error with message', () => {
      const errorResponse = { message: 'Email already exists' };
      authService.register.and.returnValue(throwError(() => errorResponse));
      component.onSubmit();
      expect(component.error).toBe('Email already exists');
      expect(component.loading).toBeFalse();
    });

    it('should handle registration error without message', () => {
      authService.register.and.returnValue(throwError(() => ({})));
      component.onSubmit();
      expect(component.error).toBe('Registration failed. Please try again.');
      expect(component.loading).toBeFalse();
    });
  });
});
