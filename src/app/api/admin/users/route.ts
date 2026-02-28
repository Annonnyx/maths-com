import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || !(await isAdmin(session.user.email))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Récupérer tous les utilisateurs avec leurs informations
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        displayName: true,
        email: true,
        elo: true,
        rankClass: true,
        isAdmin: true,
        createdAt: true,
      },
      orderBy: [
        { createdAt: 'desc' }
      ]
    });

    // Pour l'instant, retourner des demandes vides jusqu'à ce que la migration soit faite
    const teacherRequests: any[] = [];

    return NextResponse.json({
      users,
      requests: teacherRequests
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || !(await isAdmin(session.user.email))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, makeTeacher } = await request.json();

    // TODO: Activer quand les champs seront ajoutés à la BDD
    // const updatedUser = await prisma.user.update({
    //   where: { id: userId },
    //   data: { isTeacher: makeTeacher }
    // });

    return NextResponse.json({
      success: true,
      message: 'Teacher status update not implemented yet'
    });

  } catch (error) {
    console.error('Error updating teacher status:', error);
    return NextResponse.json(
      { error: 'Failed to update teacher status' },
      { status: 500 }
    );
  }
}
