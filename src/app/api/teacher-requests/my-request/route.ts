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

// GET /api/teacher-requests/my-request - Get current user's teacher request
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the user's teacher request
    const teacherRequest = await prisma.teacherRequest.findFirst({
      where: { 
        userId: session.user.id 
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!teacherRequest) {
      return NextResponse.json({ 
        request: null,
        message: 'No teacher request found'
      }, { status: 404 });
    }

    return NextResponse.json({ 
      request: teacherRequest,
      message: 'Teacher request found'
    });

  } catch (error: any) {
    console.error('Error fetching teacher request:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch teacher request',
      details: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}
