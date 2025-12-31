import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FeatherModule } from 'angular-feather';
import { allIcons } from 'angular-feather/icons';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError, BehaviorSubject } from 'rxjs';

import { SigninComponent } from './signin.component';
import { AuthService } from '@core';

describe('SigninComponent', () => {
  let component: SigninComponent;
  let fixture: ComponentFixture<SigninComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;
  let queryParamsSubject: BehaviorSubject<any>;

  beforeEach(waitForAsync(() => {
    queryParamsSubject = new BehaviorSubject({});
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['login'], {
      currentUserValue: { token: 'test-token' },
    });

    TestBed.configureTestingModule({
      imports: [
        SigninComponent,
        RouterTestingModule.withRoutes([]),
        HttpClientTestingModule,
        FeatherModule.pick(allIcons),
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: { queryParams: queryParamsSubject.asObservable() },
        },
      ],
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SigninComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize the form with empty values', () => {
      expect(component.loginForm).toBeDefined();
      expect(component.loginForm.get('username')?.value).toBe('');
      expect(component.loginForm.get('password')?.value).toBe('');
    });

    it('should have initial state values', () => {
      expect(component.submitted).toBeFalse();
      expect(component.error).toBe('');
      expect(component.successMessage).toBe('');
      expect(component.hide).toBeTrue();
    });
  });

  describe('Form Validation', () => {
    it('should be invalid when empty', () => {
      expect(component.loginForm.valid).toBeFalse();
    });

    it('should require username', () => {
      const username = component.loginForm.get('username');
      expect(username?.errors?.['required']).toBeTruthy();
    });

    it('should require password', () => {
      const password = component.loginForm.get('password');
      expect(password?.errors?.['required']).toBeTruthy();
    });

    it('should be valid with username and password', () => {
      component.loginForm.patchValue({
        username: 'testuser',
        password: 'password123',
      });
      expect(component.loginForm.valid).toBeTrue();
    });
  });

  describe('Getters', () => {
    it('should return form controls via f getter', () => {
      expect(component.f).toBe(component.loginForm.controls);
    });
  });

  describe('Query Params Handling', () => {
    it('should set success message when registered param is true', () => {
      queryParamsSubject.next({ registered: 'true' });
      fixture.detectChanges();
      expect(component.successMessage).toBe(
        'Registration successful! Please sign in with your credentials.'
      );
    });

    it('should prefill username with email from query params', () => {
      queryParamsSubject.next({ registered: 'true', email: 'test@example.com' });
      fixture.detectChanges();
      expect(component.loginForm.get('username')?.value).toBe('test@example.com');
    });

    it('should not set success message when registered param is not true', () => {
      queryParamsSubject.next({ registered: 'false' });
      fixture.detectChanges();
      expect(component.successMessage).toBe('');
    });
  });

  describe('onSubmit', () => {
    beforeEach(() => {
      component.loginForm.patchValue({
        username: 'testuser',
        password: 'password123',
      });
    });

    it('should set submitted to true', () => {
      authService.login.and.returnValue(of({}));
      component.onSubmit();
      expect(component.submitted).toBeTrue();
    });

    it('should set error for invalid form', () => {
      component.loginForm.get('username')?.setValue('');
      component.onSubmit();
      expect(component.error).toBe('Username and Password not valid !');
    });

    it('should not call authService when form is invalid', () => {
      component.loginForm.get('username')?.setValue('');
      component.onSubmit();
      expect(authService.login).not.toHaveBeenCalled();
    });

    it('should call authService.login with correct credentials', () => {
      authService.login.and.returnValue(of({}));
      component.onSubmit();
      expect(authService.login).toHaveBeenCalledWith('testuser', 'password123');
    });

    it('should navigate to dashboard on successful login with token', () => {
      const navigateSpy = spyOn(router, 'navigate');
      authService.login.and.returnValue(of({}));
      component.onSubmit();
      expect(navigateSpy).toHaveBeenCalledWith(['/dashboard/main']);
    });

    it('should not navigate when no token present', () => {
      const navigateSpy = spyOn(router, 'navigate');
      Object.defineProperty(authService, 'currentUserValue', {
        get: () => ({ token: null }),
      });
      authService.login.and.returnValue(of({}));
      component.onSubmit();
      expect(navigateSpy).not.toHaveBeenCalled();
    });

    it('should handle login error', () => {
      const errorMessage = 'Invalid credentials';
      authService.login.and.returnValue(throwError(() => errorMessage));
      component.onSubmit();
      expect(component.error).toBe(errorMessage);
      expect(component.submitted).toBeFalse();
    });

    it('should clear error before submitting', () => {
      component.error = 'Previous error';
      authService.login.and.returnValue(of({}));
      component.onSubmit();
      expect(component.error).toBe('');
    });
  });
});
