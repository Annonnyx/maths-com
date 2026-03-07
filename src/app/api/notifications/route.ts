import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST - Créer une notification
export async function POST(request: NextRequest) {
  try {
    const { userId, type, title, message, senderId, senderName, senderAvatarUrl, metadata } = await request.json();
    
    if (!userId || !type || !title || !message) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
    }

    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message,
        sender_id: senderId,
        sender_name: senderName,
        sender_avatar_url: senderAvatarUrl,
        metadata
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 });
    }

    return NextResponse.json({ success: true, notification });
  } catch (error) {
    console.error('Error in notifications POST:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// GET - Récupérer les notifications d'un utilisateur
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Si pas de userId, essayer de récupérer l'utilisateur depuis la session
    let targetUserId = userId;
    if (!targetUserId) {
      const { getServerSession } = await import('next-auth/next');
      const { authOptions } = await import('@/lib/auth');
      const session = await getServerSession(authOptions);
      
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'userId requis ou non authentifié' }, { status: 400 });
      }
      
      targetUserId = session.user.id;
    }

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const { data: notifications, error } = await query;

    if (error) {
      console.error('Error fetching notifications:', error);
      return NextResponse.json({ error: 'Erreur lors de la récupération' }, { status: 500 });
    }

    // Compter le total non lu
    const { count: unreadCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', targetUserId)
      .eq('is_read', false);

    return NextResponse.json({
      notifications: notifications || [],
      unreadCount: unreadCount || 0,
      hasMore: notifications?.length === limit
    });

  } catch (error) {
    console.error('Error in notifications GET:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT - Marquer des notifications comme lues
export async function PUT(request: NextRequest) {
  try {
    const { notificationIds, markAllAsRead, userId } = await request.json();
    
    // Si pas de userId, essayer de récupérer l'utilisateur depuis la session
    let targetUserId = userId;
    if (!targetUserId) {
      const { getServerSession } = await import('next-auth/next');
      const { authOptions } = await import('@/lib/auth');
      const session = await getServerSession(authOptions);
      
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'userId requis ou non authentifié' }, { status: 400 });
      }
      
      targetUserId = session.user.id;
    }

    let query;
    
    if (markAllAsRead) {
      query = supabase
        .from('notifications')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq('user_id', targetUserId)
        .eq('is_read', false);
    } else if (notificationIds && Array.isArray(notificationIds)) {
      query = supabase
        .from('notifications')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq('user_id', targetUserId)
        .in('id', notificationIds);
    } else {
      return NextResponse.json({ error: 'notificationIds ou markAllAsRead requis' }, { status: 400 });
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error marking notifications as read:', error);
      return NextResponse.json({ error: 'Erreur lors du marquage' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      markedAsRead: data ? 1 : 0 
    });

  } catch (error) {
    console.error('Error in notifications PUT:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE - Supprimer des notifications
export async function DELETE(request: NextRequest) {
  try {
    const { notificationIds, deleteAll, userId } = await request.json();
    
    // Si pas de userId, essayer de récupérer l'utilisateur depuis la session
    let targetUserId = userId;
    if (!targetUserId) {
      const { getServerSession } = await import('next-auth/next');
      const { authOptions } = await import('@/lib/auth');
      const session = await getServerSession(authOptions);
      
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'userId requis ou non authentifié' }, { status: 400 });
      }
      
      targetUserId = session.user.id;
    }

    let query;
    
    if (deleteAll) {
      query = supabase
        .from('notifications')
        .delete()
        .eq('user_id', targetUserId);
    } else if (notificationIds && Array.isArray(notificationIds)) {
      query = supabase
        .from('notifications')
        .delete()
        .eq('user_id', targetUserId)
        .in('id', notificationIds);
    } else {
      return NextResponse.json({ error: 'notificationIds ou deleteAll requis' }, { status: 400 });
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error deleting notifications:', error);
      return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      deletedCount: data ? 1 : 0 
    });

  } catch (error) {
    console.error('Error in notifications DELETE:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
