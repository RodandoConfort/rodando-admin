import { inject, Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

export type AlertType = 'success' | 'error' | 'info' | 'warning';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private readonly snackBar = inject(MatSnackBar);

  success(message: string, action = 'Cerrar'): void {
    this.open(message, action, 'success');
  }

  error(message: string, action = 'Cerrar'): void {
    this.open(message, action, 'error', {
      duration: 7000,
    });
  }

  info(message: string, action = 'Cerrar'): void {
    this.open(message, action, 'info');
  }

  warning(message: string, action = 'Cerrar'): void {
    this.open(message, action, 'warning', {
      duration: 6000,
    });
  }

  private open(
    message: string,
    action: string,
    type: AlertType,
    config?: MatSnackBarConfig,
  ): void {
    this.snackBar.open(message, action, {
      duration: 4000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [`app-snackbar`, `app-snackbar--${type}`],
      ...config,
    });
  }
}
