import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { COLORS } from '../config.js';

// TODO: Connect to database to remove the link
async function unlinkDiscordAccount(discordId: string) {
  // En production: supprimer le lien dans la DB
  // await db.users.update({ discordId: null }, { where: { discordId } });
  return true;
}

export default {
  data: new SlashCommandBuilder()
    .setName('unlink')
    .setDescription('Délier votre compte Discord de Maths-App'),
  
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });
    
    try {
      // Vérifier si l'utilisateur est lié
      // TODO: Check in database
      const isLinked = true; // Mock
      
      if (!isLinked) {
        return interaction.editReply({
          content: '❌ Votre compte Discord n\'est pas lié à Maths-App.'
        });
      }
      
      // Délier le compte
      await unlinkDiscordAccount(interaction.user.id);
      
      const embed = new EmbedBuilder()
        .setTitle('🔗 Compte délié')
        .setDescription('Votre compte Discord a été délié de Maths-App.com avec succès.')
        .setColor(COLORS.warning)
        .addFields(
          { 
            name: 'Note', 
            value: 'Vous pouvez relier votre compte à tout moment avec la commande `/link`',
            inline: false 
          }
        )
        .setFooter({ text: 'Maths-App.com' })
        .setTimestamp();
      
      await interaction.editReply({ embeds: [embed] });
      
    } catch (error) {
      console.error('Error unlinking account:', error);
      await interaction.editReply({
        content: '❌ Une erreur est survenue lors du déliage de votre compte.'
      });
    }
  }
};
