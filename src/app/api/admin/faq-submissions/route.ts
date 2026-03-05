import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function isAdminEmail(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { isAdmin: true, email: true }
  });

  if (user?.isAdmin) return true;

  const allowlistedEmail = process.env.ADMIN_EMAIL;
  if (allowlistedEmail && user?.email && user.email.toLowerCase() === allowlistedEmail.toLowerCase()) {
    return true;
  }

  return false;
}

// GET /api/admin/faq-submissions - Get all FAQ submissions (admin only)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !(await isAdminEmail(session.user.email))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const submissions = await prisma.faqSubmission.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to 50 most recent
    });

    return NextResponse.json({ 
      success: true,
      submissions: submissions.map(sub => ({
        id: sub.id,
        type: sub.type,
        title: sub.title,
        description: sub.description,
        email: sub.email,
        category: sub.category,
        status: sub.status,
        createdAt: sub.createdAt,
        userAgent: sub.userAgent,
        ip: sub.ip
      }))
    });

  } catch (error: any) {
    console.error('Error fetching FAQ submissions:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch submissions',
      details: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}

// PATCH /api/admin/faq-submissions/[id] - Update submission status (admin only)
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !(await isAdminEmail(session.user.email))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ error: 'ID and status are required' }, { status: 400 });
    }

    const submission = await prisma.faqSubmission.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json({ 
      success: true,
      submission
    });

  } catch (error: any) {
    console.error('Error updating FAQ submission:', error);
    return NextResponse.json({ 
      error: 'Failed to update submission',
      details: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}
