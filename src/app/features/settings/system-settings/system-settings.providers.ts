import { Provider } from '@angular/core';

import { SystemSettingsHttp } from './data-access/system-settings.http';
import { SystemSettingsStore } from './data-access/system-settings.store';

export const SYSTEM_SETTINGS_PROVIDERS: Provider[] = [
  SystemSettingsHttp,
  SystemSettingsStore,
];
