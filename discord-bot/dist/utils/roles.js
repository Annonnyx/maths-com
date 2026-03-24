"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignRoles = assignRoles;
exports.removeRoles = removeRoles;
exports.removeAllMathsAppRoles = removeAllMathsAppRoles;
const config_js_1 = require("../config.js");
const supabase_js_1 = require("./supabase.js");
async function assignRoles(discordUserId, supabaseUserId) {
    try {
        // Récupérer le client Discord
        const { client } = await Promise.resolve().then(() => __importStar(require('../client.js')));
        const guild = client.guilds.cache.get(config_js_1.config.discord.guildId);
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
        const profile = await supabase_js_1.discordDb.getUserProfile(supabaseUserId);
        if (!profile) {
            console.error('Profile not found:', supabaseUserId);
            return false;
        }
        // Rôles à attribuer
        const rolesToAdd = [];
        // Rôles de rang (basé sur l'ELO)
        const elo = profile.elo || 0;
        if (elo >= 2000)
            rolesToAdd.push(config_js_1.config.roles.S || config_js_1.config.roles.TLE); // S / Terminale
        else if (elo >= 1700)
            rolesToAdd.push(config_js_1.config.roles.A || config_js_1.config.roles['1RE']); // A / 1ère
        else if (elo >= 1400)
            rolesToAdd.push(config_js_1.config.roles.B || config_js_1.config.roles['2DE']); // B / 2nde
        else if (elo >= 1200)
            rolesToAdd.push(config_js_1.config.roles.C || config_js_1.config.roles['3E']); // C / 3ème
        else if (elo >= 1000)
            rolesToAdd.push(config_js_1.config.roles.D || config_js_1.config.roles['4E']); // D / 4ème
        else if (elo >= 800)
            rolesToAdd.push(config_js_1.config.roles.E || config_js_1.config.roles['5E']); // E / 5ème
        else
            rolesToAdd.push(config_js_1.config.roles.F || config_js_1.config.roles['6E']); // F / 6ème
        // Rôles de classe française (basé sur rankClass)
        const rankClass = profile.rankClass || '';
        if (rankClass.includes('CP'))
            rolesToAdd.push(config_js_1.config.roles.CP);
        else if (rankClass.includes('CE1'))
            rolesToAdd.push(config_js_1.config.roles.CE1);
        else if (rankClass.includes('CE2'))
            rolesToAdd.push(config_js_1.config.roles.CE2);
        else if (rankClass.includes('CM1'))
            rolesToAdd.push(config_js_1.config.roles.CM1);
        else if (rankClass.includes('CM2'))
            rolesToAdd.push(config_js_1.config.roles.CM2);
        else if (rankClass.includes('6ème'))
            rolesToAdd.push(config_js_1.config.roles['6E']);
        else if (rankClass.includes('5ème'))
            rolesToAdd.push(config_js_1.config.roles['5E']);
        else if (rankClass.includes('4ème'))
            rolesToAdd.push(config_js_1.config.roles['4E']);
        else if (rankClass.includes('3ème'))
            rolesToAdd.push(config_js_1.config.roles['3E']);
        else if (rankClass.includes('2nde'))
            rolesToAdd.push(config_js_1.config.roles['2DE']);
        else if (rankClass.includes('1ère'))
            rolesToAdd.push(config_js_1.config.roles['1RE']);
        else if (rankClass.includes('Terminale'))
            rolesToAdd.push(config_js_1.config.roles.TLE);
        // Rôles de badges spéciaux
        if (profile.user_badges && profile.user_badges.length > 0) {
            for (const userBadge of profile.user_badges) {
                const badge = userBadge.badge;
                if (badge && config_js_1.config.roles.badges[badge.id]) {
                    rolesToAdd.push(config_js_1.config.roles.badges[badge.id]);
                }
            }
        }
        // Rôles spéciaux (top 1, etc.)
        if (profile.user_badges) {
            const hasTop1Solo = profile.user_badges.some((ub) => ub.badge.id === 'top_1_solo');
            const hasTop1Multi = profile.user_badges.some((ub) => ub.badge.id === 'top_1_multi');
            if (hasTop1Solo)
                rolesToAdd.push(config_js_1.config.roles.top1Solo);
            if (hasTop1Multi)
                rolesToAdd.push(config_js_1.config.roles.top1Multi);
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
async function removeRoles(discordUserId, roleIds) {
    try {
        const { client } = await Promise.resolve().then(() => __importStar(require('../client.js')));
        const guild = client.guilds.cache.get(config_js_1.config.discord.guildId);
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
async function removeAllMathsAppRoles(discordUserId) {
    try {
        const { client } = await Promise.resolve().then(() => __importStar(require('../client.js')));
        const guild = client.guilds.cache.get(config_js_1.config.discord.guildId);
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
            config_js_1.config.roles.top1Solo,
            config_js_1.config.roles.top1Multi,
            config_js_1.config.roles.support,
            config_js_1.config.roles.CP,
            config_js_1.config.roles.CE1,
            config_js_1.config.roles.CE2,
            config_js_1.config.roles.CM1,
            config_js_1.config.roles.CM2,
            config_js_1.config.roles['6E'],
            config_js_1.config.roles['5E'],
            config_js_1.config.roles['4E'],
            config_js_1.config.roles['3E'],
            config_js_1.config.roles['2DE'],
            config_js_1.config.roles['1RE'],
            config_js_1.config.roles.TLE,
            ...Object.values(config_js_1.config.roles.badges)
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
