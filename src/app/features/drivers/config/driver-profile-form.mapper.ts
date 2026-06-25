import { DynamicFormValue } from '../../../shared/form/dynamic-form-builder';

import {
  BackgroundCheckStatus,
  DriverProfile,
  DriverStatus,
  EmergencyContactPayload,
  UpdateDriverProfilePayload,
} from '../data-access/drivers.models';

function asString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : undefined;
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

function asDateString(value: unknown): string | undefined {
  return asString(value);
}

function toDateInputValue(value?: string | null): string {
  if (!value) {
    return '';
  }

  return value.slice(0, 10);
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

function mapEmergencyContact(
  value: DynamicFormValue,
): EmergencyContactPayload | undefined {
  const name = asString(value['emergencyContactName']);
  const phoneNumber = normalizeCubanPhone(
    value['emergencyContactPhoneNumber'],
  );
  const relationship = asString(value['emergencyContactRelationship']);

  if (!name && !phoneNumber && !relationship) {
    return undefined;
  }

  return {
    name: name ?? '',
    phoneNumber: phoneNumber ?? '',
    relationship: relationship ?? '',
  };
}

export function mapDriverProfileToEditFormValue(
  profile: DriverProfile,
): DynamicFormValue {
  return {
    driverLicenseNumber: profile.driverLicenseNumber,
    driverLicenseExpirationDate: toDateInputValue(
      profile.driverLicenseExpirationDate,
    ),
    driverLicensePictureUrl: profile.driverLicensePictureUrl ?? '',

    backgroundCheckStatus: profile.backgroundCheckStatus,
    backgroundCheckDate: toDateInputValue(profile.backgroundCheckDate),
    isApproved: profile.isApproved,

    driverStatus: profile.driverStatus,
    paidPriorityUntil: toDateInputValue(profile.paidPriorityUntil),

    emergencyContactName: profile.emergencyContactInfo?.name ?? '',
    emergencyContactPhoneNumber:
      profile.emergencyContactInfo?.phoneNumber ?? '',
    emergencyContactRelationship:
      profile.emergencyContactInfo?.relationship ?? '',
  };
}

export function mapEditDriverProfileFormToPayload(
  value: DynamicFormValue,
): UpdateDriverProfilePayload {
  return {
    driverLicenseNumber: asString(value['driverLicenseNumber']),
    driverLicenseExpirationDate: asDateString(
      value['driverLicenseExpirationDate'],
    ),
    driverLicensePictureUrl: asString(value['driverLicensePictureUrl']),

    backgroundCheckStatus: asString(value['backgroundCheckStatus']) as
      | BackgroundCheckStatus
      | undefined,

    backgroundCheckDate: asDateString(value['backgroundCheckDate']),
    isApproved: asBoolean(value['isApproved']),

    driverStatus: asString(value['driverStatus']) as
      | DriverStatus
      | undefined,

    paidPriorityUntil: asDateString(value['paidPriorityUntil']),

    emergencyContactInfo: mapEmergencyContact(value),
  };
}
