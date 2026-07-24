import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { FLAT_FORMULA_ITEMS } from '@/lib/default-formula-data';

export async function GET() {
  try {
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
                  codeSnippet: JSON.stringify({
                    declaration: item.declaration,
                    insertion: item.insertion,
                    lookup: item.lookup,
                    deletion: item.deletion,
                    iteration: item.iteration,
                    sizeCheck: item.sizeCheck,
                  }),
                },
              ],
            },
          },
        });
      }
    }

    const categories = await db.formulaCategory.findMany({
      include: { items: true },
      orderBy: { order: 'asc' },
    });

    const customItems = categories.flatMap((c) =>
      c.items.map((i) => {
        let details: any = {};
        try {
          details = JSON.parse(i.codeSnippet || '{}');
        } catch {
          details = { declaration: i.codeSnippet };
        }

        return {
          id: i.id,
          title: i.title,
          syntax: i.syntax,
          description: i.description || '',
          declaration: details.declaration || '',
          insertion: details.insertion || '',
          lookup: details.lookup || '',
          deletion: details.deletion || '',
          iteration: details.iteration || '',
          sizeCheck: details.sizeCheck || '',
        };
      })
    );

    return NextResponse.json(customItems);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error fetching formula sheet' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, syntax, description, declaration, insertion, lookup, deletion, iteration, sizeCheck } = body;

    if (!title || !syntax) {
      return NextResponse.json({ error: 'Title and primary syntax are required' }, { status: 400 });
    }

    let defaultCategory = await db.formulaCategory.findFirst({
      where: { name: 'Custom Formulas' },
    });

    if (!defaultCategory) {
      defaultCategory = await db.formulaCategory.create({
        data: { name: 'Custom Formulas', order: 99 },
      });
    }

    const codeSnippetJson = JSON.stringify({
      declaration,
      insertion,
      lookup,
      deletion,
      iteration,
      sizeCheck,
    });

    const newItem = await db.formulaItem.create({
      data: {
        categoryId: defaultCategory.id,
        title,
        syntax,
        description,
        codeSnippet: codeSnippetJson,
      },
    });

    return NextResponse.json(
      {
        id: newItem.id,
        title: newItem.title,
        syntax: newItem.syntax,
        description: newItem.description || '',
        declaration,
        insertion,
        lookup,
        deletion,
        iteration,
        sizeCheck,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error adding formula item' }, { status: 500 });
  }
}
