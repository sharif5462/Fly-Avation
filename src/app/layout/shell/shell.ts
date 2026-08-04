import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';

import { Breadcrumb } from '../breadcrumb/breadcrumb';
import { Sidebar } from '../sidebar/sidebar';
import { Topbar } from '../topbar/topbar';

/** Authenticated app shell: sidebar + topbar + breadcrumb around the routed page. */
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, ToastModule, ConfirmDialogModule, Sidebar, Topbar, Breadcrumb],
  templateUrl: './shell.html',
  styleUrl: './shell.scss'
})
export class Shell {
  sidebarOpen = signal(false);

  toggleSidebar(): void {
    this.sidebarOpen.update((open) => !open);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }
}
