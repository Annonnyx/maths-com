"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const client_js_1 = require("../client.js");
// Import des handlers
const ticketInteractions_js_1 = require("./ticketInteractions.js");
exports.default = {
    name: discord_js_1.Events.InteractionCreate,
    async execute(interaction) {
        if (interaction.isChatInputCommand()) {
            const command = client_js_1.client.commands.get(interaction.commandName);
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
            // Gérer les autres types d'interactions (tickets, etc.)
            await (0, ticketInteractions_js_1.handleTicketInteractions)(interaction);
        }
    }
};
