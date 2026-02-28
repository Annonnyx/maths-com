import { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import { config, COLORS } from '../config.js';
export default {
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Ouvrir un ticket de support'),
    async execute(interaction) {
        // Vérifier si l'utilisateur a déjà un ticket ouvert
        const existingTicket = interaction.guild?.channels.cache.find(channel => channel.type === ChannelType.GuildText &&
            channel.parentId === config.channels.ticketCategory &&
            channel.topic?.includes(interaction.user.id));
        if (existingTicket) {
            return interaction.reply({
                content: '❌ Vous avez déjà un ticket ouvert !',
                ephemeral: true
            });
        }
        // Créer le modal pour choisir le motif
        const modal = new ModalBuilder()
            .setCustomId(`ticket_modal_${interaction.user.id}`)
            .setTitle('🎫 Ouvrir un ticket');
        const subjectInput = new TextInputBuilder()
            .setCustomId('ticket_subject')
            .setLabel('Sujet du ticket')
            .setPlaceholder('Ex: Problème de connexion, Bug, Suggestion...')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(100);
        const descriptionInput = new TextInputBuilder()
            .setCustomId('ticket_description')
            .setLabel('Description détaillée')
            .setPlaceholder('Décrivez votre problème en détail...')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(1000);
        modal.addComponents(new ActionRowBuilder().addComponents(subjectInput), new ActionRowBuilder().addComponents(descriptionInput));
        await interaction.showModal(modal);
    }
};
// Gérer la soumission du modal
export async function handleTicketModal(interaction) {
    const subject = interaction.fields.getTextInputValue('ticket_subject');
    const description = interaction.fields.getTextInputValue('ticket_description');
    const userId = interaction.user.id;
    try {
        // Créer le salon de ticket
        const ticketChannel = await interaction.guild?.channels.create({
            name: `ticket-${interaction.user.username}`,
            type: ChannelType.GuildText,
            parent: config.channels.ticketCategory,
            topic: `Ticket de ${interaction.user.tag} (${userId})`,
            permissionOverwrites: [
                {
                    id: interaction.guild.id,
                    deny: [PermissionFlagsBits.ViewChannel],
                },
                {
                    id: userId,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory,
                        PermissionFlagsBits.AttachFiles,
                    ],
                },
                {
                    id: config.roles.support,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory,
                        PermissionFlagsBits.AttachFiles,
                        PermissionFlagsBits.ManageChannels,
                    ],
                },
            ],
        });
        if (!ticketChannel) {
            throw new Error('Impossible de créer le salon de ticket');
        }
        // Embed de présentation du ticket
        const ticketEmbed = new EmbedBuilder()
            .setTitle(`🎫 Ticket #${ticketChannel.name.split('-')[1]}`)
            .setColor(COLORS.info)
            .addFields({ name: '👤 Utilisateur', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true }, { name: '📅 Date', value: new Date().toLocaleDateString('fr-FR'), inline: true }, { name: '🏷️ Sujet', value: subject, inline: false })
            .setDescription(description)
            .setFooter({ text: 'Utilisez les boutons ci-dessous pour gérer ce ticket' });
        // Boutons d'action pour le support
        const actionRow = new ActionRowBuilder().addComponents(new ButtonBuilder()
            .setCustomId(`ticket_close_${userId}`)
            .setLabel('🔒 Fermer le ticket')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('🔒'), new ButtonBuilder()
            .setCustomId(`ticket_claim_${userId}`)
            .setLabel('✋ Prendre en charge')
            .setStyle(ButtonStyle.Success)
            .setEmoji('✋'));
        // Envoyer l'embed dans le salon du ticket
        await ticketChannel.send({
            content: `👋 Bonjour ${interaction.user} !\n\n📌 **Rôle Support pingué**`,
            embeds: [ticketEmbed],
            components: [actionRow]
        });
        // Notifier le rôle support
        await ticketChannel.send(`<@&${config.roles.support}> Nouveau ticket !`);
        // Log dans le salon des logs
        const logEmbed = new EmbedBuilder()
            .setTitle('🎫 Nouveau ticket créé')
            .setColor(COLORS.success)
            .addFields({ name: '👤 Utilisateur', value: `${interaction.user.tag}`, inline: true }, { name: '📝 Sujet', value: subject, inline: true }, { name: '🔗 Salon', value: `${ticketChannel}`, inline: false })
            .setDescription(description.substring(0, 200) + (description.length > 200 ? '...' : ''))
            .setTimestamp();
        const logChannel = interaction.guild?.channels.cache.get(config.channels.ticketLog);
        if (logChannel && logChannel.isTextBased()) {
            await logChannel.send({ embeds: [logEmbed] });
        }
        // Confirmer à l'utilisateur
        await interaction.reply({
            content: `✅ Votre ticket a été créé : ${ticketChannel}`,
            ephemeral: true
        });
    }
    catch (error) {
        console.error('❌ Erreur création ticket:', error);
        await interaction.reply({
            content: '❌ Une erreur est survenue lors de la création du ticket.',
            ephemeral: true
        });
    }
}
// Gérer la fermeture du ticket
export async function handleTicketClose(interaction, ticketUserId) {
    try {
        const channel = interaction.channel;
        if (!channel || !channel.isTextBased()) {
            throw new Error('Salon invalide');
        }
        // Demander la raison de fermeture
        const modal = new ModalBuilder()
            .setCustomId(`close_ticket_modal_${ticketUserId}`)
            .setTitle('🔒 Fermer le ticket');
        const reasonInput = new TextInputBuilder()
            .setCustomId('close_reason')
            .setLabel('Raison de la fermeture')
            .setPlaceholder('Pourquoi fermez-vous ce ticket ?')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(500);
        modal.addComponents(new ActionRowBuilder().addComponents(reasonInput));
        await interaction.showModal(modal);
    }
    catch (error) {
        console.error('❌ Erreur fermeture ticket:', error);
    }
}
// Confirmer la fermeture du ticket
export async function confirmTicketClose(interaction, ticketUserId) {
    const reason = interaction.fields.getTextInputValue('close_reason');
    const channel = interaction.channel;
    try {
        if (!channel || !channel.isTextBased()) {
            throw new Error('Salon invalide');
        }
        // Embed de fermeture
        const closeEmbed = new EmbedBuilder()
            .setTitle('🔒 Ticket fermé')
            .setColor(COLORS.error)
            .addFields({ name: '👤 Fermé par', value: `${interaction.user.tag}`, inline: true }, { name: '📅 Date', value: new Date().toLocaleDateString('fr-FR'), inline: true }, { name: '📝 Raison', value: reason, inline: false })
            .setTimestamp();
        // Envoyer l'embed de fermeture dans le salon du ticket
        await channel.send({ embeds: [closeEmbed] });
        // Log dans le salon des logs
        const logEmbed = new EmbedBuilder()
            .setTitle('🔒 Ticket fermé')
            .setColor(COLORS.warning)
            .addFields({ name: '👤 Fermé par', value: `${interaction.user.tag}`, inline: true }, { name: '📝 Raison', value: reason, inline: false }, { name: '🔗 Salon', value: `${channel}`, inline: true })
            .setTimestamp();
        const logChannel = interaction.guild?.channels.cache.get(config.channels.ticketLog);
        if (logChannel && logChannel.isTextBased()) {
            await logChannel.send({ embeds: [logEmbed] });
        }
        // Supprimer les permissions d'écriture pour tout le monde
        await channel.permissionOverwrites.edit(interaction.guild.id, {
            SendMessages: false,
        });
        await interaction.reply({
            content: '✅ Ticket fermé avec succès !',
            ephemeral: true
        });
        // Supprimer le salon après 5 minutes
        setTimeout(async () => {
            try {
                await channel.delete('Ticket fermé automatiquement');
            }
            catch (error) {
                console.error('❌ Erreur suppression salon ticket:', error);
            }
        }, 5 * 60 * 1000);
    }
    catch (error) {
        console.error('❌ Erreur confirmation fermeture ticket:', error);
    }
}
