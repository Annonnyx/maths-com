"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = void 0;
const discord_js_1 = require("discord.js");
// Création du client Discord avec les intents nécessaires
exports.client = new discord_js_1.Client({
    intents: [
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildMembers,
        discord_js_1.GatewayIntentBits.GuildMessages,
        discord_js_1.GatewayIntentBits.MessageContent,
        discord_js_1.GatewayIntentBits.GuildMessageReactions,
    ],
});
// Collection pour stocker les commandes
exports.client.commands = new discord_js_1.Collection();
// Événement d'erreur
exports.client.on('error', (error) => {
    console.error('❌ Erreur Discord:', error);
});
exports.client.on('warn', (warning) => {
    console.warn('⚠️ Warning Discord:', warning);
});
//# sourceMappingURL=client.js.map