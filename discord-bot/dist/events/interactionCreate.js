import { Events } from 'discord.js';
import { client } from '../client.js';
// Import des handlers
import ticketHandler from './ticketInteractions.js';
export default {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command)
                return;
            try {
                await command.execute(interaction);
            }
            catch (error) {
                console.error(`❌ Erreur commande ${interaction.commandName}:`, error);
                const errorMessage = {
                    content: '❌ Une erreur est survenue lors de l\'exécution de cette commande.',
                    ephemeral: true
                };
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp(errorMessage);
                }
                else {
                    await interaction.reply(errorMessage);
                }
            }
        }
        else {
            await handleTicketInteractions(interaction);
        }
    }
};
// Handler séparé pour les interactions de tickets
export async function handleTicketInteractions(interaction) {
    try {
        await ticketHandler.execute(interaction);
    }
    catch (error) {
        console.error('❌ Erreur interaction ticket:', error);
    }
}
