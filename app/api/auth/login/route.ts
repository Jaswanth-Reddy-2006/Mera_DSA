import { NextResponse } from 'next/server';
import { verifyPassword, setAuthSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    if (!password) {
      return NextResponse.json({ error: 'Password required' }, { status: 400 });
    }

    const isValid = await verifyPassword(password);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    await setAuthSession();
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Authentication failed' }, { status: 500 });
  }
}
