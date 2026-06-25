import { HttpErrorResponse } from '@angular/common/http';
import { computed, inject, untracked } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import {
  debounceTime,
  EMPTY,
  exhaustMap,
  pipe,
  switchMap,
  tap,
} from 'rxjs';

import { PaginationMeta } from '../../../core/api/pagination.model';
import { DynamicFormValue } from '../../../shared/form/dynamic-form-builder';

import { AdminUser } from '../../users/data-access/users.models';
import { UsersHttp } from '../../users/data-access/users.http';

import { DriversHttp } from './drivers.http';
import {
  BackgroundCheckStatus,
  DriverProfile,
  DriversQuery,
  DriverStatus,
  SelectOption,
  UpdateDriverProfilePayload,
} from './drivers.models';

import {
  mapDriverProfileStepToPayload,
  mapDriverUserFormToCreatePayload,
  mapDriverUserFormToUpdatePayload,
} from '../config/driver-onboarding.mapper';

interface UpdateDriverCommand {
  id: string;
  payload: UpdateDriverProfilePayload;
}

interface DriversState {
  query: DriversQuery;
  items: readonly DriverProfile[];
  pagination: PaginationMeta;

  selected: DriverProfile | null;

  loading: boolean;
  error: string | null;

  detailLoading: boolean;
  detailError: string | null;

  updateSaving: boolean;
  updateError: string | null;
  updatedDriverProfile: DriverProfile | null;

  deletingDriverId: string | null;
  deleteError: string | null;

  currentStepIndex: number;

  userDraft: DynamicFormValue | null;
  createdUser: AdminUser | null;

  driverProfileDraft: DynamicFormValue | null;
  vehicleDraft: DynamicFormValue | null;

  vehicleTypeOptions: readonly SelectOption[];
  catalogsLoading: boolean;
  catalogsError: string | null;

  savingUser: boolean;
  savingOnboarding: boolean;
  onboardingError: string | null;
  createdDriverProfile: DriverProfile | null;
}

const EMPTY_PAGINATION_META: PaginationMeta = {
  total: 0,
  page: 1,
  limit: 10,
  pageCount: 0,
  hasNext: false,
  hasPrev: false,
  nextPage: null,
  prevPage: null,
};

const initialState: DriversState = {
  query: {
    page: 1,
    limit: 10,
  },
  items: [],
  pagination: EMPTY_PAGINATION_META,

  selected: null,

  loading: false,
  error: null,

  detailLoading: false,
  detailError: null,

  updateSaving: false,
  updateError: null,
  updatedDriverProfile: null,

  deletingDriverId: null,
  deleteError: null,

  currentStepIndex: 0,

  userDraft: null,
  createdUser: null,

  driverProfileDraft: null,
  vehicleDraft: null,

  vehicleTypeOptions: [],
  catalogsLoading: false,
  catalogsError: null,

  savingUser: false,
  savingOnboarding: false,
  onboardingError: null,
  createdDriverProfile: null,
};

