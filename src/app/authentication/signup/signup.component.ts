import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FeatherModule } from 'angular-feather';
import { AuthService } from '@core/service/auth.service';

@Component({
    selector: 'app-signup',
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.sass'],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        FeatherModule,
        RouterLink,
    ]
})
export class SignupComponent implements OnInit {
  registerForm!: UntypedFormGroup;
  submitted = false;
  error = '';
  loading = false;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      fname: ['', Validators.required],
      lname: ['', Validators.required],
      email: [
        '',
        [Validators.required, Validators.email, Validators.minLength(5)],
      ],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      termcondition: [false, [Validators.requiredTrue]],
    }, {
      validators: this.passwordMatchValidator
    });
  }

  // Custom validator to check if passwords match
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  get f() {
    return this.registerForm.controls;
  }

  get passwordsMatch(): boolean {
    return !this.registerForm.hasError('passwordMismatch');
  }

  onSubmit() {
    this.submitted = true;
    this.error = '';

    if (this.registerForm.invalid) {
      if (this.registerForm.hasError('passwordMismatch')) {
        this.error = 'Passwords do not match!';
      } else {
        this.error = 'Invalid data!';
      }
      return;
    }

    this.loading = true;

    const { fname, lname, email, password, confirmPassword } = this.registerForm.value;

    this.authService.register(fname, lname, email, password, confirmPassword).subscribe({
      next: (response) => {
        console.log('Registration successful:', response);
        this.loading = false;

        // Redirect to login page after successful registration
        this.router.navigate(['/authentication/sign-in'], {
          queryParams: { registered: 'true', email: email }
        });
      },
      error: (error) => {
        console.error('Registration failed:', error);
        this.error = error.message || 'Registration failed. Please try again.';
        this.loading = false;
      }
    });
  }
}
