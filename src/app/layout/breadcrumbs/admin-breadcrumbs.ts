import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { BreadcrumbItem } from '../admin-shell/admin-shell';


@Component({
  selector: 'app-admin-breadcrumbs',
  standalone: true,
  imports: [
    RouterLink,
    MatIconModule,
  ],
  templateUrl: './admin-breadcrumbs.html',
  styleUrl: './admin-breadcrumbs.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminBreadcrumbs {
  readonly items = input.required<BreadcrumbItem[]>();
}
