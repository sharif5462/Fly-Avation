import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';

import { AuthService } from '../../../core/auth/auth.service';

function passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;
  return password && confirmPassword && password !== confirmPassword ? { passwordMismatch: true } : null;
}
@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule, RouterLink, ButtonModule, InputTextModule, PasswordModule, MessageModule],
  templateUrl: './signup.html',
  styleUrl: '../auth-page.scss'
})
export class SignupPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);

  form = this.fb.group(
    {
      fullName: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      jobTitle: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    },
    { validators: passwordsMatchValidator }
  );

  loading = signal(false);
  errorMessage = signal('');
  submitted = signal(false);

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.errorMessage.set('');
    this.loading.set(true);

    const { fullName, username, email, jobTitle, password } = this.form.getRawValue();
    this.auth
      .signup({ fullName: fullName!, username: username!, email: email!, jobTitle: jobTitle!, password: password! })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.submitted.set(true);
        },
        error: (err) => {
          this.loading.set(false);
          this.errorMessage.set((err?.error?.message as string) ?? 'Could not submit your request. Please try again.');
        }
      });
  }
}
