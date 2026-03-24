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
                // Vérifier si l'interaction a déjà été répondue
                if (interaction.replied || interaction.deferred) {
                    try {
                        await interaction.followUp({
                            content: '❌ Une erreur est survenue lors de l\'exécution de cette commande.',
                            ephemeral: true
                        });
                    }
                    catch (followUpError) {
                        console.error('❌ Erreur followUp:', followUpError);
                        // Si même le followUp échoue, on ne peut rien faire de plus
                    }
                }
                else {
                    try {
                        await interaction.reply({
                            content: '❌ Une erreur est survenue lors de l\'exécution de cette commande.',
                            ephemeral: true
                        });
                    }
                    catch (replyError) {
                        console.error('❌ Erreur reply:', replyError);
                    }
                }
            }
        }
        else {
            // Gérer les autres types d'interactions (tickets, etc.)
            try {
                await (0, ticketInteractions_js_1.handleTicketInteractions)(interaction);
            }
            catch (error) {
                console.error('❌ Erreur interaction tickets:', error);
            }
        }
    }
};
