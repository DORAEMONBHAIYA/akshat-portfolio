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
    const experiences = await db.experience.findMany({
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(experiences);
  } catch (error) {
    console.error('Experience GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch experiences' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getAuth(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    const experience = await db.experience.create({
      data: {
        company: body.company,
        role: body.role,
        description: body.description ?? '',
        startDate: body.startDate ?? '',
        endDate: body.endDate ?? '',
        current: body.current ?? false,
        techStack: body.techStack ?? '',
        order: body.order ?? 0,
      },
    });

    return NextResponse.json(experience, { status: 201 });
  } catch (error) {
    console.error('Experience POST error:', error);
    return NextResponse.json({ error: 'Failed to create experience' }, { status: 500 });
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
      return NextResponse.json({ error: 'Experience ID is required' }, { status: 400 });
    }

    const experience = await db.experience.update({
      where: { id },
      data: {
        ...(data.company !== undefined && { company: data.company }),
        ...(data.role !== undefined && { role: data.role }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.startDate !== undefined && { startDate: data.startDate }),
        ...(data.endDate !== undefined && { endDate: data.endDate }),
        ...(data.current !== undefined && { current: data.current }),
        ...(data.techStack !== undefined && { techStack: data.techStack }),
        ...(data.order !== undefined && { order: data.order }),
      },
    });

    return NextResponse.json(experience);
  } catch (error) {
    console.error('Experience PUT error:', error);
    return NextResponse.json({ error: 'Failed to update experience' }, { status: 500 });
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
      return NextResponse.json({ error: 'Experience ID is required' }, { status: 400 });
    }

    await db.experience.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Experience DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete experience' }, { status: 500 });
  }
}
