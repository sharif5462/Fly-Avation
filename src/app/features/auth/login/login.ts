import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';

import { AuthService } from '../../../core/auth/auth.service';
import { DEMO_ACCOUNTS } from '../../../core/mock';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule, PasswordModule, MessageModule, DialogModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  loading = signal(false);
  errorMessage = signal('');

  forgotDialogVisible = signal(false);
  forgotSubmitting = signal(false);
  forgotSubmitted = signal(false);
  forgotForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  /**
   * Empty in production builds, where `core/mock` is replaced by a stub. The
   * panel below then renders nothing — a public sign-in page advertising a
   * list of real usernames is free reconnaissance for an attacker.
   */
  readonly demoAccounts = DEMO_ACCOUNTS;

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.errorMessage.set('');
    this.loading.set(true);

    const { username, password } = this.form.getRawValue();
    this.auth.login({ username: username!, password: password! }).subscribe({
      next: () => {
        this.loading.set(false);
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/dashboard';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set((err?.error?.message as string) ?? 'Invalid username or password.');
      }
    });
  }

  quickFill(username: string, password: string): void {
    this.errorMessage.set('');
    this.form.setValue({ username, password });
  }

  openForgotPassword(): void {
    this.forgotSubmitted.set(false);
    this.forgotForm.reset({ email: this.form.value.username?.includes('@') ? this.form.value.username : '' });
    this.forgotDialogVisible.set(true);
  }

  submitForgotPassword(): void {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }
    this.forgotSubmitting.set(true);
    this.auth.forgotPassword(this.forgotForm.getRawValue().email!).subscribe({
      next: () => {
        this.forgotSubmitting.set(false);
        this.forgotSubmitted.set(true);
      },
      error: () => {
        // Even on a network/server error we don't want to reveal anything
        // about the account, so this still lands on the same generic
        // confirmation state rather than an error message.
        this.forgotSubmitting.set(false);
        this.forgotSubmitted.set(true);
      }
    });
  }
}
