"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startApiServer = startApiServer;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const config_js_1 = require("../config.js");
const client_js_1 = require("../client.js");
const discordActions_js_1 = require("./discordActions.js");
const sendLinkDm_js_1 = require("./sendLinkDm.js");
const linkVerification_js_1 = require("./linkVerification.js");
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Auth middleware pour vérifier que la requête vient bien du site
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = authHeader.split(' ')[1];
    if (token !== config_js_1.config.api.secret) {
        return res.status(403).json({ error: 'Invalid token' });
    }
    next();
}
// Routes API
// Envoyer un DM de vérification Discord
app.post('/api/send-link-dm', authMiddleware, async (req, res) => {
    try {
        const { discordId, code, websiteUsername } = req.body;
        if (!discordId || !code || !websiteUsername) {
            return res.status(400).json({ error: 'Paramètres manquants' });
        }
        // Utiliser la fonction d'envoi DM
        const result = await (0, sendLinkDm_js_1.sendLinkDm)(discordId, code, websiteUsername);
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
        const result = (0, linkVerification_js_1.verifyLinkingCode)(discordId, code.toUpperCase());
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
// Envoyer un message dans un salon
app.post('/api/send-message', authMiddleware, async (req, res) => {
    try {
        const { channelId, content, embeds } = req.body;
        if (!channelId || !content) {
            return res.status(400).json({ error: 'channelId and content required' });
        }
        const result = await (0, discordActions_js_1.sendMessageToChannel)(channelId, content, embeds);
        res.json({ success: true, messageId: result });
    }
    catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});
// Publier le classement
app.post('/api/publish-leaderboard', authMiddleware, async (req, res) => {
    try {
        const { type } = req.body; // 'solo' | 'multi'
        await (0, discordActions_js_1.publishLeaderboard)(type);
        res.json({ success: true });
    }
    catch (error) {
        console.error('Error publishing leaderboard:', error);
        res.status(500).json({ error: 'Failed to publish leaderboard' });
    }
});
// Créer un ticket depuis Discord
app.post('/api/ticket/create', authMiddleware, async (req, res) => {
    try {
        const { userId, username, subject, message } = req.body;
        const ticketId = await (0, discordActions_js_1.createTicketFromDiscord)(userId, username, subject, message);
        res.json({ success: true, ticketId });
    }
    catch (error) {
        console.error('Error creating ticket:', error);
        res.status(500).json({ error: 'Failed to create ticket' });
    }
});
// Répondre à un ticket depuis le panel admin
app.post('/api/ticket/reply', authMiddleware, async (req, res) => {
    try {
        const { ticketId, message, adminName } = req.body;
        await (0, discordActions_js_1.replyToTicket)(ticketId, message, adminName);
        res.json({ success: true });
    }
    catch (error) {
        console.error('Error replying to ticket:', error);
        res.status(500).json({ error: 'Failed to reply to ticket' });
    }
});
// Récupérer les infos du bot
app.get('/api/status', (req, res) => {
    res.json({
        status: client_js_1.client.isReady() ? 'online' : 'offline',
        guilds: client_js_1.client.guilds.cache.size,
        users: client_js_1.client.users.cache.size,
    });
});
function startApiServer(port) {
    app.listen(port, () => {
        console.log(`🌐 API server listening on port ${port}`);
    });
}
//# sourceMappingURL=server.js.map