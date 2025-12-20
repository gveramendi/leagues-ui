import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { User, AuthResponse } from '../models/user';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl: string = `${environment.apiUrl}/api/auth`;

  private currentUserSubject: BehaviorSubject<User>;

  public currentUser: Observable<User>;

  constructor(private httpClient: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<User>(
      JSON.parse(localStorage.getItem('currentUser') || '{}')
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  register(firstName: string, lastName: string, email: string, password: string, confirmPassword: string): Observable<any> {
    return this.httpClient.post<any>(`${this.apiUrl}/register`, {
      firstName,
      lastName,
      email,
      password,
      confirmPassword
    }).pipe(
      map((response) => {
        return {
          success: true,
          message: response.message || 'Registration successful',
          data: response.data
        };
      }),
      catchError((error) => {
        console.error('Registration error:', error);
        const errorMessage = error.error?.message || 'Registration failed. Please try again.';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  login(email: string, password: string): Observable<any> {
    return this.httpClient.post<AuthResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      map((response) => {
        const data = response.data;
        const user: User = {
          id: 0, // Backend doesn't return id in login response, will need to fetch if needed
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          token: data.token,
          tokenType: data.tokenType,
          expiresIn: data.expiresIn,
          roles: data.roles, // Array of role names (strings)
          issuedAt: data.issuedAt,
          expiresAt: data.expiresAt,
        };

        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);

        return this.ok({
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          token: user.token,
        });
      }),
      catchError((error) => {
        console.error('Login error:', error);
        const errorMessage = error.error?.message || 'Username or password is incorrect';
        return this.error(errorMessage);
      })
    );
  }

  ok(body?: { email: string; firstName: string; lastName: string; token: string }) {
    return of(new HttpResponse({ status: 200, body }));
  }

  error(message: string) {
    return throwError(() => new Error(message));
  }

  resetCurrentUser() {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next({} as User);
  }

  logout() {
    // Optionally call backend logout endpoint
    // this.httpClient.post(`${this.apiUrl}/logout`, {}).subscribe();
    this.resetCurrentUser();

    return of({ success: true });
  }
}
