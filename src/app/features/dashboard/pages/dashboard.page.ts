import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-dashboard-page',
  template: `
    <section class="page">
      <h2>Dashboard</h2>
      <p>Resumen general del sistema.</p>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage {}
