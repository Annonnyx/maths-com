import { Events, Client, ActivityType } from 'discord.js';
import { config } from '../config.js';
import { ensureClassRolesExist } from '../handlers/roleManager.js';

export default {
  name: Events.ClientReady,
  once: true,
  async execute(client: Client) {
    console.log(`✅ Bot connecté en tant que ${client.user?.tag}`);
    
    // Status du bot
    client.user?.setPresence({
      activities: [{ 
        name: 'maths-app.com', 
        type: ActivityType.Playing 
      }],
      status: 'online'
    });
    
    // Vérifier/créer les rôles de classe
    try {
      const guild = await client.guilds.fetch(config.discord.guildId);
      await ensureClassRolesExist(guild);
      console.log('✅ Rôles de classe vérifiés');
    } catch (error) {
      console.error('❌ Erreur vérification rôles:', error);
    }
    
    // Log des stats
    console.log(`📊 ${client.guilds.cache.size} serveur(s)`);
    console.log(`👥 ${client.users.cache.size} utilisateur(s) en cache`);
  }
};
