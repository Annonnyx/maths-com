import { config } from '../config.js';
import { discordDb } from './supabase.js';
export async function assignRoles(discordUserId, supabaseUserId) {
    try {
        // Récupérer le client Discord
        const { client } = await import('../client.js');
        const guild = client.guilds.cache.get(config.discord.guildId);
        if (!guild) {
            console.error('Guild not found');
            return false;
        }
        const member = await guild.members.fetch(discordUserId).catch(() => null);
        if (!member) {
            console.error('Member not found:', discordUserId);
            return false;
        }
        // Récupérer le profil utilisateur depuis Supabase
        const profile = await discordDb.getUserProfile(supabaseUserId);
        if (!profile) {
            console.error('Profile not found:', supabaseUserId);
            return false;
        }
        // Rôles à attribuer
        const rolesToAdd = [];
        // Rôles de rang (basé sur l'ELO)
        const elo = profile.elo || 0;
        if (elo >= 2000)
            rolesToAdd.push(config.roles.S || config.roles.TLE); // S / Terminale
        else if (elo >= 1700)
            rolesToAdd.push(config.roles.A || config.roles['1RE']); // A / 1ère
        else if (elo >= 1400)
            rolesToAdd.push(config.roles.B || config.roles['2DE']); // B / 2nde
        else if (elo >= 1200)
            rolesToAdd.push(config.roles.C || config.roles['3E']); // C / 3ème
        else if (elo >= 1000)
            rolesToAdd.push(config.roles.D || config.roles['4E']); // D / 4ème
        else if (elo >= 800)
            rolesToAdd.push(config.roles.E || config.roles['5E']); // E / 5ème
        else
            rolesToAdd.push(config.roles.F || config.roles['6E']); // F / 6ème
        // Rôles de classe française (basé sur rankClass)
        const rankClass = profile.rankClass || '';
        if (rankClass.includes('CP'))
            rolesToAdd.push(config.roles.CP);
        else if (rankClass.includes('CE1'))
            rolesToAdd.push(config.roles.CE1);
        else if (rankClass.includes('CE2'))
            rolesToAdd.push(config.roles.CE2);
        else if (rankClass.includes('CM1'))
            rolesToAdd.push(config.roles.CM1);
        else if (rankClass.includes('CM2'))
            rolesToAdd.push(config.roles.CM2);
        else if (rankClass.includes('6ème'))
            rolesToAdd.push(config.roles['6E']);
        else if (rankClass.includes('5ème'))
            rolesToAdd.push(config.roles['5E']);
        else if (rankClass.includes('4ème'))
            rolesToAdd.push(config.roles['4E']);
        else if (rankClass.includes('3ème'))
            rolesToAdd.push(config.roles['3E']);
        else if (rankClass.includes('2nde'))
            rolesToAdd.push(config.roles['2DE']);
        else if (rankClass.includes('1ère'))
            rolesToAdd.push(config.roles['1RE']);
        else if (rankClass.includes('Terminale'))
            rolesToAdd.push(config.roles.TLE);
        // Rôles de badges spéciaux
        if (profile.user_badges && profile.user_badges.length > 0) {
            for (const userBadge of profile.user_badges) {
                const badge = userBadge.badge;
                if (badge && config.roles.badges[badge.id]) {
                    rolesToAdd.push(config.roles.badges[badge.id]);
                }
            }
        }
        // Rôles spéciaux (top 1, etc.)
        if (profile.user_badges) {
            const hasTop1Solo = profile.user_badges.some((ub) => ub.badge.id === 'top_1_solo');
            const hasTop1Multi = profile.user_badges.some((ub) => ub.badge.id === 'top_1_multi');
            if (hasTop1Solo)
                rolesToAdd.push(config.roles.top1Solo);
            if (hasTop1Multi)
                rolesToAdd.push(config.roles.top1Multi);
        }
        // Filtrer les rôles valides (exclure les doublons et les rôles invalides)
        const validRoles = [...new Set(rolesToAdd)].filter(roleId => roleId && guild.roles.cache.has(roleId));
        // Ajouter les rôles
        if (validRoles.length > 0) {
            await member.roles.add(validRoles);
            console.log(`Added ${validRoles.length} roles to user ${discordUserId}`);
        }
        return true;
    }
    catch (error) {
        console.error('Error assigning roles:', error);
        return false;
    }
}
export async function removeRoles(discordUserId, roleIds) {
    try {
        const { client } = await import('../client.js');
        const guild = client.guilds.cache.get(config.discord.guildId);
        if (!guild) {
            console.error('Guild not found');
            return false;
        }
        const member = await guild.members.fetch(discordUserId).catch(() => null);
        if (!member) {
            console.error('Member not found:', discordUserId);
            return false;
        }
        // Filtrer les rôles que le membre possède réellement
        const rolesToRemove = roleIds.filter(roleId => member.roles.cache.has(roleId));
        if (rolesToRemove.length > 0) {
            await member.roles.remove(rolesToRemove);
            console.log(`Removed ${rolesToRemove.length} roles from user ${discordUserId}`);
        }
        return true;
    }
    catch (error) {
        console.error('Error removing roles:', error);
        return false;
    }
}
export async function removeAllMathsAppRoles(discordUserId) {
    try {
        const { client } = await import('../client.js');
        const guild = client.guilds.cache.get(config.discord.guildId);
        if (!guild) {
            console.error('Guild not found');
            return false;
        }
        const member = await guild.members.fetch(discordUserId).catch(() => null);
        if (!member) {
            console.error('Member not found:', discordUserId);
            return false;
        }
        // Liste de tous les rôles Maths-App à retirer
        const allMathsAppRoles = [
            config.roles.top1Solo,
            config.roles.top1Multi,
            config.roles.support,
            config.roles.CP,
            config.roles.CE1,
            config.roles.CE2,
            config.roles.CM1,
            config.roles.CM2,
            config.roles['6E'],
            config.roles['5E'],
            config.roles['4E'],
            config.roles['3E'],
            config.roles['2DE'],
            config.roles['1RE'],
            config.roles.TLE,
            ...Object.values(config.roles.badges)
        ];
        // Filtrer les rôles que le membre possède réellement
        const rolesToRemove = allMathsAppRoles.filter(roleId => roleId && member.roles.cache.has(roleId));
        if (rolesToRemove.length > 0) {
            await member.roles.remove(rolesToRemove);
            console.log(`Removed ${rolesToRemove.length} Maths-App roles from user ${discordUserId}`);
        }
        return true;
    }
    catch (error) {
        console.error('Error removing all Maths-App roles:', error);
        return false;
    }
}
