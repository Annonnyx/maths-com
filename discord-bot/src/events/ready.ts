import { Events, Client, ActivityType, EmbedBuilder } from 'discord.js';
import { config } from '../config.js';
import { ensureClassRolesExist } from '../handlers/roleManager.js';
import { KeepAliveService } from '../utils/keepAlive.js';

export default {
  name: Events.ClientReady,
  once: true,
  async execute(client: Client) {
    console.log(`✅ Bot connecté en tant que ${client.user?.tag}`);
    console.log(`🌐 Connecté à ${client.guilds.cache.size} serveurs`);
    console.log(`👥 ${client.users.cache.size} utilisateurs en cache`);
    
    // Démarrer le keep-alive pour éviter la mise en veille
    const keepAlive = new KeepAliveService(client);
    
    // Status du bot avec activités variées
    const activities = [
      { name: 'maths-app.com', type: ActivityType.Playing },
      { name: `🏆 ${Math.floor(Math.random() * 1000)} joueurs`, type: ActivityType.Watching },
      { name: '📚 aider les élèves', type: ActivityType.Playing }
    ];
    
    const randomActivity = activities[Math.floor(Math.random() * activities.length)];
    
    client.user?.setPresence({
      activities: [randomActivity],
      status: 'online'
    });
    
    // Message de démarrage détaillé
    const startEmbed = new EmbedBuilder()
      .setTitle('🤖 Bot Discord - Maths-Com')
      .setColor('#00FF00')
      .setThumbnail(client.user?.displayAvatarURL() || null)
      .addFields(
        { 
          name: '🆔 Bot', 
          value: `**Tag:** ${client.user?.tag}\n**ID:** ${client.user?.id}`, 
          inline: true 
        },
        { 
          name: '🌐 Serveurs', 
          value: `**Serveurs:** ${client.guilds.cache.size}\n**Utilisateurs:** ${client.users.cache.size}`, 
          inline: true 
        },
        { 
          name: '⚙️ Fonctionnalités', 
          value: '🎫 Tickets\n🏆 Classements\n👑 Rôles\n🔄 Auto-update', 
          inline: true 
        },
        { 
          name: '📊 Système', 
          value: `**Mémoire:** ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB\n**Uptime:** ${Math.floor(process.uptime() / 60)}min`, 
          inline: true 
        }
      )
      .setFooter({ 
        text: 'Bot opérationnel 24/7 avec monitoring automatique', 
        iconURL: client.user?.displayAvatarURL() 
      })
      .setTimestamp();

    try {
      const generalChannel = await client.channels.fetch(config.channels.general).catch(() => null);
      if (generalChannel && 'send' in generalChannel) {
        await generalChannel.send({ embeds: [startEmbed] });
        console.log('📢 Message de démarrage envoyé');
      }
    } catch (error: any) {
      console.log('⚠️ Salon général non accessible:', error?.message || error);
    }
    
    // Vérifier/créer les rôles de classe
    try {
      const guild = await client.guilds.fetch(config.discord.guildId);
      await ensureClassRolesExist(guild);
      console.log('✅ Rôles de classe vérifiés');
    } catch (error: any) {
      console.error('❌ Erreur vérification rôles:', error?.message || error);
    }
    
    // Test de connectivité API
    try {
      const response = await fetch(`${config.website.apiUrl}/users`, {
        method: 'GET',
        headers: { 'User-Agent': 'Discord-Bot-Health-Check' }
      });
      
      if (response.ok) {
        console.log('✅ Connexion API site réussie');
      } else {
        console.warn(`⚠️ API site status: ${response.status}`);
      }
    } catch (error: any) {
      console.error('❌ Connexion API site échouée:', error?.message || error);
    }

    // Vérification des salons essentiels
    const essentialChannels = [
      { name: 'Classement Solo', id: config.channels.leaderboardSolo },
      { name: 'Classement Multi', id: config.channels.leaderboardMulti },
      { name: 'Tickets', id: config.channels.ticketCategory }
    ];

    console.log('🔍 Vérification salons essentiels...');
    for (const channel of essentialChannels) {
      try {
        const ch = await client.channels.fetch(channel.id);
        console.log(ch ? `✅ ${channel.name}: OK` : `⚠️ ${channel.name}: Non trouvé`);
      } catch (error: any) {
        console.error(`❌ ${channel.name}: ${error?.message || error}`);
      }
    }
    
    console.log('🎯 Bot pleinement opérationnel et monitoré !');
  }
};
