"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.COLORS = exports.BADGE_ROLE_NAMES = exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = require("path");
dotenv_1.default.config({ path: (0, path_1.join)(process.cwd(), '.env') });
function getEnvVar(key, defaultValue) {
    const value = process.env[key] || defaultValue;
    if (!value) {
        throw new Error(`Variable d'environnement manquante: ${key}`);
    }
    return value;
}
exports.config = {
    // Discord
    discord: {
        token: getEnvVar('DISCORD_TOKEN'),
        clientId: getEnvVar('DISCORD_CLIENT_ID'),
        guildId: getEnvVar('DISCORD_GUILD_ID'),
    },
    // API (communication avec le site)
    api: {
        port: parseInt(getEnvVar('API_PORT', '3001')),
        secret: getEnvVar('API_SECRET'),
    },
    // URLs du site
    website: {
        url: getEnvVar('WEBSITE_URL', 'https://maths-app.com'),
        apiUrl: getEnvVar('WEBSITE_API_URL', 'https://maths-app.com/api'),
    },
    // IDs des salons Discord
    channels: {
        leaderboardSolo: getEnvVar('LEADERBOARD_SOLO_CHANNEL_ID'),
        leaderboardMulti: getEnvVar('LEADERBOARD_MULTI_CHANNEL_ID'),
        ticketCategory: getEnvVar('TICKET_CATEGORY_ID'),
        ticketLog: getEnvVar('TICKET_LOG_CHANNEL_ID'),
        announcements: getEnvVar('ANNOUNCEMENTS_CHANNEL_ID'),
        general: getEnvVar('GENERAL_CHANNEL_ID'),
    },
    // IDs des rôles (classements)
    roles: {
        top1Solo: getEnvVar('ROLE_TOP1_SOLO'),
        top1Multi: getEnvVar('ROLE_TOP1_MULTI'),
        top10Solo: getEnvVar('ROLE_TOP10_SOLO'),
        top10Multi: getEnvVar('ROLE_TOP10_MULTI'),
        support: getEnvVar('ROLE_SUPPORT'),
        // Rôles de classe française
        CP: getEnvVar('ROLE_CP'),
        CE1: getEnvVar('ROLE_CE1'),
        CE2: getEnvVar('ROLE_CE2'),
        CM1: getEnvVar('ROLE_CM1'),
        CM2: getEnvVar('ROLE_CM2'),
        '6E': getEnvVar('ROLE_6E'),
        '5E': getEnvVar('ROLE_5E'),
        '4E': getEnvVar('ROLE_4E'),
        '3E': getEnvVar('ROLE_3E'),
        '2DE': getEnvVar('ROLE_2DE'),
        '1RE': getEnvVar('ROLE_1RE'),
        'TLE': getEnvVar('ROLE_TLE'),
        // Rôles badges (à configurer selon les badges du site)
        badges: {
        // Format: badgeId -> roleId
        // Exemple: streak_7: '123456789',
        },
    },
    // Configuration des tickets
    tickets: {
        maxPerUser: 3,
        autoCloseHours: 48,
    },
    // Cron jobs
    cron: {
        // Classement mensuel: 1er du mois à midi
        monthlyLeaderboard: '0 12 1 * *',
        // Vérification des rôles: toutes les heures
        roleCheck: '0 * * * *',
    },
};
// Mapping des badges vers les noms de rôles Discord
exports.BADGE_ROLE_NAMES = {
    'first_test': '🎯 Premier Test',
    'perfect_score': '💯 Score Parfait',
    'streak_7': '🔥 Série 7j',
    'streak_30': '🔥 Série 30j',
    'streak_100': '🔥 Série 100j',
    'elo_1000': '📈 ELO 1000',
    'elo_1500': '📈 ELO 1500',
    'elo_2000': '📈 ELO 2000',
    'top_10': '🏆 Top 10',
    'top_1': '👑 Champion',
    'multiplayer_100': '⚔️ 100 Parties',
    'multiplayer_wins_50': '🏅 50 Victoires',
    // Ajoutez d'autres badges selon votre site
};
// Couleurs des embeds
exports.COLORS = {
    primary: 0x6366f1, // Indigo
    success: 0x22c55e, // Green
    error: 0xef4444, // Red
    warning: 0xf59e0b, // Yellow
    info: 0x3b82f6, // Blue
    gold: 0xffd700, // Gold
    silver: 0xc0c0c0, // Silver
    bronze: 0xcd7f32, // Bronze
};
//# sourceMappingURL=config.js.map