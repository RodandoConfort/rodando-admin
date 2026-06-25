import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { ROUTE_COMMANDS } from '../../../../core/router/app-paths';

@Component({
  selector: 'app-geography-segments',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    MatIconModule,
  ],
  templateUrl: './geography-segments.html',
  styleUrl: './geography-segments.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeographySegments {
  readonly routes = ROUTE_COMMANDS.admin;
}
