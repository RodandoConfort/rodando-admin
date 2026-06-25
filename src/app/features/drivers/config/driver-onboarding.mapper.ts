import { DynamicFormValue } from '../../../shared/form/dynamic-form-builder';

import {
  BackgroundCheckStatus,
  CreateDriverProfilePayload,
  CreateVehicleOnboardingPayload,
  DriverStatus,
  EmergencyContactPayload,
  VehicleStatus,
} from '../data-access/drivers.models';

import {
  CreateAdminUserPayload,
  UpdateAdminUserPayload,
} from '../../users/data-access/users.models';

function asString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : undefined;
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function asBoolean(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') {
    return value;
  }

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  return undefined;
}

function asIsoDateString(value: unknown): string | undefined {
  if (!value) {
    return undefined;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value.toISOString();
  }

  const raw = asString(value);

  if (!raw) {
    return undefined;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return new Date(`${raw}T00:00:00.000Z`).toISOString();
  }

  const parsed = new Date(raw);

  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  return parsed.toISOString();
}

function asUrlString(value: unknown): string | undefined {
  const raw = asString(value);

  if (!raw) {
    return undefined;
  }

  if (
    raw.startsWith('data:') ||
    raw.startsWith('blob:') ||
    raw.startsWith('file:')
  ) {
    return undefined;
  }

  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    return raw;
  }

  return undefined;
}

function normalizeCubanPhone(value: unknown): string | undefined {
  const raw = asString(value);

  if (!raw) {
    return undefined;
  }

  if (raw.startsWith('+')) {
    return raw;
  }

  const digits = raw.replace(/\D/g, '');

  return digits ? `+53${digits}` : undefined;
}

function cleanPayload<T extends Record<string, unknown>>(payload: T): T {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined),
  ) as T;
}

export function mapDriverUserFormToCreatePayload(
  value: DynamicFormValue,
): CreateAdminUserPayload {
  return {
    user: cleanPayload({
      name: asString(value['name']) ?? '',
      phoneNumber: normalizeCubanPhone(value['phoneNumber']),
      userType: 'driver',
      status: 'active',
      profilePictureUrl: asUrlString(value['profilePictureUrl']),
      preferredLanguage: asString(value['preferredLanguage']),
    }) as CreateAdminUserPayload['user'],

    credentials: {
      authenticationMethod: 'local',
      password: asString(value['password']) ?? '',
    },
  };
}

export function mapDriverUserFormToUpdatePayload(
  value: DynamicFormValue,
): UpdateAdminUserPayload {
  return cleanPayload({
    name: asString(value['name']),
    phoneNumber: normalizeCubanPhone(value['phoneNumber']),
    userType: 'driver',
    status: 'active',
    profilePictureUrl: asUrlString(value['profilePictureUrl']),
    preferredLanguage: asString(value['preferredLanguage']),
  }) as UpdateAdminUserPayload;
}

function mapEmergencyContact(
  value: DynamicFormValue,
): EmergencyContactPayload | undefined {
  const nested = value['emergencyContactInfo'] as
    | Partial<EmergencyContactPayload>
    | undefined;

  const name =
    asString(value['emergencyContactName']) ??
    asString(nested?.name);

  const phoneNumber =
    normalizeCubanPhone(value['emergencyContactPhoneNumber']) ??
    normalizeCubanPhone(nested?.phoneNumber);

  const relationship =
    asString(value['emergencyContactRelationship']) ??
    asString(nested?.relationship);

  if (!name && !phoneNumber && !relationship) {
    return undefined;
  }

  if (!name || !phoneNumber || !relationship) {
    return undefined;
  }

  return {
    name,
    phoneNumber,
    relationship,
  };
}

export function mapVehicleStepToPayload(
  value: DynamicFormValue,
): CreateVehicleOnboardingPayload {
  return cleanPayload({
    vehicleTypeId: asString(value['vehicleTypeId']) ?? '',
    make: asString(value['make']) ?? '',
    model: asString(value['model']) ?? '',
    year: asNumber(value['year']) ?? new Date().getFullYear(),
    plateNumber: asString(value['plateNumber']) ?? '',
    color: asString(value['color']),
    capacity: asNumber(value['capacity']),
    isActive: asBoolean(value['isActive']) ?? true,
    status:
      (asString(value['status']) as VehicleStatus | undefined) ??
      'pending_review',
    inspectionDate: asIsoDateString(value['inspectionDate']),
    lastMaintenanceDate: asIsoDateString(value['lastMaintenanceDate']),
    mileage: asNumber(value['mileage']),
  }) as CreateVehicleOnboardingPayload;
}

export function mapDriverProfileStepToPayload(
  userId: string,
  profileValue: DynamicFormValue,
  vehicleValue: DynamicFormValue,
): CreateDriverProfilePayload {
  const driverLicenseExpirationDate = asIsoDateString(
    profileValue['driverLicenseExpirationDate'],
  );

  console.groupCollapsed('[Driver Onboarding Mapper] date debug');
  console.log('profileValue:', profileValue);
  console.log(
    'raw driverLicenseExpirationDate:',
    profileValue['driverLicenseExpirationDate'],
  );
  console.log(
    'mapped driverLicenseExpirationDate:',
    driverLicenseExpirationDate,
  );
  console.groupEnd();

  return cleanPayload({
    userId,

    driverLicenseNumber:
      asString(profileValue['driverLicenseNumber']) ?? '',

    driverLicenseExpirationDate:
      driverLicenseExpirationDate ?? '',

    driverLicensePictureUrl:
      asUrlString(profileValue['driverLicensePictureUrl']),

    backgroundCheckStatus:
      asString(profileValue['backgroundCheckStatus']) as
        | BackgroundCheckStatus
        | undefined,

    backgroundCheckDate:
      asIsoDateString(profileValue['backgroundCheckDate']),

    isApproved: asBoolean(profileValue['isApproved']),

    emergencyContactInfo: mapEmergencyContact(profileValue),

    driverStatus:
      asString(profileValue['driverStatus']) as DriverStatus | undefined,

    paidPriorityUntil:
      asIsoDateString(profileValue['paidPriorityUntil']),

    initialVehicle: mapVehicleStepToPayload(vehicleValue),
  }) as CreateDriverProfilePayload;
}
