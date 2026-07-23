import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getRevisionStatus } from '@/lib/spaced-repetition';
import { startOfDay, isSameDay } from 'date-fns';

export async function GET() {
  try {
    const problems = await db.problem.findMany({
      select: {
        id: true,
        difficulty: true,
        platform: true,
        topic: true,
        status: true,
        revisionCount: true,
        solvedDate: true,
        lastRevisedAt: true,
      },
    });

    const revisionLogs = await db.revisionLog.findMany({
      select: { revisedAt: true, problemId: true },
    });

    const totalSolved = problems.length;
    let easyCount = 0;
    let mediumCount = 0;
    let hardCount = 0;

    const platformCounts: Record<string, number> = {};
    const topicCounts: Record<string, number> = {};
    const activityCalendar: Record<string, number> = {};

    let dueForRevisionCount = 0;
    let solvedTodayCount = 0;
    let revisedTodayCount = 0;

    const today = startOfDay(new Date());

    for (const p of problems) {
      if (p.difficulty === 'Easy') easyCount++;
      else if (p.difficulty === 'Medium') mediumCount++;
      else if (p.difficulty === 'Hard') hardCount++;

      platformCounts[p.platform] = (platformCounts[p.platform] || 0) + 1;
      topicCounts[p.topic] = (topicCounts[p.topic] || 0) + 1;

      // 1-2-4-8 week Spaced Repetition Due check
      const status = getRevisionStatus(p.lastRevisedAt, p.revisionCount);
      if (status.isDue) {
        dueForRevisionCount++;
      }

      // Check if added today
      if (isSameDay(new Date(p.solvedDate), today)) {
        solvedTodayCount++;
      }

      // Map solved date to activity calendar (+1 point)
      const solvedDateStr = new Date(p.solvedDate).toISOString().split('T')[0];
      activityCalendar[solvedDateStr] = (activityCalendar[solvedDateStr] || 0) + 1;
    }

    // Map revision logs to activity calendar (+1 point per revision)
    for (const r of revisionLogs) {
      if (isSameDay(new Date(r.revisedAt), today)) {
        revisedTodayCount++;
      }
      const revDateStr = new Date(r.revisedAt).toISOString().split('T')[0];
      activityCalendar[revDateStr] = (activityCalendar[revDateStr] || 0) + 1;
    }

    return NextResponse.json({
      totalSolved,
      easyCount,
      mediumCount,
      hardCount,
      solvedTodayCount,
      revisedTodayCount,
      dueForRevisionCount,
      platformCounts,
      topicCounts,
      activityCalendar,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error fetching analytics' }, { status: 500 });
  }
}
