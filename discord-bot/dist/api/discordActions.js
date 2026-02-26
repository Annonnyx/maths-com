"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessageToChannel = sendMessageToChannel;
exports.publishLeaderboard = publishLeaderboard;
exports.createTicketFromDiscord = createTicketFromDiscord;
exports.replyToTicket = replyToTicket;
const discord_js_1 = require("discord.js");
const client_js_1 = require("../client.js");
const config_js_1 = require("../config.js");
// Envoyer un message dans un salon
async function sendMessageToChannel(channelId, content, embeds) {
    const channel = await client_js_1.client.channels.fetch(channelId);
    if (!channel || channel.type !== discord_js_1.ChannelType.GuildText) {
        throw new Error('Channel not found or not a text channel');
    }
    const textChannel = channel;
    const message = await textChannel.send({
        content,
        embeds: embeds?.map(e => discord_js_1.EmbedBuilder.from(e))
    });
    return message.id;
}
// Publier le classement
async function publishLeaderboard(type = 'solo') {
    const channelId = type === 'solo' ? config_js_1.config.channels.leaderboardSolo : config_js_1.config.channels.leaderboardMulti;
    const channel = await client_js_1.client.channels.fetch(channelId);
    if (!channel || channel.type !== discord_js_1.ChannelType.GuildText) {
        throw new Error('Leaderboard channel not found');
    }
    const textChannel = channel;
    // Ici on ferait un appel API au site pour récupérer le classement
    // Pour l'instant, template d'embed
    const embed = new discord_js_1.EmbedBuilder()
        .setTitle(`🏆 Classement ${type === 'solo' ? 'Solo' : 'Multijoueur'} Mensuel`)
        .setColor(type === 'solo' ? config_js_1.COLORS.gold : config_js_1.COLORS.silver)
        .setDescription('Les meilleurs joueurs du mois !')
        .setTimestamp()
        .setFooter({ text: 'Maths-App.com' });
    // TODO: Récupérer les données depuis l'API du site
    // const leaderboard = await fetch(`${config.website.apiUrl}/leaderboard?type=${type}`);
    // Template des 10 premiers
    const mockData = [
        { rank: 1, name: '👑 Champion', elo: 2500 },
        { rank: 2, name: '🥈 Second', elo: 2350 },
        { rank: 3, name: '🥉 Troisième', elo: 2200 },
    ];
    mockData.forEach((player, index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `\`${player.rank}.\``;
        embed.addFields({
            name: `${medal} ${player.name}`,
            value: `ELO: **${player.elo}**`,
            inline: true
        });
    });
    await textChannel.send({ embeds: [embed] });
}
// Créer un ticket depuis Discord
async function createTicketFromDiscord(userId, username, subject, message) {
    // Récupérer la catégorie des tickets
    const guild = await client_js_1.client.guilds.fetch(config_js_1.config.discord.guildId);
    const category = await guild.channels.fetch(config_js_1.config.channels.ticketCategory);
    if (!category) {
        throw new Error('Ticket category not found');
    }
    // Créer un salon privé pour le ticket
    const ticketChannel = await guild.channels.create({
        name: `ticket-${username.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        type: discord_js_1.ChannelType.GuildText,
        parent: config_js_1.config.channels.ticketCategory,
        permissionOverwrites: [
            {
                id: guild.id,
                deny: ['ViewChannel']
            },
            {
                id: userId,
                allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory']
            }
        ]
    });
    // Envoyer le message initial
    const embed = new discord_js_1.EmbedBuilder()
        .setTitle(`🎫 Ticket: ${subject}`)
        .setDescription(message)
        .setColor(config_js_1.COLORS.info)
        .setTimestamp()
        .addFields({ name: 'Utilisateur', value: `<@${userId}> (${username})`, inline: true }, { name: 'Status', value: '🟢 Ouvert', inline: true });
    await ticketChannel.send({
        content: `<@${userId}> Bienvenue dans votre ticket ! Un administrateur va vous répondre bientôt.`,
        embeds: [embed]
    });
    return ticketChannel.id;
}
// Répondre à un ticket depuis le panel admin
async function replyToTicket(ticketId, message, adminName) {
    const channel = await client_js_1.client.channels.fetch(ticketId);
    if (!channel || channel.type !== discord_js_1.ChannelType.GuildText) {
        throw new Error('Ticket channel not found');
    }
    const textChannel = channel;
    const embed = new discord_js_1.EmbedBuilder()
        .setTitle('📨 Réponse de l\'administration')
        .setDescription(message)
        .setColor(config_js_1.COLORS.success)
        .setTimestamp()
        .setFooter({ text: `Répondu par ${adminName}` });
    await textChannel.send({ embeds: [embed] });
}
//# sourceMappingURL=discordActions.js.map