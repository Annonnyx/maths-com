'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useNotifications } from './NotificationToast';
import { useRouter } from 'next/navigation';

interface FriendRequest {
  id: string;
  user: {
    id: string;
    username: string;
    displayName: string | null;
  };
}

interface Challenge {
  id: string;
  opponent: {
    id: string;
    username: string;
    displayName: string | null;
  };
}

interface Conversation {
  friendId: string;
  friend: {
    id: string;
    username: string;
    displayName: string | null;
  };
  latestMessage: {
    id: string;
    content: string;
  };
  unreadCount: number;
}

export function NotificationChecker() {
  const { data: session } = useSession();
  const { addNotification } = useNotifications();
  const router = useRouter();
  const lastCheckRef = useRef<Date>(new Date());
  const notifiedIdsRef = useRef<Set<string>>(new Set());
  const hasShownLoginSummaryRef = useRef(false);
  const [pendingCounts, setPendingCounts] = useState({
    friends: 0,
    challenges: 0,
    messages: 0
  });

  const checkNotifications = useCallback(async (isLogin = false) => {
    if (!session?.user) return;

    try {
      // Check for new friend requests
      const friendsRes = await fetch('/api/friends');
      let friendCount = 0;
      if (friendsRes.ok) {
        const friendsData = await friendsRes.json();
        const pendingRequests: FriendRequest[] = friendsData.pendingRequests || [];
        friendCount = pendingRequests.length;
        
        pendingRequests.forEach((request) => {
          if (!notifiedIdsRef.current.has(`friend-${request.id}`)) {
            notifiedIdsRef.current.add(`friend-${request.id}`);
            if (!isLogin) {
              addNotification({
                type: 'friend',
                title: 'Nouvelle demande d\'ami',
                message: `${request.user.displayName || request.user.username} veut être votre ami`,
                onClick: () => router.push('/social'),
              });
            }
          }
        });
      }

      // Check for new challenges
      const challengesRes = await fetch('/api/challenges');
      let challengeCount = 0;
      if (challengesRes.ok) {
        const challengesData = await challengesRes.json();
        const pendingChallenges: Challenge[] = challengesData.pendingReceived || [];
        challengeCount = pendingChallenges.length;
        
        pendingChallenges.forEach((challenge) => {
          if (!notifiedIdsRef.current.has(`challenge-${challenge.id}`)) {
            notifiedIdsRef.current.add(`challenge-${challenge.id}`);
            if (!isLogin) {
              addNotification({
                type: 'challenge',
                title: 'Nouveau défi reçu !',
                message: `${challenge.opponent.displayName || challenge.opponent.username} vous défie`,
                onClick: () => router.push('/multiplayer'),
              });
            }
          }
        });
      }

      // Check for unread messages
      const messagesRes = await fetch('/api/messages');
      let messageCount = 0;
      if (messagesRes.ok) {
        const messagesData = await messagesRes.json();
        const conversations: Conversation[] = messagesData.conversations || [];
        
        conversations.forEach((conv) => {
          if (conv.unreadCount > 0 && conv.latestMessage) {
            messageCount += conv.unreadCount;
            const messageId = conv.latestMessage.id;
            if (!notifiedIdsRef.current.has(`message-${messageId}`)) {
              notifiedIdsRef.current.add(`message-${messageId}`);
              if (!isLogin) {
                addNotification({
                  type: 'message',
                  title: 'Nouveau message',
                  message: `${conv.friend.displayName || conv.friend.username}: ${conv.latestMessage.content.substring(0, 50)}${conv.latestMessage.content.length > 50 ? '...' : ''}`,
                  onClick: () => router.push('/social'),
                });
              }
            }
          }
        });
      }

      // Show login summary if there are pending items and it's the first check
      if (isLogin && !hasShownLoginSummaryRef.current) {
        hasShownLoginSummaryRef.current = true;
        const total = friendCount + challengeCount + messageCount;
        
        if (total > 0) {
          const parts = [];
          if (friendCount > 0) parts.push(`${friendCount} demande${friendCount > 1 ? 's' : ''} d'ami`);
          if (challengeCount > 0) parts.push(`${challengeCount} défi${challengeCount > 1 ? 's' : ''}`);
          if (messageCount > 0) parts.push(`${messageCount} message${messageCount > 1 ? 's' : ''}`);
          
          addNotification({
            type: 'friend',
            title: `📬 Vous avez ${total} notification${total > 1 ? 's' : ''}`,
            message: parts.join(' • '),
            duration: 0, // Stay until clicked
            onClick: () => router.push('/social'),
          });
        }
      }

      setPendingCounts({
        friends: friendCount,
        challenges: challengeCount,
        messages: messageCount
      });

      lastCheckRef.current = new Date();
    } catch (error) {
      console.error('Error checking notifications:', error);
    }
  }, [session, addNotification, router]);

  useEffect(() => {
    if (!session?.user) {
      hasShownLoginSummaryRef.current = false;
      return;
    }

    // Check immediately on mount with login summary
    checkNotifications(true);

    // Then check every 30 seconds (without login summary)
    const interval = setInterval(() => checkNotifications(false), 30000);

    return () => clearInterval(interval);
  }, [session, checkNotifications]);

  // Also check when window becomes visible
  useEffect(() => {
    if (!session?.user) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkNotifications(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [session, checkNotifications]);

  return null;
}
