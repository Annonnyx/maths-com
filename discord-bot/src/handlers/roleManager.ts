import { Guild, GuildMember, Role } from 'discord.js';
import { client } from '../client.js';
import { config } from '../config.js';

// Mapping des rangs français vers les noms de rôles
const CLASS_ROLES: Record<string, string> = {
  'CP': 'ROLE_CP',
  'CE1': 'ROLE_CE1', 
  'CE2': 'ROLE_CE2',
  'CM1': 'ROLE_CM1',
  'CM2': 'ROLE_CM2',
  '6e': 'ROLE_6E',
  '5e': 'ROLE_5E',
  '4e': 'ROLE_4E',
  '3e': 'ROLE_3E',
  '2de': 'ROLE_2DE',
  '1re': 'ROLE_1RE',
  'Tle': 'ROLE_TLE'
};

// Mettre à jour les rôles d'un utilisateur
export async function updateUserRoles(
  member: GuildMember, 
  badges: string[],
  elo: number,
  rank: number,
  frenchClass?: string
) {
  const rolesToAdd: string[] = [];
  const rolesToRemove: string[] = [];
  
  // Rôle Top 1 Solo uniquement
  const top1SoloRole = await member.guild.roles.fetch(config.roles.top1Solo);
  
  if (rank === 1) {
    rolesToAdd.push(config.roles.top1Solo);
  } else {
    rolesToRemove.push(config.roles.top1Solo);
  }
  
  // Rôle de classe française
  if (frenchClass && CLASS_ROLES[frenchClass]) {
    const classRoleId = config.roles[CLASS_ROLES[frenchClass]];
    if (classRoleId) {
      rolesToAdd.push(classRoleId);
      
      // Retirer tous les autres rôles de classe
      Object.values(CLASS_ROLES).forEach(roleKey => {
        const roleId = config.roles[roleKey];
        if (roleId && roleId !== classRoleId) {
          rolesToRemove.push(roleId);
        }
      });
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

// Mettre à jour le Top 1 mensuel (retirer l'ancien, donner au nouveau)
export async function updateMonthlyTop1(newTop1UserId: string) {
  try {
    const guild = await client.guilds.fetch(config.discord.guildId);
    const top1Role = await guild.roles.fetch(config.roles.top1Solo);
    
    if (!top1Role) {
      console.error('❌ Rôle Top 1 non trouvé');
      return;
    }
    
    // Retirer le rôle à tous les membres qui l'ont actuellement
    const currentTop1Members = guild.members.cache.filter(member => 
      member.roles.cache.has(config.roles.top1Solo)
    );
    
    for (const [_, member] of currentTop1Members) {
      await member.roles.remove(top1Role, 'Nouveau Top 1 mensuel');
      console.log(`🏆 Retrait rôle Top 1: ${member.displayName}`);
    }
    
    // Donner le rôle au nouveau Top 1
    const newTop1Member = await guild.members.fetch(newTop1UserId);
    if (newTop1Member) {
      await newTop1Member.roles.add(top1Role, 'Nouveau Top 1 mensuel');
      console.log(`🏆 Nouveau Top 1: ${newTop1Member.displayName}`);
    }
    
  } catch (error) {
    console.error('❌ Erreur mise à jour Top 1 mensuel:', error);
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
    //     await updateUserRoles(member, user.badges, user.elo, user.rank, user.frenchClass);
    //   }
    // }
    
  } catch (error) {
    console.error('❌ Erreur mise à jour globale des rôles:', error);
  }
}

// Créer les rôles de classe s'ils n'existent pas
export async function ensureClassRolesExist(guild: Guild) {
  const classRoleColors: Record<string, number> = {
    'CP': 0x00ff00,    // Vert
    'CE1': 0x32cd32,    // Vert lime
    'CE2': 0xffd700,    // Or
    'CM1': 0xff8c00,    // Orange
    'CM2': 0x00bfff,    // Bleu ciel
    '6e': 0xff0000,      // Rouge
    '5e': 0xff69b4,      // Rose
    '4e': 0x9370db,      // Violet
    '3e': 0x4169e1,      // Bleu royal
    '2de': 0x00ced1,     // Turquoise
    '1re': 0xff6347,     // Tomate
    'Tle': 0x2e8b57      // Vert forêt
  };

  for (const [className, roleKey] of Object.entries(CLASS_ROLES)) {
    const existingRole = guild.roles.cache.find(r => r.name === className);
    
    if (!existingRole) {
      try {
        const role = await guild.roles.create({
          name: className,
          color: classRoleColors[className] || 0x6366f1,
          reason: 'Création automatique - Classe Maths-App',
          hoist: true // Afficher séparément dans la liste
        });
        
        // Stocker l'ID dans la config
        config.roles[roleKey] = role.id;
        console.log(`✅ Rôle créé: ${className} (${role.id})`);
      } catch (error) {
        console.error(`❌ Erreur création rôle ${className}:`, error);
      }
    } else {
      config.roles[roleKey] = existingRole.id;
    }
  }
}
