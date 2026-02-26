"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const config_js_1 = require("../config.js");
// TODO: Connect to actual database/API
async function getUserStats(discordId) {
    // Simuler une réponse pour l'instant
    // En production: appeler l'API du site
    return {
        username: 'MathMaster',
        elo: 1850,
        rankClass: '3e',
        rank: 42,
        bestElo: 2100,
        multiplayerElo: 1650,
        multiplayerRank: 78,
        totalTests: 156,
        winRate: 73,
        badges: ['streak_7', 'elo_1500', 'perfect_score']
    };
}
exports.default = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('rank')
        .setDescription('Afficher votre classement ou celui d\'un autre joueur')
        .addUserOption(option => option
        .setName('utilisateur')
        .setDescription('Joueur à consulter (optionnel)')
        .setRequired(false)),
    async execute(interaction) {
        await interaction.deferReply();
        const targetUser = interaction.options.getUser('utilisateur') || interaction.user;
        try {
            // Récupérer les stats (en production: depuis l'API)
            const stats = await getUserStats(targetUser.id);
            const embed = new discord_js_1.EmbedBuilder()
                .setTitle(`📊 Profil de ${stats.username}`)
                .setThumbnail(targetUser.displayAvatarURL({ size: 256 }))
                .setColor(config_js_1.COLORS.primary)
                .addFields({
                name: '🎮 Solo',
                value: `**ELO:** ${stats.elo}\n**Rang:** #${stats.rank}\n**Classe:** ${stats.rankClass.toUpperCase()}`,
                inline: true
            }, {
                name: '⚔️ Multijoueur',
                value: `**ELO:** ${stats.multiplayerElo}\n**Rang:** #${stats.multiplayerRank}`,
                inline: true
            }, {
                name: '🏆 Records',
                value: `**Meilleur ELO:** ${stats.bestElo}\n**Tests:** ${stats.totalTests}\n**Winrate:** ${stats.winRate}%`,
                inline: true
            })
                .setFooter({ text: 'Maths-App.com' })
                .setTimestamp();
            // Ajouter les badges si présents
            if (stats.badges && stats.badges.length > 0) {
                const badgeEmojis = {
                    'streak_7': '🔥',
                    'streak_30': '🔥🔥',
                    'streak_100': '🔥🔥🔥',
                    'elo_1000': '📈',
                    'elo_1500': '📈📈',
                    'elo_2000': '📈📈📈',
                    'perfect_score': '💯',
                    'top_10': '🏆',
                    'top_1': '👑'
                };
                const badgeList = stats.badges.map(b => badgeEmojis[b] || '🏅').join(' ');
                embed.addFields({
                    name: '🎖️ Badges',
                    value: badgeList || 'Aucun badge',
                    inline: false
                });
            }
            // Lien vers le profil
            embed.addFields({
                name: '🔗 Lien',
                value: `[Voir le profil complet](https://maths-app.com/profile/${stats.username})`,
                inline: false
            });
            await interaction.editReply({ embeds: [embed] });
        }
        catch (error) {
            console.error('Error fetching rank:', error);
            await interaction.editReply({
                content: targetUser.id === interaction.user.id
                    ? '❌ Vous n\'avez pas encore lié votre compte Maths-App. Utilisez `/link` pour commencer !'
                    : '❌ Cet utilisateur n\'a pas encore lié son compte Maths-App.'
            });
        }
    }
};
//# sourceMappingURL=rank.js.map