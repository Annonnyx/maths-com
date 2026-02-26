"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadCommands = loadCommands;
const discord_js_1 = require("discord.js");
const client_js_1 = require("../client.js");
const config_js_1 = require("../config.js");
const promises_1 = require("fs/promises");
const path_1 = require("path");
async function loadCommands() {
    const commands = [];
    const commandsPath = (0, path_1.join)(process.cwd(), 'src/commands');
    try {
        const commandFiles = await (0, promises_1.readdir)(commandsPath);
        for (const file of commandFiles) {
            if (!file.endsWith('.ts') && !file.endsWith('.js'))
                continue;
            const commandModule = await import((0, path_1.join)(commandsPath, file));
            const command = commandModule.default || commandModule;
            if (command.data && command.execute) {
                client_js_1.client.commands.set(command.data.name, command);
                commands.push(command.data.toJSON());
                console.log(`📥 Commande chargée: ${command.data.name}`);
            }
        }
        // Déployer les commandes sur Discord
        if (commands.length > 0) {
            const rest = new discord_js_1.REST({ version: '10' }).setToken(config_js_1.config.discord.token);
            await rest.put(discord_js_1.Routes.applicationGuildCommands(config_js_1.config.discord.clientId, config_js_1.config.discord.guildId), { body: commands });
            console.log(`🚀 ${commands.length} commande(s) déployée(s)`);
        }
    }
    catch (error) {
        console.error('❌ Erreur chargement commandes:', error);
    }
}
//# sourceMappingURL=commandLoader.js.map