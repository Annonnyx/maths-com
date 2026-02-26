import { Events, Message, ChannelType } from 'discord.js';
import { config } from '../config.js';

export default {
  name: Events.MessageCreate,
  async execute(message: Message) {
    // Ignorer les messages des bots
    if (message.author.bot) return;
    
    // Gestion des tickets - Si le message est dans un salon de ticket
    if (message.channel.type === ChannelType.GuildText) {
      const channel = message.channel;
      
      // Vérifier si c'est un salon de ticket (commence par "ticket-")
      if (channel.name.startsWith('ticket-')) {
        // Envoyer le message au panel admin via l'API
        await forwardTicketMessageToPanel(message);
      }
    }
    
    // Auto-modération simple (optionnel)
    // await autoModerate(message);
  }
};

// Forward un message de ticket au panel admin
async function forwardTicketMessageToPanel(message: Message) {
  try {
    // Appeler l'API du site pour notifier du nouveau message
    // TODO: Implement actual API call
    // await fetch(`${config.website.apiUrl}/discord/ticket-message`, {
    //   method: 'POST',
    //   headers: { 'Authorization': `Bearer ${config.api.secret}` },
    //   body: JSON.stringify({
    //     ticketChannelId: message.channel.id,
    //     authorId: message.author.id,
    //     authorUsername: message.author.username,
    //     content: message.content,
    //     timestamp: message.createdAt.toISOString()
    //   })
    // });
    
    console.log(`🎫 Nouveau message de ticket: ${message.channel.id} - ${message.author.username}`);
  } catch (error) {
    console.error('❌ Erreur forward ticket message:', error);
  }
}

// Auto-modération (optionnel)
async function autoModerate(message: Message) {
  const bannedWords = ['spam', 'insulte']; // À configurer
  const content = message.content.toLowerCase();
  
  for (const word of bannedWords) {
    if (content.includes(word)) {
      await message.delete();
      if (message.channel.isTextBased()) {
        await (message.channel as any).send(`${message.author} ⚠️ Votre message a été supprimé pour non-respect des règles.`);
      }
      break;
    }
  }
}
