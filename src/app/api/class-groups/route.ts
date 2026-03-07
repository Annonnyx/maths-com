import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/class-groups - Liste des groupes de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Loading class groups for user:', session.user.id);
    console.log('Session full:', session);

    const groups = await prisma.classGroup.findMany({
      where: {
        OR: [
          { teacherId: session.user.id },
          { members: { some: { userId: session.user.id } } }
        ]
      },
      include: {
        teacher: {
          select: { id: true, username: true, displayName: true }
        },
        members: {
          include: {
            user: {
              select: { id: true, username: true, displayName: true }
            }
          }
        },
        _count: {
          select: { members: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log('Found groups:', groups.length);

    return NextResponse.json({ groups });
  } catch (error) {
    console.error('Error fetching class groups:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST /api/class-groups - Créer un groupe (professeur uniquement)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Vérifier si l'utilisateur est professeur
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isTeacher: true }
    });

    if (!user?.isTeacher) {
      return NextResponse.json({ error: 'Only teachers can create groups' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, level, subject, maxStudents, isPrivate } = body;

    if (!name) {
      return NextResponse.json({ error: 'Group name is required' }, { status: 400 });
    }

    // Générer un code d'invitation unique et plus long
    const generateInviteCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 10; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      // Format: XXXX-XXXX-XX
      return `${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8, 10)}`;
    };
    
    const inviteCode = generateInviteCode();

    const group = await prisma.classGroup.create({
      data: {
        name,
        description: description || null,
        level: level || null,
        subject: subject || 'maths', // Maths par défaut
        maxStudents: maxStudents || 30, // 30 par défaut, 0 = illimité
        isPrivate: isPrivate ?? false,
        inviteCode,
        teacherId: session.user.id,
        members: {
          create: {
            userId: session.user.id,
            role: 'teacher'
          }
        }
      },
      include: {
        teacher: {
          select: { id: true, username: true, displayName: true }
        },
        members: {
          include: {
            user: {
              select: { id: true, username: true, displayName: true }
            }
          }
        }
      }
    });

    return NextResponse.json({ success: true, group });
  } catch (error) {
    console.error('Error creating class group:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
