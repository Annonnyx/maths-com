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
        
        // Gérer spécifiquement les erreurs d'interaction expirée
        if (error instanceof Error && 'code' in error && error.code === 10062) {
          console.log(`⚠️ Interaction ${interaction.commandName} expirée, ignoré...`);
          return; // Ne pas répondre à une interaction expirée
        }
        
        // Vérifier si l'interaction a déjà été répondue
        if (interaction.replied || interaction.deferred) {
          try {
            await interaction.followUp({ 
              content: '❌ Une erreur est survenue lors de l\'exécution de cette commande.',
              ephemeral: true 
            });
          } catch (followUpError) {
            if (followUpError instanceof Error && 'code' in followUpError && followUpError.code === 40060) {
              console.log('⚠️ Interaction déjà répondue, ignoré...');
            } else if (followUpError instanceof Error && 'code' in followUpError && followUpError.code !== 10062) {
              console.error('❌ Erreur followUp:', followUpError);
            }
          }
        } else {
          try {
            await interaction.reply({ 
              content: '❌ Une erreur est survenue lors de l\'exécution de cette commande.',
              ephemeral: true 
            });
          } catch (replyError) {
            if (replyError instanceof Error && 'code' in replyError && replyError.code === 40060) {
              console.log('⚠️ Interaction déjà répondue, ignoré...');
            } else if (replyError instanceof Error && 'code' in replyError && replyError.code !== 10062) {
              console.error('❌ Erreur reply:', replyError);
            }
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
