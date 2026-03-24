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
exports.createTicket = createTicket;
const discord_js_1 = require("discord.js");
const client_js_1 = require("../client.js");
const config_js_1 = require("../config.js");
async function createTicket(req) {
    try {
        const { ticketId, title, category, priority, description, userId, username } = req.body;
        // Vérifier le secret API
        if (req.headers.authorization !== `Bearer ${config_js_1.config.api.secret}`) {
            return { success: false, error: 'Non autorisé' };
        }
        // Récupérer le serveur et la catégorie des tickets
        const guild = client_js_1.client.guilds.cache.get(config_js_1.config.discord.guildId);
        if (!guild) {
            return { success: false, error: 'Serveur Discord non trouvé' };
        }
        const ticketCategory = guild.channels.cache.get(config_js_1.config.channels.ticketCategory);
        if (!ticketCategory) {
            return { success: false, error: 'Catégorie des tickets non trouvée' };
        }
        // Créer le channel pour le ticket
        const channelName = `ticket-${ticketId.slice(0, 8)}`; // Utiliser seulement les 8 premiers caractères
        const ticketChannel = await guild.channels.create({
            name: channelName,
            type: 0, // TextChannel
            parent: ticketCategory.id,
            permissionOverwrites: [
                {
                    id: guild.roles.everyone.id,
                    deny: [discord_js_1.PermissionFlagsBits.ViewChannel, discord_js_1.PermissionFlagsBits.SendMessages],
                },
                {
                    id: config_js_1.config.roles.support,
                    allow: [discord_js_1.PermissionFlagsBits.ViewChannel, discord_js_1.PermissionFlagsBits.SendMessages, discord_js_1.PermissionFlagsBits.ReadMessageHistory],
                },
                // Ajouter l'utilisateur qui a créé le ticket s'il est sur le serveur
                ...(userId ? [{
                        id: userId,
                        allow: [discord_js_1.PermissionFlagsBits.ViewChannel, discord_js_1.PermissionFlagsBits.SendMessages, discord_js_1.PermissionFlagsBits.ReadMessageHistory],
                    }] : [])
            ],
        });
        // Créer l'embed d'information du ticket
        const { EmbedBuilder } = await Promise.resolve().then(() => __importStar(require('discord.js')));
        const ticketEmbed = new EmbedBuilder()
            .setTitle('🎫 Nouveau ticket de support')
            .setColor(0x6366f1) // Indigo
            .addFields({
            name: '📋 Informations du ticket',
            value: `**ID:** ${ticketId}\n**Titre:** ${title}\n**Catégorie:** ${category}\n**Priorité:** ${priority}`,
            inline: false
        }, {
            name: '👤 Utilisateur',
            value: `${username} (ID: ${userId})`,
            inline: true
        }, {
            name: '⏰ Créé le',
            value: new Date().toLocaleString('fr-FR'),
            inline: true
        })
            .setDescription(`**Description:**\n${description}`)
            .setFooter({ text: 'Maths-App.com • Support' })
            .setTimestamp();
        // Envoyer l'embed dans le channel
        if (ticketChannel.isTextBased()) {
            await ticketChannel.send({ embeds: [ticketEmbed] });
        }
        // Notifier le canal général qu'un nouveau ticket a été créé
        const generalChannel = guild.channels.cache.get(config_js_1.config.channels.general);
        if (generalChannel && generalChannel.isTextBased()) {
            const notificationEmbed = new EmbedBuilder()
                .setTitle('🎫 Nouveau ticket créé')
                .setDescription(`Un nouveau ticket a été créé par ${username}`)
                .addFields({ name: 'Titre', value: title, inline: true }, { name: 'Catégorie', value: category, inline: true }, { name: 'Channel', value: `<#${ticketChannel.name}>`, inline: true })
                .setColor(0x22c55e) // Green
                .setFooter({ text: 'Maths-App.com • Support' })
                .setTimestamp();
            await generalChannel.send({ embeds: [notificationEmbed] });
        }
        return {
            success: true,
            channelId: ticketChannel.id,
            channelName: ticketChannel.name
        };
    }
    catch (error) {
        console.error('Error creating ticket channel:', error);
        return { success: false, error: 'Erreur lors de la création du channel' };
    }
}
