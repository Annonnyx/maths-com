"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyLinkCode = verifyLinkCode;
const discord_js_1 = require("discord.js");
const config_js_1 = require("../config.js");
// Stockage temporaire des codes de liaison (en production: Redis ou DB)
const linkCodes = new Map();
exports.default = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('link')
        .setDescription('Lier votre compte Discord à Maths-App.com'),
    async execute(interaction) {
        // Générer un code unique de 6 caractères
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        // Stocker le code (expire dans 10 minutes)
        linkCodes.set(code, {
            userId: interaction.user.id,
            username: interaction.user.username,
            expires: Date.now() + 10 * 60 * 1000
        });
        // Nettoyer les codes expirés
        for (const [key, value] of linkCodes.entries()) {
            if (value.expires < Date.now()) {
                linkCodes.delete(key);
            }
        }
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle('🔗 Lier votre compte Discord')
            .setDescription(`**Code de liaison généré :**\n\n\`\`\`${code}\`\`\`\n\n**📋 Étapes à suivre :**\n1. Allez sur **[Maths-App.com](https://maths-app.com/profile)**\n2. Cliquez sur "Paramètres du profil"\n3. Trouvez la section "Lier compte Discord"\n4. Entrez le code : \`${code}\`\n5. Envoyez-moi ce code en message privé pour finaliser\n\n⏰ Ce code expire dans **10 minutes**.\n\n💡 Une fois lié, vous recevrez automatiquement vos rôles selon votre classe et votre classement !`)
            .setColor(config_js_1.COLORS.info)
            .setFooter({ text: 'Maths-App.com • Lien sécurisé' })
            .setTimestamp();
        // Envoyer en DM pour la sécurité
        try {
            await interaction.user.send({ embeds: [embed] });
            await interaction.reply({
                content: '✅ Je vous ai envoyé votre code de liaison en message privé !',
                ephemeral: true
            });
        }
        catch (error) {
            // Si les DM sont fermés, afficher dans le canal (mais éphémère)
            await interaction.reply({
                embeds: [embed],
                ephemeral: true
            });
        }
    }
};
// Fonction pour vérifier un code (utilisée par l'API du site)
function verifyLinkCode(code) {
    const data = linkCodes.get(code.toUpperCase());
    if (!data) {
        return { valid: false, error: 'Code invalide' };
    }
    if (data.expires < Date.now()) {
        linkCodes.delete(code.toUpperCase());
        return { valid: false, error: 'Code expiré' };
    }
    // Supprimer le code après utilisation
    linkCodes.delete(code.toUpperCase());
    return {
        valid: true,
        discordId: data.userId,
        discordUsername: data.username
    };
}
//# sourceMappingURL=link.js.map