import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validateToken } from '@/lib/auth';

function getAuth(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  return validateToken(token);
}

// GET /api/hero-stats — public, returns all hero stats ordered
export async function GET() {
  try {
    const stats = await db.heroStat.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(stats);
  } catch (error) {
    console.error('HeroStats GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch hero stats' }, { status: 500 });
  }
}

// POST /api/hero-stats — admin, create new hero stat
export async function POST(req: NextRequest) {
  try {
    const session = getAuth(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { label, value, icon, order } = body;

    const stat = await db.heroStat.create({
      data: {
        label: label || '',
        value: value || '',
        icon: icon || '',
        order: order ?? 0,
      },
    });

    return NextResponse.json(stat, { status: 201 });
  } catch (error) {
    console.error('HeroStats POST error:', error);
    return NextResponse.json({ error: 'Failed to create hero stat' }, { status: 500 });
  }
}

// PUT /api/hero-stats — admin, update hero stat
export async function PUT(req: NextRequest) {
  try {
    const session = getAuth(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'Stat ID is required' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (data.label !== undefined) updateData.label = data.label;
    if (data.value !== undefined) updateData.value = data.value;
    if (data.icon !== undefined) updateData.icon = data.icon;
    if (data.order !== undefined) updateData.order = data.order;

    const stat = await db.heroStat.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(stat);
  } catch (error) {
    console.error('HeroStats PUT error:', error);
    return NextResponse.json({ error: 'Failed to update hero stat' }, { status: 500 });
  }
}

// DELETE /api/hero-stats — admin, delete hero stat
export async function DELETE(req: NextRequest) {
  try {
    const session = getAuth(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Stat ID is required' }, { status: 400 });
    }

    await db.heroStat.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('HeroStats DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete hero stat' }, { status: 500 });
  }
}
