import { Events, Interaction } from 'discord.js';

export default {
  name: Events.InteractionCreate,
  async execute(interaction: Interaction) {
    if (!interaction.isChatInputCommand()) return;
    
    const command = interaction.client.commands.get(interaction.commandName);
    
    if (!command) {
      console.error(`❌ Commande non trouvée: ${interaction.commandName}`);
      return;
    }
    
    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(`❌ Erreur commande ${interaction.commandName}:`, error);
      
      const errorMessage = { 
        content: '❌ Une erreur est survenue lors de l\'exécution de cette commande.',
        ephemeral: true 
      };
      
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(errorMessage);
      } else {
        await interaction.reply(errorMessage);
      }
    }
  }
};
