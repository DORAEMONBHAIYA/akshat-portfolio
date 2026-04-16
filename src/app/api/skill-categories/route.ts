import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validateToken } from '@/lib/auth';

function getAuth(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  return validateToken(token);
}

// GET /api/skill-categories — public, returns all skill categories
export async function GET() {
  try {
    const categories = await db.skillCategory.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error('SkillCategories GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch skill categories' }, { status: 500 });
  }
}

// POST /api/skill-categories — admin, create new skill category
export async function POST(req: NextRequest) {
  try {
    const session = getAuth(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, order } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const category = await db.skillCategory.create({
      data: {
        name: name.trim(),
        order: order ?? 0,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error && error.message.includes('Unique')
      ? 'Category already exists'
      : 'Failed to create category';
    console.error('SkillCategories POST error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT /api/skill-categories — admin, update skill category
export async function PUT(req: NextRequest) {
  try {
    const session = getAuth(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.order !== undefined) updateData.order = data.order;

    const category = await db.skillCategory.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('SkillCategories PUT error:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

// DELETE /api/skill-categories — admin, delete skill category
export async function DELETE(req: NextRequest) {
  try {
    const session = getAuth(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    await db.skillCategory.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('SkillCategories DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
