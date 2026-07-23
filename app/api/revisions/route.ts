import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { problemId, qualityRating = 5, notes } = await request.json();
    if (!problemId) {
      return NextResponse.json({ error: 'problemId is required' }, { status: 400 });
    }

    const now = new Date();

    // Create revision log
    const log = await db.revisionLog.create({
      data: {
        problemId,
        revisedAt: now,
        qualityRating: Number(qualityRating),
        notes,
      },
    });

    // Update problem revision count and lastRevisedAt
    const problem = await db.problem.update({
      where: { id: problemId },
      data: {
        revisionCount: { increment: 1 },
        lastRevisedAt: now,
      },
    });

    return NextResponse.json({ success: true, log, problem });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error recording revision' }, { status: 500 });
  }
}
