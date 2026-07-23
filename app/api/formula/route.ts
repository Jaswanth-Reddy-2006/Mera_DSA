import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { FLAT_FORMULA_ITEMS } from '@/lib/default-formula-data';

export async function GET() {
  try {
    const count = await db.formulaCategory.count();
    if (count === 0) {
      for (const item of FLAT_FORMULA_ITEMS) {
        const cat = await db.formulaCategory.create({
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

    const categories = await db.formulaCategory.findMany({
      include: { items: true },
    });

    return NextResponse.json(categories);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error fetching formula sheet' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { categoryId, categoryName, title, syntax, description, codeSnippet, commonMistakes } = body;

    let catId = categoryId;

    if (!catId && categoryName) {
      const newCat = await db.formulaCategory.create({
        data: { name: categoryName },
      });
      catId = newCat.id;
    }

    if (!catId || !title || !syntax) {
      return NextResponse.json({ error: 'Category, title, and syntax are required' }, { status: 400 });
    }

    const newItem = await db.formulaItem.create({
      data: {
        categoryId: catId,
        title,
        syntax,
        description,
        codeSnippet,
        commonMistakes,
      },
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error adding formula item' }, { status: 500 });
  }
}
