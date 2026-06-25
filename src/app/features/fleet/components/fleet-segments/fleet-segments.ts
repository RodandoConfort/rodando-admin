import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-fleet-segments',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    MatIconModule,
  ],
  templateUrl: './fleet-segments.html',
  styleUrl: './fleet-segments.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FleetSegments {
  readonly segments = [
    {
      label: 'Vehículos',
      icon: 'car_rental',
      route: ['/admin', 'fleet', 'vehicles'],
    },
    {
      label: 'Categorías',
      icon: 'category',
      route: ['/admin', 'fleet', 'categories'],
    },
    {
      label: 'Tipos de vehículos',
      icon: 'commute',
      route: ['/admin', 'fleet', 'vehicle-types'],
    },
    {
      label: 'Clases de servicio',
      icon: 'workspace_premium',
      route: ['/admin', 'fleet', 'service-classes'],
    },
  ] as const;
}
