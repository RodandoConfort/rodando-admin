import { Provider } from '@angular/core';

import { UsersStore } from './data-access/users.store';

export const USERS_PROVIDERS: Provider[] = [
  UsersStore,
];
