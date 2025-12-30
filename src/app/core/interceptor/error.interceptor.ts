import { AuthService } from '../service/auth.service';
import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private authenticationService: AuthService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401) {
          // auto logout if 401 response returned from api
          this.authenticationService.logout();
          location.reload();
        }

        // Extract error message from different possible structures
        let errorMessage = 'An error occurred';

        if (err.error) {
          if (typeof err.error === 'string') {
            // Error is a plain string
            errorMessage = err.error;
          } else if (err.error.message) {
            // Error is an object with message property (API error response)
            errorMessage = err.error.message;
          } else if (err.error.error) {
            // Error is an object with error property
            errorMessage = err.error.error;
          }
        } else if (err.message) {
          errorMessage = err.message;
        } else if (err.statusText) {
          errorMessage = err.statusText;
        }

        return throwError(() => errorMessage);
      })
    );
  }
}
