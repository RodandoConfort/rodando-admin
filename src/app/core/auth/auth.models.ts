export enum AppAudience {
  DriverApp = 'driver_app',
  PassengerApp = 'passenger_app',
  AdminPanel = 'admin_panel',
  ApiClient = 'api_client',
}

export enum SessionType {
  Web = 'web',
  MobileApp = 'mobile_app',
  ApiClient = 'api_client',
}

export enum UserType {
  Driver = 'driver',
  Passenger = 'passenger',
  Admin = 'admin',
}

export interface DeviceInfo {
  os?: string;
  browser?: string;
  model?: string;
  appVersion?: string;
}

export interface LoginPayload {
  email?: string;
  phoneNumber?: string;
  password: string;
  sessionType?: SessionType;
  appAudience: AppAudience;
  expectedUserType?: UserType;
  deviceInfo?: DeviceInfo;
  userAgent?: string;
}

export interface AdminLoginPayload {
  email?: string;
  phoneNumber?: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email?: string;
  phoneNumber?: string;
  name?: string;
  userType?: UserType;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  sessionType: SessionType;
  accessTokenExpiresAt: number;
  refreshTokenExpiresAt: number;
  sid?: string;
  user?: AuthUser;
  userType?: UserType;
}

export interface AuthSession {
  accessToken: string;
  sessionType: SessionType;
  accessTokenExpiresAt: number;
  refreshTokenExpiresAt: number;
  sid?: string;
  user?: AuthUser | null;
  userType?: UserType | null;
}

export interface AuthSnapshot {
  user: AuthUser | null;
  sessionType: SessionType | null;
  sid?: string | null;
  accessTokenExpiresAt?: number | null;
  refreshTokenExpiresAt?: number | null;
  userType?: UserType | null;
}

export interface AccessTokenPayload {
  sub: string;
  email?: string;
  phoneNumber?: string;
  sid?: string;
  aud?: AppAudience;
  userType?: UserType;
  iat?: number;
  exp?: number;
  iss?: string;
}

export type AuthStatus =
  | 'idle'
  | 'checking'
  | 'authenticated'
  | 'unauthenticated';