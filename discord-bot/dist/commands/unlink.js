"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const config_js_1 = require("../config.js");
const supabase_js_1 = require("../utils/supabase.js");
const roles_js_1 = require("../utils/roles.js");
exports.default = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('unlink')
        .setDescription('Délier votre compte Discord de Maths-App'),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        try {
            const discordUserId = interaction.user.id;
            // Vérifier si l'utilisateur est lié
            const existingLink = await supabase_js_1.discordDb.getUserLink(discordUserId);
            if (!existingLink) {
                const embed = new discord_js_1.EmbedBuilder()
                    .setTitle('❌ Aucun compte lié')
                    .setDescription('Votre compte Discord n\'est pas lié à Maths-App.com.')
                    .addFields({ name: '🔗 Pour lier votre compte', value: 'Utilisez la commande `/link` pour générer un code de liaison.', inline: false })
                    .setColor(config_js_1.COLORS.warning)
                    .setFooter({ text: 'Maths-App.com' })
                    .setTimestamp();
                return interaction.editReply({ embeds: [embed] });
            }
            // Retirer tous les rôles Maths-App
            await (0, roles_js_1.removeAllMathsAppRoles)(discordUserId);
            // Désactiver la liaison dans la base de données
            await supabase_js_1.discordDb.deactivateUserLink(discordUserId);
            const embed = new discord_js_1.EmbedBuilder()
                .setTitle('🔗 Compte délié')
                .setDescription('Votre compte Discord a été délié de Maths-App.com avec succès.')
                .setColor(config_js_1.COLORS.success)
                .addFields({
                name: '📊 Actions effectuées',
                value: '• Suppression de la liaison dans la base de données\n• Retrait de tous les rôles Maths-App\n• Réinitialisation des permissions spéciales',
                inline: false
            }, { name: '🔄 Pour relier votre compte',
                value: 'Vous pouvez relier votre compte à tout moment avec la commande `/link`',
                inline: false
            })
                .setFooter({ text: 'Maths-App.com • Liaison supprimée' })
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
            // Optionnel: Envoyer un message de confirmation en DM
            try {
                const dmEmbed = new discord_js_1.EmbedBuilder()
                    .setTitle('🔔 Confirmation de déliaison')
                    .setDescription('Votre compte Discord a été délié de Maths-App.com.\n\nSi vous n\'êtes pas à l\'origine de cette action, veuillez sécuriser votre compte.')
                    .setColor(config_js_1.COLORS.warning)
                    .setFooter({ text: 'Maths-App.com • Sécurité' })
                    .setTimestamp();
                await interaction.user.send({ embeds: [dmEmbed] });
            }
            catch (dmError) {
                // Ignorer si les DM sont fermés
                console.log('Could not send DM confirmation (DMs closed)');
            }
        }
        catch (error) {
            console.error('Error unlinking account:', error);
            const errorEmbed = new discord_js_1.EmbedBuilder()
                .setTitle('❌ Erreur')
                .setDescription('Une erreur est survenue lors du déliage de votre compte.')
                .addFields({ name: 'Détails', value: 'Veuillez réessayer plus tard ou contacter un administrateur.', inline: false })
                .setColor(config_js_1.COLORS.error)
                .setFooter({ text: 'Maths-App.com' })
                .setTimestamp();
            await interaction.editReply({ embeds: [errorEmbed] });
        }
    }
};
