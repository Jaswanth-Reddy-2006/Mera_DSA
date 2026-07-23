import { NextResponse } from 'next/server';
import { removeAuthSession } from '@/lib/auth';

export async function POST() {
  await removeAuthSession();
  return NextResponse.json({ success: true });
}
