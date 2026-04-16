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
    const education = await db.education.findMany({
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(education);
  } catch (error) {
    console.error('Education GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch education' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getAuth(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    const education = await db.education.create({
      data: {
        institution: body.institution,
        degree: body.degree,
        field: body.field ?? '',
        description: body.description ?? '',
        startDate: body.startDate ?? '',
        endDate: body.endDate ?? '',
        gpa: body.gpa ?? '',
        order: body.order ?? 0,
      },
    });

    return NextResponse.json(education, { status: 201 });
  } catch (error) {
    console.error('Education POST error:', error);
    return NextResponse.json({ error: 'Failed to create education' }, { status: 500 });
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
      return NextResponse.json({ error: 'Education ID is required' }, { status: 400 });
    }

    const education = await db.education.update({
      where: { id },
      data: {
        ...(data.institution !== undefined && { institution: data.institution }),
        ...(data.degree !== undefined && { degree: data.degree }),
        ...(data.field !== undefined && { field: data.field }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.startDate !== undefined && { startDate: data.startDate }),
        ...(data.endDate !== undefined && { endDate: data.endDate }),
        ...(data.gpa !== undefined && { gpa: data.gpa }),
        ...(data.order !== undefined && { order: data.order }),
      },
    });

    return NextResponse.json(education);
  } catch (error) {
    console.error('Education PUT error:', error);
    return NextResponse.json({ error: 'Failed to update education' }, { status: 500 });
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
      return NextResponse.json({ error: 'Education ID is required' }, { status: 400 });
    }

    await db.education.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Education DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete education' }, { status: 500 });
  }
}
