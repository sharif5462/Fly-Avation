import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

import { MODULES } from '../../../core/data/module-manifest';
import { ALL_ROLES, ROLE_LABELS, Role } from '../../../core/models/role.model';
import { ApiService } from '../../../core/services/api.service';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { StatCard } from '../../../shared/components/stat-card/stat-card';

interface RolePermission {
  id: string;
  role: Role;
  extraModules: string[];
}

interface RoleRow {
  role: Role;
  label: string;
  ownedModules: string[];
  extraModules: string[];
}

const RESOURCE = 'role-permissions';

/**
 * Base access per role comes straight from module-manifest.ts (each module
 * declares the one role that owns it). This page lets an admin grant a role
 * *extra* cross-module access on top of that baseline — e.g. give Finance
 * read access into Procurement — persisted per role via the generic
 * ApiService against the `role-permissions` resource.
 */
@Component({
  selector: 'app-access-control',
  imports: [FormsModule, MultiSelectModule, TableModule, TagModule, PageHeader, StatCard],
  templateUrl: './access-control.html',
  styles: [`
    .owned-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem;
      max-width: 18rem;
    }
  `]
})
export class AccessControlPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly messages = inject(MessageService);

  readonly moduleOptions = MODULES.map((m) => ({ label: m.label, value: m.key }));

  permissions = signal<RolePermission[]>([]);
  loading = signal(true);
  savingRole = signal<Role | null>(null);

  rows = computed<RoleRow[]>(() => {
    const perms = new Map(this.permissions().map((p) => [p.role, p]));
    return ALL_ROLES.filter((r) => r !== 'SuperAdmin' && r !== 'Admin').map((role) => ({
      role,
      label: ROLE_LABELS[role],
      ownedModules: MODULES.filter((m) => m.role === role).map((m) => m.label),
      extraModules: perms.get(role)?.extraModules ?? []
    }));
  });

  stats = computed(() => ({
    totalRoles: ALL_ROLES.length,
    customized: this.rows().filter((r) => r.extraModules.length > 0).length
  }));

  ngOnInit(): void {
    this.load();
  }

  onExtraModulesChange(row: RoleRow, moduleKeys: string[]): void {
    this.savingRole.set(row.role);
    this.api.update<RolePermission>(RESOURCE, row.role, { extraModules: moduleKeys }).subscribe({
      next: () => {
        this.savingRole.set(null);
        this.permissions.update((rows) => rows.map((p) => (p.role === row.role ? { ...p, extraModules: moduleKeys } : p)));
        this.messages.add({ severity: 'success', summary: 'Access updated', detail: `${ROLE_LABELS[row.role]} permissions saved.` });
      },
      error: () => {
        this.savingRole.set(null);
        this.messages.add({ severity: 'error', summary: 'Save failed', detail: 'Please try again.' });
      }
    });
  }

  private load(): void {
    this.loading.set(true);
    this.api.list<RolePermission>(RESOURCE).subscribe({
      next: (res) => {
        this.permissions.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messages.add({ severity: 'error', summary: 'Load failed', detail: 'Could not load access control data.' });
      }
    });
  }
}
