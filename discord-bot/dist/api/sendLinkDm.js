"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendLinkDm = sendLinkDm;
const discord_js_1 = require("discord.js");
// Exporter la fonction pour l'importer dans server.ts
async function sendLinkDm(discordId, code, websiteUsername) {
    try {
        // Importer dynamiquement le client Discord pour éviter les problèmes de dépendances circulaires
        const { client } = await Promise.resolve().then(() => __importStar(require('../client.js')));
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
