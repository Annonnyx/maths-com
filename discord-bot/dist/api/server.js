import express from 'express';
import cors from 'cors';
import { config } from '../config.js';
import { client } from '../client.js';
import { createTicket } from './tickets.js';
import { sendLinkDm } from './sendLinkDm.js';
import { verifyLinkingCode } from './linkVerification.js';
const app = express();
// Middleware
app.use(cors());
app.use(express.json());
// Auth middleware pour vérifier que la requête vient bien du site
function authMiddleware(req, res, next) {
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
// Healthcheck endpoint for Railway (NO AUTH required)
app.get('/health', (req, res) => {
    try {
        const isReady = client.isReady();
        res.status(200).json({
            status: isReady ? 'ok' : 'starting',
            timestamp: new Date().toISOString(),
            discord: isReady,
            uptime: process.uptime()
        });
    }
    catch (error) {
        res.status(200).json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            discord: false,
            uptime: process.uptime()
        });
    }
});
// Routes API
// Envoyer un DM de vérification Discord
app.post('/api/send-link-dm', authMiddleware, async (req, res) => {
    try {
        const { discordId, code, websiteUsername } = req.body;
        if (!discordId || !code || !websiteUsername) {
            return res.status(400).json({ error: 'Paramètres manquants' });
        }
        // Utiliser la fonction d'envoi DM
        const result = await sendLinkDm(discordId, code, websiteUsername);
        if (result.success) {
            res.json(result);
        }
        else {
            res.status(500).json(result);
        }
    }
    catch (error) {
        console.error('Erreur envoi DM:', error);
        res.status(500).json({ error: 'Failed to send DM' });
    }
});
// Vérifier un code de liaison Discord
app.put('/api/verify-link', authMiddleware, async (req, res) => {
    try {
        const { discordId, code, discordUsername } = req.body;
        if (!discordId || !code) {
            return res.status(400).json({ error: 'Discord ID et code requis' });
        }
        const result = verifyLinkingCode(discordId, code.toUpperCase());
        if (result) {
            res.json({
                valid: true,
                userId: result.userId,
                discordId,
                discordUsername: discordUsername || 'Utilisateur Discord'
            });
        }
        else {
            res.json({
                valid: false,
                error: 'Code invalide ou expiré'
            });
        }
    }
    catch (error) {
        console.error('Erreur vérification liaison:', error);
        res.status(500).json({ error: 'Failed to verify link' });
    }
});
// Envoyer un message dans un salon (remplacé par une implémentation simple)
app.post('/api/send-message', authMiddleware, async (req, res) => {
    try {
        const { channelId, content } = req.body;
        if (!channelId || !content) {
            return res.status(400).json({ error: 'channelId and content required' });
        }
        const channel = client.channels.cache.get(channelId);
        if (!channel || !channel.isTextBased()) {
            return res.status(400).json({ error: 'Invalid channel' });
        }
        const message = await channel.send(content);
        res.json({ success: true, messageId: message.id });
    }
    catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});
// Publier le classement (remplacé par une implémentation simple)
app.post('/api/publish-leaderboard', authMiddleware, async (req, res) => {
    try {
        const { type } = req.body;
        // Implémentation à compléter selon vos besoins
        res.json({ success: true, message: 'Leaderboard publication not implemented yet' });
    }
    catch (error) {
        console.error('Error publishing leaderboard:', error);
        res.status(500).json({ error: 'Failed to publish leaderboard' });
    }
});
// Créer un ticket depuis le site
app.post('/api/tickets/create', authMiddleware, async (req, res) => {
    try {
        const result = await createTicket(req.body);
        if (result && result.success) {
            res.json(result);
        }
        else {
            res.status(500).json({ error: (result && result.error) || 'Failed to create ticket' });
        }
    }
    catch (error) {
        console.error('Error creating ticket:', error);
        res.status(500).json({ error: 'Failed to create ticket' });
    }
});
// Récupérer les infos du bot
app.get('/api/status', (req, res) => {
    res.json({
        status: client.isReady() ? 'online' : 'offline',
        guilds: client.guilds.cache.size,
        users: client.users.cache.size,
    });
});
export function startApiServer(port) {
    app.listen(port, () => {
        console.log(`🌐 API server listening on port ${port}`);
    });
}
