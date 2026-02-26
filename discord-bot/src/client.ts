import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { config } from './config.js';

// Étendre le type Client pour ajouter la propriété commands
declare module 'discord.js' {
  interface Client {
    commands: Collection<string, any>;
  }
}

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
