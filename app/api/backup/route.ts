import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const problems = await db.problem.findMany({
      include: {
        solutions: true,
        revisionLogs: true,
        tags: { include: { tag: true } },
      },
    });

    const formulaCategories = await db.formulaCategory.findMany({
      include: { items: true },
    });

    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      problems,
      formulaCategories,
    };

    return NextResponse.json(exportData);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error exporting backup' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { problems = [] } = body;

    let importedCount = 0;

    for (const p of problems) {
      if (!p.title) continue;

      const created = await db.problem.create({
        data: {
          title: p.title,
          platform: p.platform || 'LeetCode',
          problemUrl: p.problemUrl,
          difficulty: p.difficulty || 'Medium',
          topic: p.topic || 'Arrays',
          subtopic: p.subtopic,
          pattern: p.pattern,
          status: p.status || 'Solved',
          rating: Number(p.rating || 5),
          timeTakenMinutes: p.timeTakenMinutes ? Number(p.timeTakenMinutes) : null,
          mistakes: p.mistakes,
          notes: p.notes,
          dryRun: p.dryRun,
          timeComplexity: p.timeComplexity,
          spaceComplexity: p.spaceComplexity,
          interviewTips: p.interviewTips,
          isFavorite: Boolean(p.isFavorite),
          revisionCount: Number(p.revisionCount || 0),
          solutions: {
            create: (p.solutions || []).map((s: any) => ({
              type: s.type || 'OPTIMAL',
              language: s.language || 'cpp',
              code: s.code || '',
              title: s.title || '',
            })),
          },
        },
      });
      importedCount++;
    }

    return NextResponse.json({ success: true, importedCount });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error importing backup' }, { status: 500 });
  }
}
