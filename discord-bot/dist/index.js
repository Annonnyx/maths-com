"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_js_1 = require("./client.js");
const config_js_1 = require("./config.js");
const commandLoader_js_1 = require("./handlers/commandLoader.js");
const eventLoader_js_1 = require("./handlers/eventLoader.js");
const server_js_1 = require("./api/server.js");
const cronJobs_js_1 = require("./handlers/cronJobs.js");
async function main() {
    console.log('🚀 Démarrage du bot Maths-App...');
    try {
        // Charger les commandes
        await (0, commandLoader_js_1.loadCommands)();
        console.log('✅ Commandes chargées');
        // Charger les events
        await (0, eventLoader_js_1.loadEvents)();
        console.log('✅ Events chargés');
        // Démarrer le serveur API (pour communiquer avec le site)
        (0, server_js_1.startApiServer)(config_js_1.config.api.port);
        console.log(`✅ API démarrée sur le port ${config_js_1.config.api.port}`);
        // Démarrer les cron jobs (classements mensuels, etc.)
        (0, cronJobs_js_1.startCronJobs)();
        console.log('✅ Cron jobs démarrés');
        // Connexion à Discord
        await client_js_1.client.login(config_js_1.config.discord.token);
        console.log('✅ Connecté à Discord');
    }
    catch (error) {
        console.error('❌ Erreur au démarrage:', error);
        process.exit(1);
    }
}
// Gestion des erreurs non capturées
process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled Rejection:', error);
});
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});
// Arrêt gracieux
process.on('SIGINT', async () => {
    console.log('\n👋 Arrêt du bot...');
    await client_js_1.client.destroy();
    process.exit(0);
});
main();
//# sourceMappingURL=index.js.map