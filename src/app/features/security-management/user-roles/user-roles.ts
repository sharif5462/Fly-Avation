import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

import { AuthService } from '../../../core/auth/auth.service';
import { ALL_ROLES, ROLE_LABELS, Role } from '../../../core/models/role.model';
import { User, UserStatus } from '../../../core/models/user.model';
import { ApiService } from '../../../core/services/api.service';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { StatCard } from '../../../shared/components/stat-card/stat-card';

const RESOURCE = 'users';
type StatusFilter = 'All' | UserStatus;
const STATUS_TAG_SEVERITY: Record<UserStatus, 'warn' | 'success' | 'danger'> = {
  Pending: 'warn',
  Active: 'success',
  Rejected: 'danger'
};
const AVATAR_COLORS = ['#134bd1', '#7c3aed', '#0891b2', '#c2410c', '#be185d', '#15803d', '#a16207', '#4338ca', '#334155'];

function initialsOf(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('');
}

@Component({
  selector: 'app-user-roles',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    TableModule,
    DialogModule,
    InputTextModule,
    MultiSelectModule,
    SelectButtonModule,
    TagModule,
    AvatarModule,
    IconFieldModule,
    InputIconModule,
    PageHeader,
    StatCard
  ],
  templateUrl: './user-roles.html',
  styles: [`
    .user-cell {
      display: flex;
      align-items: center;
      gap: 0.625rem;
    }
    .role-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem;
      max-width: 22rem;
    }
    .status-filter {
      margin-bottom: 1rem;
    }
    .stat-card-link {
      background: none;
      border: none;
      padding: 0;
      margin: 0;
      text-align: left;
      cursor: pointer;
      display: block;
      flex: 1 1 10rem;
      min-width: 10rem;
    }
  `]
})
export class UserRolesPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  private readonly confirmation = inject(ConfirmationService);
  private readonly messages = inject(MessageService);
  private readonly auth = inject(AuthService);

  readonly roleOptions = ALL_ROLES.map((r) => ({ label: ROLE_LABELS[r], value: r }));
  readonly statusFilterOptions: { label: string; value: StatusFilter }[] = [
    { label: 'All', value: 'All' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Active', value: 'Active' },
    { label: 'Rejected', value: 'Rejected' }
  ];

  users = signal<User[]>([]);
  loading = signal(true);
  dialogVisible = signal(false);
  editingUser = signal<User | null>(null);
  saving = signal(false);
  statusFilter = signal<StatusFilter>('All');

  /** Only an Admin/SuperAdmin can approve or reject a pending sign-up. */
  canApprove = computed(() => this.auth.hasRole('Admin'));

  filteredUsers = computed(() => {
    const filter = this.statusFilter();
    const rows = this.users();
    return filter === 'All' ? rows : rows.filter((u) => u.status === filter);
  });

  stats = computed(() => {
    const rows = this.users();
    return {
      total: rows.length,
      admins: rows.filter((u) => u.roles.includes('SuperAdmin') || u.roles.includes('Admin')).length,
      pending: rows.filter((u) => u.status === 'Pending').length,
      distinctRoles: new Set(rows.flatMap((u) => u.roles)).size
    };
  });

  dialogHeader = computed(() => {
    const editing = this.editingUser();
    if (!editing) return 'Add User';
    return editing.status === 'Pending' ? 'Approve & Assign Roles' : 'Edit User';
  });

  saveButtonLabel = computed(() => {
    const editing = this.editingUser();
    if (!editing) return 'Add User';
    return editing.status === 'Pending' ? 'Approve' : 'Save Changes';
  });

  form = this.fb.group({
    fullName: ['', Validators.required],
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    jobTitle: ['', Validators.required],
    roles: this.fb.control<Role[]>([], Validators.required)
  });

  ngOnInit(): void {
    this.load();
  }

  roleLabel(role: Role): string {
    return ROLE_LABELS[role];
  }

  statusSeverity(status: UserStatus): 'warn' | 'success' | 'danger' {
    return STATUS_TAG_SEVERITY[status];
  }

  openNew(): void {
    this.editingUser.set(null);
    this.form.reset({ fullName: '', username: '', email: '', jobTitle: '', roles: [] });
    this.dialogVisible.set(true);
  }

  openEdit(user: User): void {
    this.editingUser.set(user);
    this.form.setValue({
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      jobTitle: user.jobTitle,
      roles: user.roles
    });
    this.dialogVisible.set(true);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const editing = this.editingUser();
    const payload: Partial<User> = {
      fullName: value.fullName!,
      username: value.username!,
      email: value.email!,
      jobTitle: value.jobTitle!,
      roles: value.roles!,
      initials: initialsOf(value.fullName!),
      avatarColor: editing?.avatarColor ?? AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
      status: editing ? (editing.status === 'Pending' ? 'Active' : editing.status) : 'Active'
    };
    this.saving.set(true);
    const request$ = editing ? this.api.update<User>(RESOURCE, editing.id, payload) : this.api.create<User>(RESOURCE, payload);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogVisible.set(false);
        this.messages.add({ severity: 'success', summary: editing ? 'User updated' : 'User created', detail: payload.fullName });
        this.load();
      },
      error: () => {
        this.saving.set(false);
        this.messages.add({ severity: 'error', summary: 'Save failed', detail: 'Please try again.' });
      }
    });
  }

  confirmDelete(user: User): void {
    this.confirmation.confirm({
      header: 'Remove User',
      message: `Remove ${user.fullName}'s access to the ERP? They will no longer be able to sign in.`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Remove', severity: 'danger' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.api.remove(RESOURCE, user.id).subscribe({
          next: () => {
            this.messages.add({ severity: 'success', summary: 'Removed', detail: `${user.fullName} removed.` });
            this.load();
          },
          error: () => this.messages.add({ severity: 'error', summary: 'Delete failed', detail: 'Please try again.' })
        });
      }
    });
  }

  reject(user: User): void {
    this.confirmation.confirm({
      header: 'Reject Sign-Up',
      message: `Reject ${user.fullName}'s sign-up request? They will not be able to sign in.`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Reject', severity: 'danger' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.api.update<User>(RESOURCE, user.id, { status: 'Rejected' }).subscribe({
          next: () => {
            this.messages.add({ severity: 'success', summary: 'Rejected', detail: `${user.fullName}'s request was rejected.` });
            this.load();
          },
          error: () => this.messages.add({ severity: 'error', summary: 'Reject failed', detail: 'Please try again.' })
        });
      }
    });
  }

  private load(): void {
    this.loading.set(true);
    this.api.list<User>(RESOURCE).subscribe({
      next: (res) => {
        this.users.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messages.add({ severity: 'error', summary: 'Load failed', detail: 'Could not load users.' });
      }
    });
  }
}
