import { Guild, GuildMember, Role } from 'discord.js';
import { client } from '../client.js';
import { config, BADGE_ROLE_NAMES } from '../config.js';

// Mettre à jour les rôles d'un utilisateur
export async function updateUserRoles(
  member: GuildMember, 
  badges: string[],
  elo: number,
  rank: number
) {
  const rolesToAdd: string[] = [];
  const rolesToRemove: string[] = [];
  
  // Rôles de classement
  const top1SoloRole = await member.guild.roles.fetch(config.roles.top1Solo);
  const top10SoloRole = await member.guild.roles.fetch(config.roles.top10Solo);
  
  if (rank === 1) {
    rolesToAdd.push(config.roles.top1Solo);
  } else {
    rolesToRemove.push(config.roles.top1Solo);
  }
  
  if (rank <= 10) {
    rolesToAdd.push(config.roles.top10Solo);
  } else {
    rolesToRemove.push(config.roles.top10Solo);
  }
  
  // Rôles de badges
  for (const badge of badges) {
    const roleId = config.roles.badges[badge];
    if (roleId) {
      rolesToAdd.push(roleId);
    }
  }
  
  // Appliquer les changements
  try {
    if (rolesToAdd.length > 0) {
      await member.roles.add(rolesToAdd, 'Mise à jour automatique - Maths-App');
    }
    if (rolesToRemove.length > 0) {
      await member.roles.remove(rolesToRemove, 'Mise à jour automatique - Maths-App');
    }
  } catch (error) {
    console.error('❌ Erreur mise à jour rôles:', error);
  }
}

// Mettre à jour tous les utilisateurs
export async function updateAllUserRoles() {
  try {
    const guild = await client.guilds.fetch(config.discord.guildId);
    
    // Récupérer les données depuis l'API du site
    // TODO: Implement fetch from website API
    // const response = await fetch(`${config.website.apiUrl}/users/with-discord`);
    // const users = await response.json();
    
    console.log('🔄 Mise à jour des rôles pour tous les utilisateurs liés...');
    
    // Pour chaque utilisateur lié
    // for (const user of users) {
    //   const member = await guild.members.fetch(user.discordId);
    //   if (member) {
    //     await updateUserRoles(member, user.badges, user.elo, user.rank);
    //   }
    // }
    
  } catch (error) {
    console.error('❌ Erreur mise à jour globale des rôles:', error);
  }
}

// Créer les rôles de badges s'ils n'existent pas
export async function ensureBadgeRolesExist(guild: Guild) {
  for (const [badgeId, roleName] of Object.entries(BADGE_ROLE_NAMES)) {
    const existingRole = guild.roles.cache.find(r => r.name === roleName);
    
    if (!existingRole) {
      try {
        const role = await guild.roles.create({
          name: roleName,
          color: getBadgeColor(badgeId),
          reason: 'Création automatique - Badge Maths-App',
          hoist: true // Afficher séparément dans la liste
        });
        
        // Stocker l'ID dans la config
        config.roles.badges[badgeId] = role.id;
        console.log(`✅ Rôle créé: ${roleName} (${role.id})`);
      } catch (error) {
        console.error(`❌ Erreur création rôle ${roleName}:`, error);
      }
    } else {
      config.roles.badges[badgeId] = existingRole.id;
    }
  }
}

function getBadgeColor(badgeId: string): number {
  if (badgeId.includes('streak_100')) return 0xff0000; // Rouge
  if (badgeId.includes('streak_30')) return 0xff8800; // Orange
  if (badgeId.includes('streak_7')) return 0xffd700; // Or
  if (badgeId.includes('top_1')) return 0xffd700; // Or
  if (badgeId.includes('top_10')) return 0xc0c0c0; // Argent
  if (badgeId.includes('elo_2000')) return 0xff00ff; // Magenta
  if (badgeId.includes('elo_1500')) return 0x00ffff; // Cyan
  if (badgeId.includes('elo_1000')) return 0x00ff00; // Vert
  return 0x6366f1; // Indigo par défaut
}
