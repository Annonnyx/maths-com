import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

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

// DELETE /api/admin/delete-user - Delete user account (admin only)
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !(await isAdminEmail(session.user.email))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, adminPassword: inputPassword } = await req.json();

    if (!userId || !inputPassword) {
      return NextResponse.json({ error: 'User ID and admin password are required' }, { status: 400 });
    }

    // Verify admin password
    const allowlistedEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD || 'Ønyx'; // Default to Ønyx if not set
    
    if (!allowlistedEmail) {
      return NextResponse.json({ error: 'Admin email not configured' }, { status: 500 });
    }

    // Compare with environment admin password or default Ønyx
    if (inputPassword !== adminPassword) {
      return NextResponse.json({ error: 'Invalid admin password' }, { status: 401 });
    }

    // Get user to delete
    const userToDelete = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!userToDelete) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent self-deletion
    if (userToDelete.email === session.user.email) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 403 });
    }

    // Delete user and all related data
    await prisma.$transaction(async (tx) => {
      // Delete user's friendships
      await tx.friendship.deleteMany({
        where: {
          OR: [
            { user1Id: userId },
            { user2Id: userId }
          ]
        }
      });

      // Delete user's badges
      await tx.userBadge.deleteMany({
        where: { userId }
      });

      // Finally delete the user
      await tx.user.delete({
        where: { id: userId }
      });
    });

    return NextResponse.json({ 
      success: true,
      message: `User ${userToDelete.username} deleted successfully` 
    });

  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ 
      error: 'Failed to delete user',
      details: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}
