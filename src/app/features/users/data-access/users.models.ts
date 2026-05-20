import { PaginationQuery } from "../../../core/api/pagination.model";

export type UserType =
  | 'passenger'
  | 'driver'
  | 'admin';

export type MobileUserType = Exclude<UserType, 'admin'>;

export type UserStatus =
  | 'active'
  | 'inactive'
  | 'banned';

/**
 * Según el DTO que compartiste antes:
 * AuthMethod.LOCAL
 */
export type AuthenticationMethod = 'local';

export interface AdminUser {
  id: string;

  name: string;
  email?: string | null;
  emailVerified: boolean;

  phoneNumber?: string | null;
  phoneNumberVerified: boolean;

  userType: UserType;
  status: UserStatus;

  profilePictureUrl?: string | null;
  preferredLanguage?: string | null;

  termsAcceptedAt?: string | null;
  privacyPolicyAcceptedAt?: string | null;

  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface AdminUsersQuery {
  page?: number;
  limit?: number;
  search?: string;
  userType?: UserType | null;
  status?: UserStatus | null;
}

export interface CreateAdminUserPayload {
  user: {
    name: string;
    email?: string;
    phoneNumber?: string;
    userType: MobileUserType;
    status?: UserStatus;
    profilePictureUrl?: string;
    preferredLanguage?: string;
  };
  credentials: {
    authenticationMethod: AuthenticationMethod;
    password: string;
  };
}

export interface UpdateAdminUserPayload {
  name?: string;
  email?: string;
  phoneNumber?: string;
  userType?: MobileUserType;
  status?: UserStatus;
  profilePictureUrl?: string;
  preferredLanguage?: string;
}

export interface UserProfile {
  id: string;

  name: string;
  email?: string | null;
  emailVerified: boolean;

  phoneNumber?: string | null;
  phoneNumberVerified: boolean;

  userType: UserType;
  status: UserStatus;

  profilePictureUrl?: string | null;
  preferredLanguage?: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface UpdateOwnProfilePayload {
  name?: string;
  email?: string;
  phoneNumber?: string;
  profilePictureUrl?: string;
  preferredLanguage?: string;
}

export interface ChangeOwnPasswordPayload {
  currentPassword: string;
  newPassword: string;
}
