import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function isAdminEmail(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { isAdmin: true }
  });
  return user?.isAdmin || false;
}

// DELETE /api/admin/faq-submissions/[id] - Supprimer une soumission
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !(await isAdminEmail(session.user.email))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    // Vérifier si la soumission existe
    const submission = await prisma.faqSubmission.findUnique({
      where: { id }
    });

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // Supprimer la soumission
    await prisma.faqSubmission.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting FAQ submission:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
