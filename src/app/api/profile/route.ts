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
    const profile = await db.profile.findFirst({
      where: { id: 'main-profile' },
    });

    if (!profile) {
      // Return default profile if none exists yet
      return NextResponse.json({
        id: 'main-profile',
        name: 'Developer',
        title: 'AI/ML Engineer',
        tagline: 'Building intelligent systems',
        bio: '',
        avatar: '',
        email: '',
        phone: '',
        location: '',
        website: '',
        github: '',
        linkedin: '',
        twitter: '',
        resume: '',
        leetcode: '',
        heroImage: '',
        titles: '',
      });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = getAuth(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Upsert: update if exists, create if not
    const profile = await db.profile.upsert({
      where: { id: 'main-profile' },
      update: {
        name: body.name ?? undefined,
        title: body.title ?? undefined,
        tagline: body.tagline ?? undefined,
        bio: body.bio ?? undefined,
        avatar: body.avatar ?? undefined,
        email: body.email ?? undefined,
        phone: body.phone ?? undefined,
        location: body.location ?? undefined,
        website: body.website ?? undefined,
        github: body.github ?? undefined,
        linkedin: body.linkedin ?? undefined,
        twitter: body.twitter ?? undefined,
        resume: body.resume ?? undefined,
        leetcode: body.leetcode ?? undefined,
        heroImage: body.heroImage ?? undefined,
        titles: body.titles ?? undefined,
      },
      create: {
        id: 'main-profile',
        name: body.name ?? 'Developer',
        title: body.title ?? 'AI/ML Engineer',
        tagline: body.tagline ?? 'Building intelligent systems',
        bio: body.bio ?? '',
        avatar: body.avatar ?? '',
        email: body.email ?? '',
        phone: body.phone ?? '',
        location: body.location ?? '',
        website: body.website ?? '',
        github: body.github ?? '',
        linkedin: body.linkedin ?? '',
        twitter: body.twitter ?? '',
        resume: body.resume ?? '',
        leetcode: body.leetcode ?? '',
        heroImage: body.heroImage ?? '',
        titles: body.titles ?? '',
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Profile PUT error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
