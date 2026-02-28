"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyLinkingCode = verifyLinkingCode;
exports.sendLinkDm = sendLinkDm;
exports.verifyLink = verifyLink;
const discord_js_1 = require("discord.js");
// Store temporaire pour les codes de liaison (en production, utiliser Redis)
const linkingCodes = new Map();
// Exporter la fonction pour l'importer dans server.ts
function verifyLinkingCode(discordId, code) {
    const now = new Date();
    for (const [key, data] of linkingCodes.entries()) {
        if (data.discordId === discordId &&
            data.code === code &&
            !data.used &&
            data.expiresAt > now) {
            data.used = true;
            linkingCodes.delete(key);
            return { userId: data.userId };
        }
    }
    return null;
}
// POST /api/send-link-dm - Envoyer un DM avec le code de vérification
async function sendLinkDm(discordId, code, websiteUsername) {
    try {
        // Importer dynamiquement le client Discord pour éviter les problèmes de dépendances circulaires
        const { client } = await import('../client.js');
        try {
            // Récupérer l'utilisateur Discord
            const user = await client.users.fetch(discordId);
            // Créer l'embed de vérification
            const verifyEmbed = new discord_js_1.EmbedBuilder()
                .setTitle('🔗 Vérification de compte Maths-Com')
                .setColor('#5865F2')
                .setDescription(`**Salut ${user.username} !**\n\nVous avez demandé à lier votre compte Discord avec votre profil Maths-Com.`)
                .addFields({
                name: '📝 Code de vérification',
                value: `\`\`\`${code}\`\`\``,
                inline: false
            }, {
                name: '⏰ Expire dans',
                value: '10 minutes',
                inline: true
            }, {
                name: '👤 Utilisateur site',
                value: websiteUsername,
                inline: true
            }, {
                name: '📋 Instructions',
                value: 'Envoyez ce code en message privé au bot pour finaliser la liaison.',
                inline: false
            })
                .setFooter({
                text: 'Maths-Com • Vérification automatique',
                iconURL: client.user?.displayAvatarURL()
            })
                .setTimestamp();
            // Envoyer le DM
            await user.send({ embeds: [verifyEmbed] });
            console.log(`📤 DM de vérification envoyé à ${user.tag} (${user.id}) - Code: ${code}`);
            return {
                success: true,
                message: `DM envoyé avec succès à ${user.username}`
            };
        }
        catch (discordError) {
            console.error('Erreur Discord DM:', discordError);
            if (discordError.code === 50007) {
                return {
                    success: false,
                    error: 'Impossible d\'envoyer un DM (MPs fermés ou utilisateur introuvable)'
                };
            }
            return {
                success: false,
                error: 'Erreur lors de l\'envoi du DM Discord'
            };
        }
    }
    catch (error) {
        console.error('Erreur sendLinkDm:', error);
        return {
            success: false,
            error: 'Erreur interne du serveur'
        };
    }
}
// POST /api/verify-link - Vérifier un code reçu via DM
async function verifyLink(request) {
    try {
        const { discordId, code, discordUsername } = request;
        if (!discordId || !code) {
            return {
                valid: false,
                error: 'Discord ID et code requis'
            };
        }
        const verification = verifyLinkingCode(discordId, code.toUpperCase());
        if (!verification) {
            return {
                valid: false,
                error: 'Code invalide ou expiré'
            };
        }
        return {
            valid: true,
            userId: verification.userId,
            discordId,
            discordUsername: discordUsername || 'Utilisateur Discord'
        };
    }
    catch (error) {
        console.error('Erreur vérification code:', error);
        return {
            valid: false,
            error: 'Erreur lors de la vérification'
        };
    }
}
//# sourceMappingURL=linkVerification.js.map