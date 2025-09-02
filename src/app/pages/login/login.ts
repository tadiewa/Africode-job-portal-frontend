import { Component, ViewEncapsulation, NgZone, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { jwtDecode } from 'jwt-decode';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ]
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private authService: AuthService,
    private zone: NgZone,
    private cdr: ChangeDetectorRef
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

onSubmit() {
  this.errorMessage = '';

  if (this.loginForm.invalid) {
    if (this.loginForm.controls['email'].invalid) {
      this.errorMessage = 'Please enter a valid email.';
    } else if (this.loginForm.controls['password'].invalid) {
      this.errorMessage = 'Please enter your password.';
    }
    return;
  }

  this.loading = true;

  this.apiService.post<{ token: string }>('api/auth/login', this.loginForm.value)
    .subscribe({
      next: (response) => {
        const token = response.token;
        if (!token) {
          this.errorMessage = 'Login failed: No token received.';
          this.loading = false;
          this.cdr.detectChanges();
          return;
        }

        localStorage.setItem('authToken', token);

        try {
          const decoded = jwtDecode<{ role: string }>(token);
          const role = decoded.role?.toLowerCase() ?? '';
          this.authService.login(role);

          this.loading = false;
          this.cdr.detectChanges();

          if (role === 'admin') this.router.navigate(['admin/super-dashboard']);
          else if (role === 'developer') this.router.navigate(['/dashboard']);
          else this.router.navigate(['/']);
        } catch (e) {
          console.error('Failed to decode token', e);
          this.errorMessage = 'Login failed: Invalid token.';
          this.loading = false;
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('Login failed', error);
        this.errorMessage = error.error?.message ?? error.message ?? 'Login failed: Unknown error.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
}

}
