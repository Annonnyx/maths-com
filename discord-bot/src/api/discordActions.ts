import { TextChannel, EmbedBuilder, ChannelType } from 'discord.js';
import { client } from '../client.js';
import { config, COLORS } from '../config.js';

// Envoyer un message dans un salon
export async function sendMessageToChannel(
  channelId: string, 
  content: string, 
  embeds?: any[]
): Promise<string | null> {
  const channel = await client.channels.fetch(channelId);
  
  if (!channel || channel.type !== ChannelType.GuildText) {
    throw new Error('Channel not found or not a text channel');
  }
  
  const textChannel = channel as TextChannel;
  const message = await textChannel.send({
    content,
    embeds: embeds?.map(e => EmbedBuilder.from(e))
  });
  
  return message.id;
}

// Publier le classement
export async function publishLeaderboard(type: 'solo' | 'multi' = 'solo') {
  const channelId = type === 'solo' ? config.channels.leaderboardSolo : config.channels.leaderboardMulti;
  const channel = await client.channels.fetch(channelId);
  
  if (!channel || channel.type !== ChannelType.GuildText) {
    throw new Error('Leaderboard channel not found');
  }
  
  const textChannel = channel as TextChannel;
  
  // Ici on ferait un appel API au site pour récupérer le classement
  // Pour l'instant, template d'embed
  const embed = new EmbedBuilder()
    .setTitle(`🏆 Classement ${type === 'solo' ? 'Solo' : 'Multijoueur'} Mensuel`)
    .setColor(type === 'solo' ? COLORS.gold : COLORS.silver)
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
export async function createTicketFromDiscord(
  userId: string,
  username: string,
  subject: string,
  message: string
): Promise<string> {
  // Récupérer la catégorie des tickets
  const guild = await client.guilds.fetch(config.discord.guildId);
  const category = await guild.channels.fetch(config.channels.ticketCategory);
  
  if (!category) {
    throw new Error('Ticket category not found');
  }
  
  // Créer un salon privé pour le ticket
  const ticketChannel = await guild.channels.create({
    name: `ticket-${username.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
    type: ChannelType.GuildText,
    parent: config.channels.ticketCategory,
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
  const embed = new EmbedBuilder()
    .setTitle(`🎫 Ticket: ${subject}`)
    .setDescription(message)
    .setColor(COLORS.info)
    .setTimestamp()
    .addFields(
      { name: 'Utilisateur', value: `<@${userId}> (${username})`, inline: true },
      { name: 'Status', value: '🟢 Ouvert', inline: true }
    );
  
  await ticketChannel.send({ 
    content: `<@${userId}> Bienvenue dans votre ticket ! Un administrateur va vous répondre bientôt.`,
    embeds: [embed] 
  });
  
  return ticketChannel.id;
}

// Répondre à un ticket depuis le panel admin
export async function replyToTicket(
  ticketId: string,
  message: string,
  adminName: string
) {
  const channel = await client.channels.fetch(ticketId);
  
  if (!channel || channel.type !== ChannelType.GuildText) {
    throw new Error('Ticket channel not found');
  }
  
  const textChannel = channel as TextChannel;
  
  const embed = new EmbedBuilder()
    .setTitle('📨 Réponse de l\'administration')
    .setDescription(message)
    .setColor(COLORS.success)
    .setTimestamp()
    .setFooter({ text: `Répondu par ${adminName}` });
  
  await textChannel.send({ embeds: [embed] });
}
