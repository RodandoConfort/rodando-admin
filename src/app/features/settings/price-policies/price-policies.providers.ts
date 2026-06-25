import { Provider } from '@angular/core';

import { PricePoliciesHttp } from './data-access/price-policies.http';
import { PricePoliciesStore } from './data-access/price-policies.store';

export const PRICE_POLICIES_PROVIDERS: Provider[] = [
  PricePoliciesHttp,
  PricePoliciesStore,
];
