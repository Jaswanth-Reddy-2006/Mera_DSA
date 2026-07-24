import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'mera_dsa_session';

export type UserRole = 'admin' | 'guest';

export async function verifyPassword(password: string): Promise<{ valid: boolean; role: UserRole | null }> {
  const adminPassword = process.env.APP_PASSWORD || 'dsa-master-password';
  const guestPassword = process.env.GUEST_PASSWORD || 'dsa-guest-password';

  const cleanPass = (password || '').trim();

  if (cleanPass === adminPassword.trim()) {
    return { valid: true, role: 'admin' };
  }
  if (cleanPass === guestPassword.trim()) {
    return { valid: true, role: 'guest' };
  }

  return { valid: false, role: null };
}

export async function setAuthSession(role: UserRole): Promise<void> {
  const cookieStore = await cookies();
  const tokenPayload = JSON.stringify({ role, timestamp: Date.now() });
  const token = Buffer.from(tokenPayload).toString('base64');

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  });
}

export async function removeAuthSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getSessionUser(): Promise<{ isAuthenticated: boolean; role: UserRole | null }> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get(SESSION_COOKIE_NAME);
    if (!session?.value) return { isAuthenticated: false, role: null };

    const decoded = JSON.parse(Buffer.from(session.value, 'base64').toString('utf-8'));
    if (decoded?.role === 'admin' || decoded?.role === 'guest') {
      return { isAuthenticated: true, role: decoded.role };
    }

    return { isAuthenticated: false, role: null };
  } catch {
    return { isAuthenticated: false, role: null };
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const { isAuthenticated: auth } = await getSessionUser();
  return auth;
}
