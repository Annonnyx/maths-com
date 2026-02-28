import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS } from '../config.js';
import { supabase } from '../utils/supabase.js';

export default {
  data: new SlashCommandBuilder()
    .setName('close-ticket')
    .setDescription('Fermer un ticket de support (Admin only)'),
  
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });
    
    try {
      // Vérifier si l'utilisateur est admin
      const member = interaction.member;
      if (!member || !(member.permissions as any).has(PermissionFlagsBits.ManageChannels)) {
        const embed = new EmbedBuilder()
          .setTitle('❌ Permission refusée')
          .setDescription('Vous n\'avez pas la permission de fermer les tickets.')
          .setColor(COLORS.error)
          .setFooter({ text: 'Maths-App.com' })
          .setTimestamp();
        
        return interaction.editReply({ embeds: [embed] });
      }

      const channel = interaction.channel;
      
      // Vérifier si on est dans un channel de ticket
      if (!channel || !('name' in channel) || typeof (channel as any).name !== 'string') {
        const embed = new EmbedBuilder()
          .setTitle('❌ Channel invalide')
          .setDescription('Cette commande ne peut être utilisée que dans les channels de tickets.')
          .setColor(COLORS.error)
          .setFooter({ text: 'Maths-App.com' })
          .setTimestamp();
        
        return interaction.editReply({ embeds: [embed] });
      }

      if (!(channel as any).name.startsWith('ticket-')) {
        const embed = new EmbedBuilder()
          .setTitle('❌ Channel invalide')
          .setDescription('Cette commande ne peut être utilisée que dans les channels de tickets.')
          .setColor(COLORS.error)
          .setFooter({ text: 'Maths-App.com' })
          .setTimestamp();
        
        return interaction.editReply({ embeds: [embed] });
      }

      // Extraire l'ID du ticket du nom du channel
      const ticketId = (channel as any).name?.replace('ticket-', '') || '';
      
      // Mettre à jour le statut du ticket dans Supabase
      const { error: updateError } = await supabase
        .from('tickets')
        .update({ 
          status: 'résolu',
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId);

      if (updateError) {
        console.error('Error updating ticket status:', updateError);
        
        const embed = new EmbedBuilder()
          .setTitle('❌ Erreur')
          .setDescription('Impossible de mettre à jour le statut du ticket dans la base de données.')
          .setColor(COLORS.error)
          .setFooter({ text: 'Maths-App.com' })
          .setTimestamp();
        
        return interaction.editReply({ embeds: [embed] });
      }

      // Envoyer un message de confirmation dans le channel
      const confirmEmbed = new EmbedBuilder()
        .setTitle('✅ Ticket résolu')
        .setDescription(`Ce ticket a été marqué comme résolu par ${interaction.user.toString()}.`)
        .setColor(COLORS.success)
        .addFields(
          { name: '📋 Actions effectuées', value: '• Statut mis à "résolu"\n• Date de mise à jour enregistrée', inline: false },
          { name: '🔒 Channel', value: 'Ce channel sera archivé dans 24 heures.', inline: false }
        )
        .setFooter({ text: 'Maths-App.com • Support' })
        .setTimestamp();

      if ('send' in channel) {
        await (channel as any).send({ embeds: [confirmEmbed] });
      }

      // Répondre à l'interaction
      const replyEmbed = new EmbedBuilder()
        .setTitle('✅ Ticket fermé')
        .setDescription(`Le ticket ${(channel as any).name} a été marqué comme résolu avec succès.`)
        .setColor(COLORS.success)
        .addFields(
          { name: '🎫 ID du ticket', value: ticketId, inline: true },
          { name: '👤 Fermé par', value: interaction.user.username, inline: true },
          { name: '⏰ Heure', value: new Date().toLocaleTimeString('fr-FR'), inline: true }
        )
        .setFooter({ text: 'Maths-App.com' })
        .setTimestamp();

      await interaction.editReply({ embeds: [replyEmbed] });

      // Optionnel: Archiver le channel après un certain délai
      setTimeout(async () => {
        try {
          if ('setName' in channel && (channel as any).name) {
            await (channel as any).setName(`archivé-${(channel as any).name}`);
          }
        } catch (archiveError) {
          console.error('Error archiving channel:', archiveError);
        }
      }, 24 * 60 * 60 * 1000); // 24 heures

    } catch (error) {
      console.error('Error in close-ticket command:', error);
      const errorEmbed = new EmbedBuilder()
        .setTitle('❌ Erreur')
        .setDescription('Une erreur est survenue lors de la fermeture du ticket.')
        .setColor(COLORS.error)
        .setFooter({ text: 'Maths-App.com' })
        .setTimestamp();
      
      await interaction.editReply({ embeds: [errorEmbed] });
    }
  }
};
