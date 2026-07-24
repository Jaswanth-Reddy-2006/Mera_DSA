import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  const { isAuthenticated, role } = await getSessionUser();
  return NextResponse.json({ isAuthenticated, role });
}
