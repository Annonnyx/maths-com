import { Client, GatewayIntentBits, Collection } from 'discord.js';
// Création du client Discord avec les intents nécessaires
export const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
    ],
});
// Collection pour stocker les commandes
client.commands = new Collection();
// Événement d'erreur
client.on('error', (error) => {
    console.error('❌ Erreur Discord:', error);
});
client.on('warn', (warning) => {
    console.warn('⚠️ Warning Discord:', warning);
});
