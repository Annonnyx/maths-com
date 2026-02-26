"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ticket_enhanced_js_1 = require("../commands/ticket-enhanced.js");
exports.default = {
    name: 'interactionCreate',
    async execute(interaction) {
        // Gérer la soumission des modals de ticket
        if (interaction.isModalSubmit()) {
            if (interaction.customId.startsWith('ticket_modal_')) {
                await (0, ticket_enhanced_js_1.handleTicketModal)(interaction);
            }
            else if (interaction.customId.startsWith('close_ticket_modal_')) {
                const ticketUserId = interaction.customId.split('_').pop();
                if (ticketUserId) {
                    await (0, ticket_enhanced_js_1.confirmTicketClose)(interaction, ticketUserId);
                }
            }
        }
        // Gérer les clics sur les boutons de ticket
        if (interaction.isButton()) {
            if (interaction.customId.startsWith('ticket_close_')) {
                const ticketUserId = interaction.customId.split('_').pop();
                if (ticketUserId) {
                    await (0, ticket_enhanced_js_1.handleTicketClose)(interaction, ticketUserId);
                }
            }
            // Ajouter d'autres handlers de boutons ici si nécessaire
        }
    }
};
//# sourceMappingURL=ticketInteractions.js.map