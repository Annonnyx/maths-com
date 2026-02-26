import { Interaction } from 'discord.js';
import { handleTicketModal, handleTicketClose, confirmTicketClose } from '../commands/ticket-enhanced.js';

export default {
  name: 'interactionCreate',
  async execute(interaction: Interaction) {
    // Gérer la soumission des modals de ticket
    if (interaction.isModalSubmit()) {
      if (interaction.customId.startsWith('ticket_modal_')) {
        await handleTicketModal(interaction);
      } else if (interaction.customId.startsWith('close_ticket_modal_')) {
        const ticketUserId = interaction.customId.split('_').pop();
        if (ticketUserId) {
          await confirmTicketClose(interaction, ticketUserId);
        }
      }
    }
    
    // Gérer les clics sur les boutons de ticket
    if (interaction.isButton()) {
      if (interaction.customId.startsWith('ticket_close_')) {
        const ticketUserId = interaction.customId.split('_').pop();
        if (ticketUserId) {
          await handleTicketClose(interaction, ticketUserId);
        }
      }
      // Ajouter d'autres handlers de boutons ici si nécessaire
    }
  }
};
