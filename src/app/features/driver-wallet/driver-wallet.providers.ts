import { Provider } from '@angular/core';

import { DriverWalletHttp } from './data-access/driver-wallet.http';
import { DriverWalletStore } from './data-access/driver-wallet.store';

export const DRIVER_WALLET_PROVIDERS: Provider[] = [
  DriverWalletHttp,
  DriverWalletStore,
];
