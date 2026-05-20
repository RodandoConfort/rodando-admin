import { DynamicFormValue } from '../../../shared/form/dynamic-form-builder';

import {
  AdminUser,
  ChangeOwnPasswordPayload,
  CreateAdminUserPayload,
  MobileUserType,
  UpdateAdminUserPayload,
  UpdateOwnProfilePayload,
  UserProfile,
  UserStatus,
} from '../data-access/users.models';

export function mapUserToEditFormValue(
  user: AdminUser,
): DynamicFormValue {
  return {
    name: user.name ?? '',
    email: user.email ?? '',
    phoneNumber: stripCubanPhonePrefix(user.phoneNumber),
    userType: normalizeMobileUserType(user.userType),
    status: user.status ?? 'active',
    profilePictureUrl: user.profilePictureUrl ?? '',
    preferredLanguage: user.preferredLanguage ?? '',
  };
}

export function mapProfileToFormValue(
  profile: UserProfile,
): DynamicFormValue {
  return {
    name: profile.name ?? '',
    email: profile.email ?? '',
    phoneNumber: stripCubanPhonePrefix(profile.phoneNumber),
    profilePictureUrl: profile.profilePictureUrl ?? '',
    preferredLanguage: profile.preferredLanguage ?? 'es',
  };
}

export function mapCreateUserFormToPayload(
  value: DynamicFormValue,
): CreateAdminUserPayload {
  return {
    user: {
      name: readString(value, 'name'),
      phoneNumber: normalizeCubanPhoneNumber(
        readString(value, 'phoneNumber'),
      ),
      userType: 'driver',
      status: 'active',
      preferredLanguage: 'es',
    },

    credentials: {
      authenticationMethod:
        'password' as CreateAdminUserPayload['credentials']['authenticationMethod'],
      password: readString(value, 'password'),
    },
  };
}

export function mapEditUserFormToPayload(
  value: DynamicFormValue,
): UpdateAdminUserPayload {
  const email = readOptionalString(value, 'email');
  const rawPhoneNumber = readOptionalString(value, 'phoneNumber');
const phoneNumber = rawPhoneNumber
  ? normalizeCubanPhoneNumber(rawPhoneNumber)
  : undefined;
  const profilePictureUrl = readOptionalString(value, 'profilePictureUrl');
  const preferredLanguage = readOptionalString(value, 'preferredLanguage');

  return {
    name: readString(value, 'name'),
    email,
    phoneNumber,
    userType: readMobileUserType(value, 'userType'),
    status: readUserStatus(value, 'status'),
    profilePictureUrl,
    preferredLanguage,
  };
}

export function mapProfileFormToPayload(
  value: DynamicFormValue,
): UpdateOwnProfilePayload {
  const email = readOptionalString(value, 'email');
  const rawPhoneNumber = readOptionalString(value, 'phoneNumber');
const phoneNumber = rawPhoneNumber
  ? normalizeCubanPhoneNumber(rawPhoneNumber)
  : undefined;
  const profilePictureUrl = readOptionalString(value, 'profilePictureUrl');
  const preferredLanguage = readOptionalString(value, 'preferredLanguage');

  return {
    name: readString(value, 'name'),
    email,
    phoneNumber,
    profilePictureUrl,
    preferredLanguage,
  };
}

export function mapPasswordFormToPayload(
  value: DynamicFormValue,
): ChangeOwnPasswordPayload {
  return {
    currentPassword: readString(value, 'currentPassword'),
    newPassword: readString(value, 'newPassword'),
  };
}

function readString(
  value: DynamicFormValue,
  key: string,
  fallback = '',
): string {
  const raw = value[key];

  if (typeof raw !== 'string') {
    return fallback;
  }

  const normalized = raw.trim();

  return normalized || fallback;
}

function readOptionalString(
  value: DynamicFormValue,
  key: string,
): string | undefined {
  const normalized = readString(value, key);

  return normalized || undefined;
}

function readMobileUserType(
  value: DynamicFormValue,
  key: string,
): MobileUserType {
  return value[key] === 'driver'
    ? 'driver'
    : 'passenger';
}

function normalizeMobileUserType(
  userType: string,
): MobileUserType {
  return userType === 'driver'
    ? 'driver'
    : 'passenger';
}

function readUserStatus(
  value: DynamicFormValue,
  key: string,
): UserStatus {
  const raw = value[key];

  if (
    raw === 'inactive' ||
    raw === 'banned'
  ) {
    return raw;
  }

  return 'active';
}

function stripCubanPhonePrefix(
  phoneNumber: string | null | undefined,
): string {
  const normalized = String(phoneNumber ?? '').trim();

  if (normalized.startsWith('+53')) {
    return normalized.slice(3);
  }

  if (normalized.startsWith('53')) {
    return normalized.slice(2);
  }

  return normalized;
}

function normalizeCubanPhoneNumber(
  phoneNumber: string,
): string {
  const normalized = phoneNumber
    .trim()
    .replace(/\s+/g, '')
    .replace(/-/g, '');

  if (!normalized) {
    return '';
  }

  if (normalized.startsWith('+53')) {
    return normalized;
  }

  if (normalized.startsWith('53')) {
    return `+${normalized}`;
  }

  return `+53${normalized.replace(/^\+/, '')}`;
}
