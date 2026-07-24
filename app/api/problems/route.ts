import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { FLAT_FORMULA_ITEMS } from '@/lib/default-formula-data';
import { getSessionUser } from '@/lib/auth';

async function seedFormulasIfEmpty() {
  const count = await db.formulaCategory.count();
  if (count === 0) {
    for (const item of FLAT_FORMULA_ITEMS) {
      await db.formulaCategory.create({
        data: {
          name: item.title,
          items: {
            create: [
              {
                title: item.title,
                syntax: item.syntax,
                description: item.description,
                codeSnippet: item.declaration,
              },
            ],
          },
        },
      });
    }
  }
}

export async function GET(request: Request) {
  try {
    await seedFormulasIfEmpty();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const difficulty = searchParams.get('difficulty');
    const platform = searchParams.get('platform');
    const topic = searchParams.get('topic');
    const status = searchParams.get('status');

    const where: any = {};

    if (difficulty && difficulty !== 'All') where.difficulty = difficulty;
    if (platform && platform !== 'All') where.platform = platform;
    if (topic && topic !== 'All') where.topic = topic;
    if (status && status !== 'All') where.status = status;

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { topic: { contains: search } },
        { subtopic: { contains: search } },
        { pattern: { contains: search } },
        { notes: { contains: search } },
        { problemDescription: { contains: search } },
        { mistakes: { contains: search } },
      ];
    }

    const problems = await db.problem.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        solutions: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    const formatted = problems.map(p => ({
      ...p,
      solvedDate: p.solvedDate.toISOString(),
      lastRevisedAt: p.lastRevisedAt.toISOString(),
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      tags: p.tags.map(t => ({ id: t.tag.id, name: t.tag.name })),
    }));

    return NextResponse.json(formatted);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch problems' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { role } = await getSessionUser();
    if (role === 'guest') {
      return NextResponse.json({ error: 'Read-only mode. Guest accounts cannot create problems.' }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      platform = 'LeetCode',
      problemUrl,
      problemDescription,
      difficulty = 'Medium',
      topic = 'Arrays',
      subtopic,
      pattern,
      status = 'Solved',
      rating = 5,
      timeTakenMinutes = 20,
      mistakes,
      notes,
      dryRun,
      timeComplexity,
      spaceComplexity,
      interviewTips,
      solutions = [],
      categories = [],
    } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const now = new Date();

    const newProblem = await db.problem.create({
      data: {
        title,
        platform,
        problemUrl,
        problemDescription,
        difficulty,
        topic,
        subtopic,
        pattern,
        status,
        rating: Number(rating),
        timeTakenMinutes: timeTakenMinutes ? Number(timeTakenMinutes) : null,
        mistakes,
        notes,
        dryRun,
        timeComplexity,
        spaceComplexity,
        interviewTips,
        revisionCount: 1,
        lastRevisedAt: now,
        solvedDate: now,
        solutions: {
          create: solutions
            .filter((s: any) => s.code && s.code.trim().length > 0)
            .map((s: any) => ({
              type: s.type || 'OPTIMAL',
              title: s.title || '',
              language: 'cpp',
              code: s.code || '',
              timeComplexity: s.timeComplexity || 'O(N)',
              spaceComplexity: s.spaceComplexity || 'O(1)',
            })),
        },
      },
      include: {
        solutions: true,
      },
    });

    await db.revisionLog.create({
      data: {
        problemId: newProblem.id,
        revisedAt: now,
        qualityRating: 5,
        notes: 'Initial Problem Solved',
      },
    });

    if (categories && categories.length > 0) {
      for (const catName of categories) {
        if (!catName || !catName.trim()) continue;
        const tagObj = await db.tag.upsert({
          where: { name: catName.trim() },
          update: {},
          create: { name: catName.trim() },
        });
        await db.problemTag.create({
          data: {
            problemId: newProblem.id,
            tagId: tagObj.id,
          },
        });
      }
    }

    return NextResponse.json(newProblem, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create problem' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { role } = await getSessionUser();
    if (role === 'guest') {
      return NextResponse.json({ error: 'Read-only mode. Guest accounts cannot edit problems.' }, { status: 403 });
    }

    const body = await request.json();
    const { id, ...data } = body;
    if (!id) {
      return NextResponse.json({ error: 'Problem ID required' }, { status: 400 });
    }

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.platform !== undefined) updateData.platform = data.platform;
    if (data.problemUrl !== undefined) updateData.problemUrl = data.problemUrl;
    if (data.problemDescription !== undefined) updateData.problemDescription = data.problemDescription;
    if (data.difficulty !== undefined) updateData.difficulty = data.difficulty;
    if (data.topic !== undefined) updateData.topic = data.topic;
    if (data.subtopic !== undefined) updateData.subtopic = data.subtopic;
    if (data.pattern !== undefined) updateData.pattern = data.pattern;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.rating !== undefined) updateData.rating = Number(data.rating);
    if (data.timeTakenMinutes !== undefined) updateData.timeTakenMinutes = data.timeTakenMinutes ? Number(data.timeTakenMinutes) : null;
    if (data.mistakes !== undefined) updateData.mistakes = data.mistakes;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const updated = await db.problem.update({
      where: { id },
      data: updateData,
    });

    if (data.solutions && Array.isArray(data.solutions)) {
      await db.problemSolution.deleteMany({ where: { problemId: id } });
      await db.problemSolution.createMany({
        data: data.solutions.map((s: any) => ({
          problemId: id,
          type: s.type || 'OPTIMAL',
          title: s.title || '',
          language: 'cpp',
          code: s.code || '',
          timeComplexity: s.timeComplexity || 'O(N)',
          spaceComplexity: s.spaceComplexity || 'O(1)',
        })),
      });
    }

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update problem' }, { status: 500 });
  }
}
