import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const DISCORD_BOT_API = process.env.DISCORD_BOT_API_URL || 'http://localhost:3001';
const DISCORD_BOT_SECRET = process.env.DISCORD_BOT_SECRET;

// Helper pour appeler l'API du bot
async function callDiscordBotAPI(endpoint: string, method: string = 'GET', body?: any) {
  const url = `${DISCORD_BOT_API}${endpoint}`;
  const options: RequestInit = {
    method,
    headers: {
      'Authorization': `Bearer ${DISCORD_BOT_SECRET}`,
      'Content-Type': 'application/json',
    },
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(url, options);
  return response.json();
}

// GET - Récupérer les tickets Discord
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  // Vérifier si l'utilisateur est admin (par email)
  if (!session?.user || session.user.email !== 'noe.barneron@gmail.com') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // Récupérer le statut du bot
    const botStatus = await callDiscordBotAPI('/api/status');
    
    return NextResponse.json({
      status: 'success',
      botStatus,
    });
  } catch (error) {
    console.error('Discord API error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to Discord bot' },
      { status: 500 }
    );
  }
}

// POST - Envoyer un message ou une commande au bot
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  // Vérifier si l'utilisateur est admin (par email)
  if (!session?.user || session.user.email !== 'noe.barneron@gmail.com') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    const { action, ...data } = body;
    
    switch (action) {
      case 'send-message':
        const messageResult = await callDiscordBotAPI('/api/send-message', 'POST', {
          channelId: data.channelId,
          content: data.content,
          embeds: data.embeds,
        });
        return NextResponse.json(messageResult);
        
      case 'publish-leaderboard':
        const lbResult = await callDiscordBotAPI('/api/publish-leaderboard', 'POST', {
          type: data.type, // 'solo' | 'multi'
        });
        return NextResponse.json(lbResult);
        
      case 'reply-ticket':
        const ticketResult = await callDiscordBotAPI('/api/ticket/reply', 'POST', {
          ticketId: data.ticketId,
          message: data.message,
          adminName: (session?.user as any)?.displayName || session?.user?.username || 'Admin',
        });
        return NextResponse.json(ticketResult);
        
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Discord API error:', error);
    return NextResponse.json(
      { error: 'Failed to execute action' },
      { status: 500 }
    );
  }
}
