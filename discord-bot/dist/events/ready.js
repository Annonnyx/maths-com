"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const config_js_1 = require("../config.js");
const roleManager_js_1 = require("../handlers/roleManager.js");
exports.default = {
    name: discord_js_1.Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`✅ Bot connecté en tant que ${client.user?.tag}`);
        // Status du bot
        client.user?.setPresence({
            activities: [{
                    name: 'maths-app.com',
                    type: discord_js_1.ActivityType.Playing
                }],
            status: 'online'
        });
        // Vérifier/créer les rôles de classe
        try {
            const guild = await client.guilds.fetch(config_js_1.config.discord.guildId);
            await (0, roleManager_js_1.ensureClassRolesExist)(guild);
            console.log('✅ Rôles de classe vérifiés');
        }
        catch (error) {
            console.error('❌ Erreur vérification rôles:', error);
        }
        // Log des stats
        console.log(`📊 ${client.guilds.cache.size} serveur(s)`);
        console.log(`👥 ${client.users.cache.size} utilisateur(s) en cache`);
    }
};
//# sourceMappingURL=ready.js.map