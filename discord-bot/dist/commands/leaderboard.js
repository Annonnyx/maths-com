"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const config_js_1 = require("../config.js");
// TODO: Récupérer depuis l'API du site
async function getLeaderboard(type) {
    // Mock data pour l'instant
    return [
        { rank: 1, username: 'MathGenius', elo: 2850, winRate: 89 },
        { rank: 2, username: 'Calculatrice', elo: 2720, winRate: 85 },
        { rank: 3, username: 'PiMaster', elo: 2680, winRate: 82 },
        { rank: 4, username: 'AlgebraKing', elo: 2540, winRate: 79 },
        { rank: 5, username: 'GeometryQueen', elo: 2490, winRate: 77 },
        { rank: 6, username: 'FractionPro', elo: 2410, winRate: 75 },
        { rank: 7, username: 'NumberNinja', elo: 2380, winRate: 74 },
        { rank: 8, username: 'MathWizard', elo: 2320, winRate: 72 },
        { rank: 9, username: 'EquationExpert', elo: 2280, winRate: 70 },
        { rank: 10, username: 'TheoremTamer', elo: 2210, winRate: 68 },
    ];
}
exports.default = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Afficher le classement des meilleurs joueurs')
        .addStringOption(option => option
        .setName('type')
        .setDescription('Type de classement')
        .setRequired(false)
        .addChoices({ name: '🎮 Solo', value: 'solo' }, { name: '⚔️ Multijoueur', value: 'multi' })),
    async execute(interaction) {
        await interaction.deferReply();
        const type = interaction.options.getString('type') || 'solo';
        try {
            const leaderboard = await getLeaderboard(type);
            const embed = new discord_js_1.EmbedBuilder()
                .setTitle(`${type === 'solo' ? '🎮' : '⚔️'} Classement ${type === 'solo' ? 'Solo' : 'Multijoueur'}`)
                .setDescription('Les 10 meilleurs joueurs du mois')
                .setColor(type === 'solo' ? config_js_1.COLORS.gold : config_js_1.COLORS.silver)
                .setTimestamp()
                .setFooter({ text: 'Maths-App.com • Classement mensuel' });
            // Construire le classement
            let description = '';
            leaderboard.forEach((player, index) => {
                const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `\`${player.rank}.\``;
                const emoji = index < 3 ? '' : '⠀';
                description += `${medal}${emoji} **${player.username}** • ELO: \`${player.elo}\` • WR: \`${player.winRate}%\`\n`;
            });
            embed.setDescription(description);
            // Lien vers le site
            embed.addFields({
                name: '🔗 Voir plus',
                value: `[Classement complet sur Maths-App.com](https://maths-app.com/leaderboard?type=${type})`,
                inline: false
            });
            await interaction.editReply({ embeds: [embed] });
        }
        catch (error) {
            console.error('Error fetching leaderboard:', error);
            await interaction.editReply({
                content: '❌ Une erreur est survenue lors de la récupération du classement.'
            });
        }
    }
};
//# sourceMappingURL=leaderboard.js.map