export const DriversStore = signalStore(
  withState(initialState),

  withComputed((store) => ({
    hasItems: computed(() => store.items().length > 0),

    isEmpty: computed(
      () => !store.loading() && store.items().length === 0,
    ),

    canGoToDriverProfile: computed(() => !!store.createdUser()),

    canGoToVehicle: computed(
      () => !!store.createdUser() && !!store.driverProfileDraft(),
    ),

    canFinishOnboarding: computed(
      () =>
        !!store.createdUser() &&
        !!store.driverProfileDraft() &&
        !!store.vehicleDraft(),
    ),
  })),

  withMethods(
    (
      store,
      driversHttp = inject(DriversHttp),
      usersHttp = inject(UsersHttp),
    ) => {
      const patchQuery = (
        patch: Partial<DriversQuery>,
      ): DriversQuery => {
        const query: DriversQuery = {
          ...store.query(),
          ...patch,
        };

        patchState(store, { query });

        return query;
      };

      const loadDrivers = rxMethod<DriversQuery>(
        pipe(
          tap(() => {
            patchState(store, {
              loading: true,
              error: null,
            });
          }),
          switchMap((query) =>
            driversHttp.getDrivers(query).pipe(
              tapResponse({
                next: (response) => {
                  patchState(store, {
                    items: response.items,
                    pagination: response.meta,
                  });
                },
                error: (error: unknown) => {
                  patchState(store, {
                    error: getErrorMessage(error),
                  });
                },
                finalize: () => {
                  patchState(store, {
                    loading: false,
                  });
                },
              }),
            ),
          ),
        ),
      );

      const loadDriverDetail = rxMethod<string>(
        pipe(
          tap(() => {
            patchState(store, {
              detailLoading: true,
              detailError: null,
              selected: null,
            });
          }),
          switchMap((id) =>
            driversHttp.getDriverById(id).pipe(
              tapResponse({
                next: (driverProfile) => {
                  patchState(store, {
                    selected: driverProfile,
                  });
                },
                error: (error: unknown) => {
                  patchState(store, {
                    detailError: getErrorMessage(error),
                  });
                },
                finalize: () => {
                  patchState(store, {
                    detailLoading: false,
                  });
                },
              }),
            ),
          ),
        ),
      );

      const updateDriver = rxMethod<UpdateDriverCommand>(
        pipe(
          tap(() => {
            patchState(store, {
              updateSaving: true,
              updateError: null,
              updatedDriverProfile: null,
            });
          }),
          exhaustMap(({ id, payload }) =>
            driversHttp.updateDriverProfile(id, payload).pipe(
              tapResponse({
                next: (updatedProfile) => {
                  patchState(store, {
                    selected: updatedProfile,
                    updatedDriverProfile: updatedProfile,
                    items: store.items().map((item) =>
                      item.id === updatedProfile.id
                        ? updatedProfile
                        : item,
                    ),
                  });
                },
                error: (error: unknown) => {
                  patchState(store, {
                    updateError: getErrorMessage(error),
                  });
                },
                finalize: () => {
                  patchState(store, {
                    updateSaving: false,
                  });
                },
              }),
            ),
          ),
        ),
      );

      const deleteDriver = rxMethod<string>(
        pipe(
          tap((id) => {
            patchState(store, {
              deletingDriverId: id,
              deleteError: null,
            });
          }),
          exhaustMap((id) =>
            driversHttp.deleteDriverProfile(id).pipe(
              tapResponse({
                next: () => {
                  patchState(store, {
                    items: store.items().filter(
                      (item) => item.id !== id,
                    ),
                    selected:
                      store.selected()?.id === id
                        ? null
                        : store.selected(),
                  });
                },
                error: (error: unknown) => {
                  patchState(store, {
                    deleteError: getErrorMessage(error),
                  });
                },
                finalize: () => {
                  patchState(store, {
                    deletingDriverId: null,
                  });
                },
              }),
            ),
          ),
        ),
      );

      const searchDrivers = rxMethod<string>(
        pipe(
          debounceTime(300),
          tap((term) => {
            const query = patchQuery({
              page: 1,
              search: term.trim() || undefined,
            });

            loadDrivers(query);
          }),
        ),
      );

      const loadVehicleTypeOptions = rxMethod<void>(
        pipe(
          tap(() => {
            patchState(store, {
              catalogsLoading: true,
              catalogsError: null,
            });
          }),
          exhaustMap(() =>
            driversHttp.getVehicleTypeOptions().pipe(
              tapResponse({
                next: (items) => {
                  patchState(store, {
                    vehicleTypeOptions: items.map((item) => ({
                      label: item.name,
                      value: item.id,
                    })),
                  });
                },
                error: (error: unknown) => {
                  patchState(store, {
                    catalogsError: getErrorMessage(error),
                  });
                },
                finalize: () => {
                  patchState(store, {
                    catalogsLoading: false,
                  });
                },
              }),
            ),
          ),
        ),
      );

      const submitUserStep = rxMethod<DynamicFormValue>(
        pipe(
          tap(() => {
            patchState(store, {
              savingUser: true,
              onboardingError: null,
            });
          }),
          exhaustMap((value) => {
  const createdUser = store.createdUser();

  if (createdUser) {
    const payload = mapDriverUserFormToUpdatePayload(value);

    console.groupCollapsed('[Driver Onboarding] STEP 1 UPDATE USER');
    console.log('form value:', value);
    console.log('payload:', payload);
    console.groupEnd();

    return usersHttp.updateUser(createdUser.id, payload).pipe(
      tapResponse({
        next: (user) => {
          console.log('[Driver Onboarding] updated user response:', user);

          patchState(store, {
            userDraft: value,
            createdUser: user,
            currentStepIndex: 1,
          });
        },
        error: (error: unknown) => {
          debugHttpError('[Driver Onboarding] STEP 1 UPDATE USER ERROR', error);

          patchState(store, {
            onboardingError: getErrorMessage(error),
          });
        },
        finalize: () => {
          patchState(store, {
            savingUser: false,
          });
        },
      }),
    );
  }

  const payload = mapDriverUserFormToCreatePayload(value);

  console.groupCollapsed('[Driver Onboarding] STEP 1 CREATE USER');
  console.log('form value:', value);
  console.log('payload:', {
    ...payload,
    credentials: {
      ...payload.credentials,
      password: payload.credentials.password ? '***' : '',
    },
  });
  console.groupEnd();

  return usersHttp.createUser(payload).pipe(
    tapResponse({
      next: (user) => {
        console.log('[Driver Onboarding] created user response:', user);

        patchState(store, {
          userDraft: value,
          createdUser: user,
          currentStepIndex: 1,
        });
      },
      error: (error: unknown) => {
        debugHttpError('[Driver Onboarding] STEP 1 CREATE USER ERROR', error);

        patchState(store, {
          onboardingError: getErrorMessage(error),
        });
      },
      finalize: () => {
        patchState(store, {
          savingUser: false,
        });
      },
    }),
  );
}),
        ),
      );

      const finishOnboarding = rxMethod<void>(
        pipe(
          tap(() => {
            patchState(store, {
              savingOnboarding: true,
              onboardingError: null,
              createdDriverProfile: null,
            });
          }),
          exhaustMap(() => {
            const user = store.createdUser();
            const profileDraft = store.driverProfileDraft();
            const vehicleDraft = store.vehicleDraft();

            if (!user || !profileDraft || !vehicleDraft) {
              patchState(store, {
                onboardingError:
                  'Completa todos los pasos antes de confirmar el onboarding.',
                savingOnboarding: false,
              });

              return EMPTY;
            }

            const payload = mapDriverProfileStepToPayload(
  user.id,
  profileDraft,
  vehicleDraft,
);

console.groupCollapsed('[Driver Onboarding] FINAL CREATE DRIVER PROFILE');
console.log('created user:', user);
console.log('profile draft:', profileDraft);
console.log('vehicle draft:', vehicleDraft);
console.log('payload:', payload);
console.groupEnd();

return driversHttp.createDriverProfile(payload).pipe(
  tapResponse({
    next: (createdProfile) => {
      console.log(
        '[Driver Onboarding] created driver profile response:',
        createdProfile,
      );

      patchState(store, {
        createdDriverProfile: createdProfile,
        selected: createdProfile,
        items: [
          createdProfile,
          ...store.items(),
        ],
      });
    },
    error: (error: unknown) => {
      debugHttpError(
        '[Driver Onboarding] FINAL CREATE DRIVER PROFILE ERROR',
        error,
      );

      patchState(store, {
        onboardingError: getErrorMessage(error),
      });
    },
    finalize: () => {
      patchState(store, {
        savingOnboarding: false,
      });
    },
  }),
);

            return driversHttp.createDriverProfile(payload).pipe(
              tapResponse({
                next: (createdProfile) => {
                  patchState(store, {
                    createdDriverProfile: createdProfile,
                    selected: createdProfile,
                    items: [
                      createdProfile,
                      ...store.items(),
                    ],
                  });
                },
                error: (error: unknown) => {
                  patchState(store, {
                    onboardingError: getErrorMessage(error),
                  });
                },
                finalize: () => {
                  patchState(store, {
                    savingOnboarding: false,
                  });
                },
              }),
            );
          }),
        ),
      );

      return {
        loadDrivers,
        loadDriverDetail,
        updateDriver,
        deleteDriver,
        searchDrivers,
        loadVehicleTypeOptions,
        submitUserStep,
        finishOnboarding,

        enterDriversList(): void {
          const query = untracked(() => store.query());
          loadDrivers(query);
        },

        reloadDrivers(): void {
          const query = untracked(() => store.query());
          loadDrivers(query);
        },

        setPage(page: number, limit: number): void {
          const query = patchQuery({
            page,
            limit,
          });

          loadDrivers(query);
        },

        setBackgroundCheckStatusFilter(
          backgroundCheckStatus: BackgroundCheckStatus | null,
        ): void {
          const query = patchQuery({
            page: 1,
            backgroundCheckStatus,
          });

          loadDrivers(query);
        },

        setDriverStatusFilter(
          driverStatus: DriverStatus | null,
        ): void {
          const query = patchQuery({
            page: 1,
            driverStatus,
          });

          loadDrivers(query);
        },

        setApprovedFilter(isApproved: boolean | null): void {
          const query = patchQuery({
            page: 1,
            isApproved,
          });

          loadDrivers(query);
        },

        clearSelected(): void {
          patchState(store, {
            selected: null,
            detailError: null,
          });
        },

        clearUpdateState(): void {
          patchState(store, {
            updateError: null,
            updatedDriverProfile: null,
          });
        },

        submitDriverProfileStep(value: DynamicFormValue): void {
          patchState(store, {
            driverProfileDraft: value,
            onboardingError: null,
            currentStepIndex: 2,
          });
        },

        submitVehicleStep(value: DynamicFormValue): void {
          patchState(store, {
            vehicleDraft: value,
            onboardingError: null,
            currentStepIndex: 3,
          });
        },

        loadOnboardingCatalogs(): void {
          loadVehicleTypeOptions();
        },

        goToStep(index: number): void {
          const maxAllowed = store.canFinishOnboarding()
            ? 3
            : store.canGoToVehicle()
              ? 2
              : store.canGoToDriverProfile()
                ? 1
                : 0;

          patchState(store, {
            currentStepIndex: Math.min(
              Math.max(index, 0),
              maxAllowed,
            ),
          });
        },

        goPreviousStep(): void {
          patchState(store, {
            currentStepIndex: Math.max(
              0,
              store.currentStepIndex() - 1,
            ),
          });
        },

        resetOnboarding(): void {
          patchState(store, {
            currentStepIndex: 0,
            userDraft: null,
            createdUser: null,
            driverProfileDraft: null,
            vehicleDraft: null,
            savingUser: false,
            savingOnboarding: false,
            onboardingError: null,
            createdDriverProfile: null,
          });
        },
      };
    },
  ),
);

function getErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    const backendMessage = error.error?.message;

    if (typeof backendMessage === 'string') {
      return backendMessage;
    }

    if (Array.isArray(backendMessage)) {
      return backendMessage.join(' ');
    }

    return error.message || 'Ha ocurrido un error de red.';
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message;
  }

  return 'Ha ocurrido un error inesperado.';
}

function debugHttpError(scope: string, error: unknown): void {
  console.groupCollapsed(scope);
  console.error(error);

  if (error instanceof HttpErrorResponse) {
    console.log('status:', error.status);
    console.log('url:', error.url);
    console.log('backend error:', error.error);
    console.log('backend message:', error.error?.message);
  }

  console.groupEnd();
}
