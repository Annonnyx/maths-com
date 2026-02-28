"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadCommands = loadCommands;
const discord_js_1 = require("discord.js");
const config_js_1 = require("../config.js");
const promises_1 = require("fs/promises");
const path_1 = require("path");
async function loadCommands() {
    const commands = [];
    const commandsPath = (0, path_1.join)(process.cwd(), 'dist/commands');
    try {
        const commandFiles = await (0, promises_1.readdir)(commandsPath);
        // Charger chaque fichier de commande
        for (const file of commandFiles) {
            if (file.endsWith('.js')) {
                const commandPath = (0, path_1.join)(commandsPath, file);
                console.log(`📂 Chargement de la commande: ${file}`);
                console.log(`🔍 Chemin complet: ${commandPath}`);
                try {
                    const command = await import(`file://${commandPath}`);
                    console.log(`🔍 Export complet:`, Object.keys(command));
                    console.log(`🔍 Default export:`, command.default);
                    // Handle nested exports (compiled CommonJS)
                    const actualCommand = command.default.default || command.default;
                    console.log(`✅ Commande chargée:`, actualCommand?.data?.name || 'No name');
                    if (actualCommand && actualCommand.data) {
                        commands.push(actualCommand);
                    }
                    else {
                        console.warn(`⚠️ La commande ${file} n'a pas de data ou de default export`);
                    }
                }
                catch (importError) {
                    console.error(`❌ Erreur d'import pour ${file}:`, importError);
                }
            }
        }
        const commandsData = commands.map(cmd => cmd.data.toJSON());
        const rest = new discord_js_1.REST({ version: '10' }).setToken(config_js_1.config.discord.token);
        console.log('📡 Envoi des commandes à Discord...');
        await rest.put(discord_js_1.Routes.applicationGuildCommands(config_js_1.config.discord.clientId, config_js_1.config.discord.guildId), { body: commandsData });
        console.log(`✅ ${commandsData.length} commandes slash enregistrées avec succès !`);
        // Log des commandes chargées
        commands.forEach(cmd => {
            console.log(`   📝 ${cmd.data.name}`);
        });
    }
    catch (error) {
        console.error('❌ Erreur lors du chargement des commandes:', error);
        throw error;
    }
}
//# sourceMappingURL=commandLoader.js.map