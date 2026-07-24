import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const problem = await db.problem.findUnique({
      where: { id },
      include: {
        solutions: true,
        revisionLogs: {
          orderBy: { revisedAt: 'desc' },
        },
        tags: {
          include: { tag: true },
        },
        sourceRelations: {
          include: { targetProblem: true },
        },
        targetRelations: {
          include: { sourceProblem: true },
        },
      },
    });

    if (!problem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }

    const formatted = {
      ...problem,
      solvedDate: problem.solvedDate.toISOString(),
      lastRevisedAt: problem.lastRevisedAt.toISOString(),
      createdAt: problem.createdAt.toISOString(),
      updatedAt: problem.updatedAt.toISOString(),
      tags: problem.tags.map(t => ({ id: t.tag.id, name: t.tag.name })),
      revisionLogs: problem.revisionLogs.map(r => ({
        ...r,
        revisedAt: r.revisedAt.toISOString(),
      })),
    };

    return NextResponse.json(formatted);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error fetching problem' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { role } = await getSessionUser();
    if (role === 'guest') {
      return NextResponse.json({ error: 'Read-only mode. Guest accounts cannot edit problems.' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { solutions = [], tags = [], ...data } = body;

    // Update main fields
    const updated = await db.problem.update({
      where: { id },
      data: {
        title: data.title,
        platform: data.platform,
        problemUrl: data.problemUrl,
        problemDescription: data.problemDescription,
        difficulty: data.difficulty,
        topic: data.topic,
        subtopic: data.subtopic,
        pattern: data.pattern,
        status: data.status,
        rating: Number(data.rating || 5),
        timeTakenMinutes: data.timeTakenMinutes ? Number(data.timeTakenMinutes) : null,
        mistakes: data.mistakes,
        notes: data.notes,
        dryRun: data.dryRun,
        timeComplexity: data.timeComplexity,
        spaceComplexity: data.spaceComplexity,
        interviewTips: data.interviewTips,
        isFavorite: Boolean(data.isFavorite),
      },
    });

    // Update solutions: delete existing and recreate
    await db.problemSolution.deleteMany({ where: { problemId: id } });
    if (solutions.length > 0) {
      await db.problemSolution.createMany({
        data: solutions.map((s: any) => ({
          problemId: id,
          type: s.type,
          language: s.language || 'cpp',
          code: s.code || '',
          title: s.title || '',
          timeComplexity: s.timeComplexity || 'O(N)',
          spaceComplexity: s.spaceComplexity || 'O(1)',
        })),
      });
    }

    // Update tags
    await db.problemTag.deleteMany({ where: { problemId: id } });
    for (const tagName of tags) {
      const name = typeof tagName === 'string' ? tagName : tagName.name;
      if (!name || !name.trim()) continue;
      const tagObj = await db.tag.upsert({
        where: { name: name.trim() },
        update: {},
        create: { name: name.trim() },
      });
      await db.problemTag.create({
        data: {
          problemId: id,
          tagId: tagObj.id,
        },
      });
    }

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error updating problem' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { role } = await getSessionUser();
    if (role === 'guest') {
      return NextResponse.json({ error: 'Read-only mode. Guest accounts cannot delete problems.' }, { status: 403 });
    }

    const { id } = await params;
    await db.problem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error deleting problem' }, { status: 500 });
  }
}
