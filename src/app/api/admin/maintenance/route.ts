import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { 
  cleanupIncompleteTests, 
  cleanupDebugLogs, 
  optimizeDatabase, 
  validateEloData, 
  getSystemHealth 
} from '@/lib/maintenance';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Vérifier si l'utilisateur est admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isAdmin: true }
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    console.log('=== MAINTENANCE API ===');
    console.log('User:', session.user.email);
    console.log('Action:', action);

    let result;

    switch (action) {
      case 'health':
        result = await getSystemHealth();
        break;
        
      case 'cleanup':
        const cleanedTests = await cleanupIncompleteTests();
        result = { cleanedTests, message: 'Cleanup completed' };
        break;
        
      case 'validate':
        const invalidUsers = await validateEloData();
        result = { invalidUsers, message: 'Validation completed' };
        break;
        
      case 'optimize':
        await optimizeDatabase();
        result = { message: 'Database optimization completed' };
        break;
        
      case 'logs':
        await cleanupDebugLogs();
        result = { message: 'Debug logs cleaned' };
        break;
        
      default:
        result = await getSystemHealth();
    }

    console.log('Maintenance result:', result);
    console.log('========================');

    return NextResponse.json({
      success: true,
      action,
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Maintenance error:', error);
    return NextResponse.json({ 
      error: 'Maintenance operation failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
