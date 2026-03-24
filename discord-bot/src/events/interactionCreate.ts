import { Events, Interaction } from 'discord.js';
import { client } from '../client.js';

// Import des handlers
import { handleTicketInteractions } from './ticketInteractions.js';

export default {
  name: Events.InteractionCreate,
  async execute(interaction: Interaction) {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(`❌ Erreur commande ${interaction.commandName}:`, error);
        
        // Vérifier si l'interaction a déjà été répondue
        if (interaction.replied || interaction.deferred) {
          try {
            await interaction.followUp({ 
              content: '❌ Une erreur est survenue lors de l\'exécution de cette commande.',
              ephemeral: true 
            });
          } catch (followUpError) {
            console.error('❌ Erreur followUp:', followUpError);
            // Si même le followUp échoue, on ne peut rien faire de plus
          }
        } else {
          try {
            await interaction.reply({ 
              content: '❌ Une erreur est survenue lors de l\'exécution de cette commande.',
              ephemeral: true 
            });
          } catch (replyError) {
            console.error('❌ Erreur reply:', replyError);
          }
        }
      }
    } else {
      // Gérer les autres types d'interactions (tickets, etc.)
      try {
        await handleTicketInteractions(interaction);
      } catch (error) {
        console.error('❌ Erreur interaction tickets:', error);
      }
    }
  }
};
