import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpResponse } from '@angular/common/http';

import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/api/auth`;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should load user from localStorage on init', () => {
      const storedUser = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        token: 'stored-token',
      };
      localStorage.setItem('currentUser', JSON.stringify(storedUser));

      // Recreate service to test initialization
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [AuthService],
      });
      const newService = TestBed.inject(AuthService);

      expect(newService.currentUserValue.email).toBe('test@example.com');
      expect(newService.currentUserValue.token).toBe('stored-token');
    });

    it('should have empty user when localStorage is empty', () => {
      expect(service.currentUserValue).toEqual({} as any);
    });
  });

  describe('currentUserValue', () => {
    it('should return current user value', () => {
      expect(service.currentUserValue).toBeDefined();
    });
  });

  describe('currentUser Observable', () => {
    it('should emit current user', (done) => {
      service.currentUser.subscribe((user) => {
        expect(user).toBeDefined();
        done();
      });
    });
  });

  describe('register', () => {
    it('should send registration request', () => {
      const mockResponse = {
        header: { success: true, message: 'Registration successful' },
        body: { data: { id: 1, email: 'test@example.com' } },
      };

      service.register('John', 'Doe', 'test@example.com', 'password123', 'password123').subscribe((result) => {
        expect(result.success).toBeTrue();
        expect(result.message).toBe('Registration successful');
      });

      const req = httpMock.expectOne(`${apiUrl}/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });
      req.flush(mockResponse);
    });

    it('should handle registration success without header', () => {
      const mockResponse = {
        body: { data: { id: 1 } },
      };

      service.register('John', 'Doe', 'test@example.com', 'password123', 'password123').subscribe((result) => {
        expect(result.success).toBeTrue();
        expect(result.message).toBe('Registration successful');
      });

      const req = httpMock.expectOne(`${apiUrl}/register`);
      req.flush(mockResponse);
    });

    it('should handle registration error', () => {
      service.register('John', 'Doe', 'test@example.com', 'password123', 'password123').subscribe({
        error: (error) => {
          expect(error).toBeDefined();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/register`);
      req.flush('Email already exists', { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('login', () => {
    const mockLoginResponse = {
      body: {
        data: {
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          token: 'jwt-token',
          tokenType: 'Bearer',
          expiresIn: 3600,
          roles: ['ROLE_USER'],
          menus: [],
          issuedAt: '2024-01-01T00:00:00Z',
          expiresAt: '2024-01-01T01:00:00Z',
        },
      },
    };

    it('should send login request', () => {
      service.login('test@example.com', 'password123').subscribe((result) => {
        expect(result).toBeDefined();
      });

      const req = httpMock.expectOne(`${apiUrl}/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        email: 'test@example.com',
        password: 'password123',
      });
      req.flush(mockLoginResponse);
    });

    it('should store user in localStorage on successful login', () => {
      service.login('test@example.com', 'password123').subscribe();

      const req = httpMock.expectOne(`${apiUrl}/login`);
      req.flush(mockLoginResponse);

      const storedUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      expect(storedUser.email).toBe('test@example.com');
      expect(storedUser.token).toBe('jwt-token');
    });

    it('should update currentUserSubject on successful login', () => {
      service.login('test@example.com', 'password123').subscribe();

      const req = httpMock.expectOne(`${apiUrl}/login`);
      req.flush(mockLoginResponse);

      expect(service.currentUserValue.email).toBe('test@example.com');
      expect(service.currentUserValue.firstName).toBe('John');
      expect(service.currentUserValue.lastName).toBe('Doe');
    });

    it('should return success response on successful login', () => {
      service.login('test@example.com', 'password123').subscribe((result) => {
        expect(result).toBeDefined();
      });

      const req = httpMock.expectOne(`${apiUrl}/login`);
      req.flush(mockLoginResponse);
    });

    it('should handle login error', () => {
      service.login('test@example.com', 'wrongpassword').subscribe({
        error: (error) => {
          expect(error).toBeDefined();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/login`);
      req.flush('Invalid credentials', { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('logout', () => {
    beforeEach(() => {
      localStorage.setItem('currentUser', JSON.stringify({ email: 'test@example.com', token: 'token' }));
    });

    it('should clear localStorage', () => {
      service.logout().subscribe();
      expect(localStorage.getItem('currentUser')).toBeNull();
    });

    it('should reset currentUserSubject', () => {
      service.logout().subscribe();
      expect(service.currentUserValue).toEqual({} as any);
    });

    it('should return success: true', () => {
      service.logout().subscribe((result) => {
        expect(result.success).toBeTrue();
      });
    });
  });

  describe('resetCurrentUser', () => {
    beforeEach(() => {
      localStorage.setItem('currentUser', JSON.stringify({ email: 'test@example.com' }));
    });

    it('should remove user from localStorage', () => {
      service.resetCurrentUser();
      expect(localStorage.getItem('currentUser')).toBeNull();
    });

    it('should reset currentUserSubject to empty object', () => {
      service.resetCurrentUser();
      expect(service.currentUserValue).toEqual({} as any);
    });
  });

  describe('ok helper method', () => {
    it('should return HttpResponse with status 200', () => {
      const body = { email: 'test@example.com', firstName: 'John', lastName: 'Doe', token: 'token' };
      service.ok(body).subscribe((result) => {
        expect(result).toBeInstanceOf(HttpResponse);
        expect(result.status).toBe(200);
        expect(result.body).toEqual(body);
      });
    });

    it('should work without body', () => {
      service.ok().subscribe((result) => {
        expect(result.status).toBe(200);
        expect(result.body).toBeNull();
      });
    });
  });

  describe('error helper method', () => {
    it('should return throwError with message', () => {
      service.error('Test error').subscribe({
        error: (err) => {
          expect(err.message).toBe('Test error');
        },
      });
    });
  });
});
