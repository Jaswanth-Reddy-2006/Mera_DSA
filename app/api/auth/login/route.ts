import { NextResponse } from 'next/server';
import { verifyPassword, setAuthSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    const { valid, role } = await verifyPassword(password);

    if (valid && role) {
      await setAuthSession(role);
      return NextResponse.json({ success: true, role });
    }

    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Authentication failed' }, { status: 500 });
  }
}
