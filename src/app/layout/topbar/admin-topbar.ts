import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinner } from "@angular/material/progress-spinner";

@Component({
  selector: 'app-admin-topbar',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinner
],
  templateUrl: './admin-topbar.html',
  styleUrl: './admin-topbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminTopbar {
  readonly title = input.required<string>();
  readonly isDark = input(false);
  readonly loggingOut = input(false);

  readonly toggleSidebar = output<void>();
  readonly toggleTheme = output<void>();
  readonly logoutRequested = output<void>();
  readonly profileRequested = output<void>();
}
