import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validateToken } from '@/lib/auth';

function getAuth(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  return validateToken(token);
}

export async function GET() {
  try {
    const achievements = await db.achievement.findMany({
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(achievements);
  } catch (error) {
    console.error('Achievement GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch achievements' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getAuth(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    const achievement = await db.achievement.create({
      data: {
        title: body.title,
        description: body.description ?? '',
        date: body.date ?? '',
        techStack: body.techStack ?? '',
        order: body.order ?? 0,
      },
    });

    return NextResponse.json(achievement, { status: 201 });
  } catch (error) {
    console.error('Achievement POST error:', error);
    return NextResponse.json({ error: 'Failed to create achievement' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = getAuth(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'Achievement ID is required' }, { status: 400 });
    }

    const achievement = await db.achievement.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.date !== undefined && { date: data.date }),
        ...(data.techStack !== undefined && { techStack: data.techStack }),
        ...(data.order !== undefined && { order: data.order }),
      },
    });

    return NextResponse.json(achievement);
  } catch (error) {
    console.error('Achievement PUT error:', error);
    return NextResponse.json({ error: 'Failed to update achievement' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = getAuth(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Achievement ID is required' }, { status: 400 });
    }

    await db.achievement.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Achievement DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete achievement' }, { status: 500 });
  }
}
