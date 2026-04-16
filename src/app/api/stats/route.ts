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
    const session = getAuth(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [totalProjects, featuredProjects, totalSkills, totalExperience, totalEducation, totalBlogPosts, publishedPosts, totalMessages, unreadMessages] = await Promise.all([
      db.project.count(),
      db.project.count({ where: { featured: true } }),
      db.skill.count(),
      db.experience.count(),
      db.education.count(),
      db.blogPost.count(),
      db.blogPost.count({ where: { published: true } }),
      db.contactMessage.count(),
      db.contactMessage.count({ where: { read: false } }),
    ]);

    // Get unique skill categories
    const skills = await db.skill.findMany({
      select: { category: true },
      distinct: ['category'],
    });
    const skillCategories = skills.length;

    return NextResponse.json({
      totalProjects,
      featuredProjects,
      totalSkills,
      skillCategories,
      totalExperience,
      totalEducation,
      totalBlogPosts,
      publishedPosts,
      totalMessages,
      unreadMessages,
    });
  } catch (error) {
    console.error('Stats GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
