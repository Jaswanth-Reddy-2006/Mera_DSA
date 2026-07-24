import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { role } = await getSessionUser();
    if (role === 'guest') {
      return NextResponse.json({ error: 'Read-only mode. Guest accounts cannot mark revisions.' }, { status: 403 });
    }

    const { problemId, qualityRating = 5, notes } = await request.json();

    if (!problemId) {
      return NextResponse.json({ error: 'Problem ID is required' }, { status: 400 });
    }

    const now = new Date();

    const revision = await db.revisionLog.create({
      data: {
        problemId,
        revisedAt: now,
        qualityRating: Number(qualityRating),
        notes,
      },
    });

    await db.problem.update({
      where: { id: problemId },
      data: {
        lastRevisedAt: now,
        revisionCount: { increment: 1 },
      },
    });

    return NextResponse.json(revision, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error recording revision' }, { status: 500 });
  }
}
