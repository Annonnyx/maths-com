import express, { Request, Response } from 'express';
import cors from 'cors';
import { config } from '../config.js';
import { client } from '../client.js';
import { 
  sendMessageToChannel, 
  publishLeaderboard, 
  createTicketFromDiscord,
  replyToTicket 
} from './discordActions.js';
import { verifyLinkCode } from '../commands/link.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Auth middleware pour vérifier que la requête vient bien du site
function authMiddleware(req: Request, res: Response, next: Function) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const token = authHeader.split(' ')[1];
  if (token !== config.api.secret) {
    return res.status(403).json({ error: 'Invalid token' });
  }
  
  next();
}

// Routes API

// Vérifier un code de liaison
app.post('/api/verify-link', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { code, userId, username } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Code required' });
    }
    
    const result = verifyLinkCode(code);
    
    if (result.valid) {
      // Envoyer un DM de confirmation à l'utilisateur Discord
      try {
        const discordUser = await client.users.fetch(result.discordId!);
        await discordUser.send({
          content: `✅ Votre compte Discord a été lié avec succès à **${username}** sur Maths-App.com !\n\nVous allez maintenant recevoir les rôles automatiques selon vos badges et progression.`
        });
      } catch (dmError) {
        console.log('Could not send DM to user');
      }
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error verifying link code:', error);
    res.status(500).json({ error: 'Failed to verify code' });
  }
});

// Envoyer un message dans un salon
app.post('/api/send-message', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { channelId, content, embeds } = req.body;
    
    if (!channelId || !content) {
      return res.status(400).json({ error: 'channelId and content required' });
    }
    
    const result = await sendMessageToChannel(channelId, content, embeds);
    res.json({ success: true, messageId: result });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Publier le classement
app.post('/api/publish-leaderboard', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { type } = req.body; // 'solo' | 'multi'
    await publishLeaderboard(type);
    res.json({ success: true });
  } catch (error) {
    console.error('Error publishing leaderboard:', error);
    res.status(500).json({ error: 'Failed to publish leaderboard' });
  }
});

// Créer un ticket depuis Discord
app.post('/api/ticket/create', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId, username, subject, message } = req.body;
    const ticketId = await createTicketFromDiscord(userId, username, subject, message);
    res.json({ success: true, ticketId });
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

// Répondre à un ticket depuis le panel admin
app.post('/api/ticket/reply', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { ticketId, message, adminName } = req.body;
    await replyToTicket(ticketId, message, adminName);
    res.json({ success: true });
  } catch (error) {
    console.error('Error replying to ticket:', error);
    res.status(500).json({ error: 'Failed to reply to ticket' });
  }
});

// Récupérer les infos du bot
app.get('/api/status', (req: Request, res: Response) => {
  res.json({
    status: client.isReady() ? 'online' : 'offline',
    guilds: client.guilds.cache.size,
    users: client.users.cache.size,
  });
});

export function startApiServer(port: number) {
  app.listen(port, () => {
    console.log(`🌐 API server listening on port ${port}`);
  });
}
