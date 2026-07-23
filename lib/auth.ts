import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'mera_dsa_session';

export async function verifyPassword(password: string): Promise<boolean> {
  const envPassword = process.env.APP_PASSWORD || 'dsa-master-password';
  return password === envPassword;
}

export async function setAuthSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = Buffer.from(process.env.APP_PASSWORD || 'dsa-master-password').toString('base64');
  
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

export async function isAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get(SESSION_COOKIE_NAME);
    if (!session?.value) return false;
    
    const expected = Buffer.from(process.env.APP_PASSWORD || 'dsa-master-password').toString('base64');
    return session.value === expected;
  } catch {
    return false;
  }
}
