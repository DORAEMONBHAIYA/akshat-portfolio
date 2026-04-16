import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validateToken } from '@/lib/auth';

function getAuth(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  return validateToken(token);
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const featured = searchParams.get('featured');

    const where = featured === 'true' ? { featured: true } : {};

    const projects = await db.project.findMany({
      where,
      orderBy: { order: 'asc' },
      include: { category: { select: { id: true, name: true, slug: true } } },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Projects GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getAuth(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    const project = await db.project.create({
      data: {
        title: body.title,
        description: body.description ?? '',
        longDesc: body.longDesc ?? '',
        image: body.image ?? '',
        techStack: body.techStack ?? '',
        github: body.github ?? '',
        liveUrl: body.liveUrl ?? '',
        featured: body.featured ?? false,
        order: body.order ?? 0,
        ...(body.categoryId ? { categoryId: body.categoryId } : {}),
      },
      include: { category: { select: { id: true, name: true, slug: true } } },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Projects POST error:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
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
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    const project = await db.project.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.longDesc !== undefined && { longDesc: data.longDesc }),
        ...(data.image !== undefined && { image: data.image }),
        ...(data.techStack !== undefined && { techStack: data.techStack }),
        ...(data.github !== undefined && { github: data.github }),
        ...(data.liveUrl !== undefined && { liveUrl: data.liveUrl }),
        ...(data.featured !== undefined && { featured: data.featured }),
        ...(data.order !== undefined && { order: data.order }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId || null }),
      },
      include: { category: { select: { id: true, name: true, slug: true } } },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error('Projects PUT error:', error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
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
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    await db.project.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Projects DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
