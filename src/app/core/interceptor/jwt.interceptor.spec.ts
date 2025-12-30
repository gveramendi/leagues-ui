import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import {
  HTTP_INTERCEPTORS,
  HttpClient,
  HttpErrorResponse,
} from '@angular/common/http';
import { JwtInterceptor } from './jwt.interceptor';
import { AuthService } from '../service/auth.service';
import { User } from '../models/user';

describe('JwtInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    token: 'mock-jwt-token-12345',
    roles: ['ADMIN'],
  };

  beforeEach(() => {
    const spy = jasmine.createSpyObj('AuthService', ['logout'], {
      currentUserValue: null,
    });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: spy },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: JwtInterceptor,
          multi: true,
        },
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    const interceptor = TestBed.inject(HTTP_INTERCEPTORS).find(
      (i) => i instanceof JwtInterceptor
    );
    expect(interceptor).toBeTruthy();
  });

  describe('Authorization Header', () => {
    it('should add Authorization header when user has token', () => {
      (Object.getOwnPropertyDescriptor(authServiceSpy, 'currentUserValue')
        ?.get as jasmine.Spy).and.returnValue(mockUser);

      httpClient.get('/api/test').subscribe();

      const req = httpMock.expectOne('/api/test');
      expect(req.request.headers.has('Authorization')).toBeTrue();
      expect(req.request.headers.get('Authorization')).toBe(
        `Bearer ${mockUser.token}`
      );
      req.flush({});
    });

    it('should not add Authorization header when user is null', () => {
      (Object.getOwnPropertyDescriptor(authServiceSpy, 'currentUserValue')
        ?.get as jasmine.Spy).and.returnValue(null);

      httpClient.get('/api/test').subscribe();

      const req = httpMock.expectOne('/api/test');
      expect(req.request.headers.has('Authorization')).toBeFalse();
      req.flush({});
    });

    it('should not add Authorization header when user has no token', () => {
      const userWithoutToken: Partial<User> = {
        id: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      };
      (Object.getOwnPropertyDescriptor(authServiceSpy, 'currentUserValue')
        ?.get as jasmine.Spy).and.returnValue(userWithoutToken);

      httpClient.get('/api/test').subscribe();

      const req = httpMock.expectOne('/api/test');
      expect(req.request.headers.has('Authorization')).toBeFalse();
      req.flush({});
    });
  });

  describe('Error Handling', () => {
    it('should extract error message from response on 500 error', () => {
      (Object.getOwnPropertyDescriptor(authServiceSpy, 'currentUserValue')
        ?.get as jasmine.Spy).and.returnValue(mockUser);

      let errorMessage = '';
      httpClient.get('/api/test').subscribe({
        error: (error) => {
          errorMessage = error;
        },
      });

      const req = httpMock.expectOne('/api/test');
      req.flush(
        { message: 'Custom error message' },
        { status: 500, statusText: 'Internal Server Error' }
      );

      expect(errorMessage).toBe('Custom error message');
    });

    it('should use statusText when no error message in response', () => {
      (Object.getOwnPropertyDescriptor(authServiceSpy, 'currentUserValue')
        ?.get as jasmine.Spy).and.returnValue(mockUser);

      let errorMessage = '';
      httpClient.get('/api/test').subscribe({
        error: (error) => {
          errorMessage = error;
        },
      });

      const req = httpMock.expectOne('/api/test');
      req.flush(null, { status: 500, statusText: 'Internal Server Error' });

      expect(errorMessage).toBe('Internal Server Error');
    });

    it('should propagate error on 404', () => {
      (Object.getOwnPropertyDescriptor(authServiceSpy, 'currentUserValue')
        ?.get as jasmine.Spy).and.returnValue(mockUser);

      let errorMessage = '';
      httpClient.get('/api/test').subscribe({
        error: (error) => {
          errorMessage = error;
        },
      });

      const req = httpMock.expectOne('/api/test');
      req.flush({ message: 'Not Found' }, { status: 404, statusText: 'Not Found' });

      expect(errorMessage).toBe('Not Found');
    });
  });
});
