import { AccessTokenPayload } from './auth.models';

export function decodeAccessToken(token: string): AccessTokenPayload | null {
  try {
    const [, payload] = token.split('.');

    if (!payload) {
      return null;
    }

    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decodedPayload = atob(normalizedPayload);

    const jsonPayload = decodeURIComponent(
      Array.from(decodedPayload)
        .map((character) => {
          const code = character.charCodeAt(0).toString(16).padStart(2, '0');
          return `%${code}`;
        })
        .join(''),
    );

    return JSON.parse(jsonPayload) as AccessTokenPayload;
  } catch {
    return null;
  }
}

export function isTokenExpired(expiresAt?: number | null): boolean {
  if (!expiresAt) {
    return true;
  }

  return Date.now() >= expiresAt;
}