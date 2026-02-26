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
const link_js_1 = require("../commands/link.js");
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
// Vérifier un code de liaison
app.post('/api/verify-link', authMiddleware, async (req, res) => {
    try {
        const { code, userId, username } = req.body;
        if (!code) {
            return res.status(400).json({ error: 'Code required' });
        }
        const result = (0, link_js_1.verifyLinkCode)(code);
        if (result.valid) {
            // Envoyer un DM de confirmation à l'utilisateur Discord
            try {
                const discordUser = await client_js_1.client.users.fetch(result.discordId);
                await discordUser.send({
                    content: `✅ Votre compte Discord a été lié avec succès à **${username}** sur Maths-App.com !\n\nVous allez maintenant recevoir les rôles automatiques selon vos badges et progression.`
                });
            }
            catch (dmError) {
                console.log('Could not send DM to user');
            }
        }
        res.json(result);
    }
    catch (error) {
        console.error('Error verifying link code:', error);
        res.status(500).json({ error: 'Failed to verify code' });
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