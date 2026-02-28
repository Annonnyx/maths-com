import { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';
export default {
    data: new SlashCommandBuilder()
        .setName('ticket-simple')
        .setDescription('Créer un ticket de support simple'),
    async execute(interaction) {
        // Créer un modal pour le sujet et le message
        const modal = new ModalBuilder()
            .setCustomId('ticket_modal')
            .setTitle('🎫 Créer un ticket');
        const subjectInput = new TextInputBuilder()
            .setCustomId('ticket_subject')
            .setLabel('Sujet')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Ex: Problème avec mon classement')
            .setRequired(true)
            .setMaxLength(100);
        const messageInput = new TextInputBuilder()
            .setCustomId('ticket_message')
            .setLabel('Description')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Décrivez votre problème en détail...')
            .setRequired(true)
            .setMaxLength(1000);
        const subjectRow = new ActionRowBuilder().addComponents(subjectInput);
        const messageRow = new ActionRowBuilder().addComponents(messageInput);
        modal.addComponents(subjectRow, messageRow);
        await interaction.showModal(modal);
    }
};
