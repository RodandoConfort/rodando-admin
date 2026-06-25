import { Provider } from '@angular/core';

import { CashCollectionPointsHttp } from './data-access/cash-collection-points.http';
import { CashCollectionPointsStore } from './data-access/cash-collection-points.store';

export function provideCashCollectionPointsFeature(): Provider[] {
  return [
    CashCollectionPointsHttp,
    CashCollectionPointsStore,
  ];
}
