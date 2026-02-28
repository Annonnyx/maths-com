import { TextChannel, CategoryChannel, PermissionFlagsBits } from 'discord.js';
import { client } from '../client.js';
import { config } from '../config.js';

export async function createTicket(req: any): Promise<{ success: boolean; channelId?: string; channelName?: string; error?: string }> {
  try {
    const { ticketId, title, category, priority, description, userId, username } = req.body;

    // Vérifier le secret API
    if (req.headers.authorization !== `Bearer ${config.api.secret}`) {
      return { success: false, error: 'Non autorisé' };
    }

    // Récupérer le serveur et la catégorie des tickets
    const guild = client.guilds.cache.get(config.discord.guildId);
    if (!guild) {
      return { success: false, error: 'Serveur Discord non trouvé' };
    }

    const ticketCategory = guild.channels.cache.get(config.channels.ticketCategory) as CategoryChannel;
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
          deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
        },
        {
          id: config.roles.support,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
        },
        // Ajouter l'utilisateur qui a créé le ticket s'il est sur le serveur
        ...(userId ? [{
          id: userId,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
        }] : [])
      ],
    });

    // Créer l'embed d'information du ticket
    const { EmbedBuilder } = await import('discord.js');
    const ticketEmbed = new EmbedBuilder()
      .setTitle('🎫 Nouveau ticket de support')
      .setColor(0x6366f1) // Indigo
      .addFields(
        { 
          name: '📋 Informations du ticket', 
          value: `**ID:** ${ticketId}\n**Titre:** ${title}\n**Catégorie:** ${category}\n**Priorité:** ${priority}`,
          inline: false 
        },
        { 
          name: '👤 Utilisateur', 
          value: `${username} (ID: ${userId})`,
          inline: true 
        },
        { 
          name: '⏰ Créé le', 
          value: new Date().toLocaleString('fr-FR'),
          inline: true 
        }
      )
      .setDescription(`**Description:**\n${description}`)
      .setFooter({ text: 'Maths-App.com • Support' })
      .setTimestamp();

    // Envoyer l'embed dans le channel
    if (ticketChannel.isTextBased()) {
      await ticketChannel.send({ embeds: [ticketEmbed] });
    }

    // Notifier le canal général qu'un nouveau ticket a été créé
    const generalChannel = guild.channels.cache.get(config.channels.general);
    if (generalChannel && generalChannel.isTextBased()) {
      const notificationEmbed = new EmbedBuilder()
        .setTitle('🎫 Nouveau ticket créé')
        .setDescription(`Un nouveau ticket a été créé par ${username}`)
        .addFields(
          { name: 'Titre', value: title, inline: true },
          { name: 'Catégorie', value: category, inline: true },
          { name: 'Channel', value: `<#${ticketChannel.name}>`, inline: true }
        )
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

  } catch (error) {
    console.error('Error creating ticket channel:', error);
    return { success: false, error: 'Erreur lors de la création du channel' };
  }
}
