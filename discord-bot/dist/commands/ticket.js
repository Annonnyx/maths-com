"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
exports.default = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('ticket-simple')
        .setDescription('Créer un ticket de support simple'),
    async execute(interaction) {
        // Créer un modal pour le sujet et le message
        const modal = new discord_js_1.ModalBuilder()
            .setCustomId('ticket_modal')
            .setTitle('🎫 Créer un ticket');
        const subjectInput = new discord_js_1.TextInputBuilder()
            .setCustomId('ticket_subject')
            .setLabel('Sujet')
            .setStyle(discord_js_1.TextInputStyle.Short)
            .setPlaceholder('Ex: Problème avec mon classement')
            .setRequired(true)
            .setMaxLength(100);
        const messageInput = new discord_js_1.TextInputBuilder()
            .setCustomId('ticket_message')
            .setLabel('Description')
            .setStyle(discord_js_1.TextInputStyle.Paragraph)
            .setPlaceholder('Décrivez votre problème en détail...')
            .setRequired(true)
            .setMaxLength(1000);
        const subjectRow = new discord_js_1.ActionRowBuilder().addComponents(subjectInput);
        const messageRow = new discord_js_1.ActionRowBuilder().addComponents(messageInput);
        modal.addComponents(subjectRow, messageRow);
        await interaction.showModal(modal);
    }
};
//# sourceMappingURL=ticket.js.map