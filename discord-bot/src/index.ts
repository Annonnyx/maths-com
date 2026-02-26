import { client } from './client.js';
import { config } from './config.js';
import { loadCommands } from './handlers/commandLoader.js';
import { loadEvents } from './handlers/eventLoader.js';
import { startApiServer } from './api/server.js';
import { startCronJobs } from './handlers/cronJobs.js';

async function main() {
  console.log('🚀 Démarrage du bot Maths-App...');
  
  try {
    // Charger les commandes
    await loadCommands();
    console.log('✅ Commandes chargées');
    
    // Charger les events
    await loadEvents();
    console.log('✅ Events chargés');
    
    // Démarrer le serveur API (pour communiquer avec le site)
    startApiServer(config.api.port);
    console.log(`✅ API démarrée sur le port ${config.api.port}`);
    
    // Démarrer les cron jobs (classements mensuels, etc.)
    startCronJobs();
    console.log('✅ Cron jobs démarrés');
    
    // Connexion à Discord
    await client.login(config.discord.token);
    console.log('✅ Connecté à Discord');
    
  } catch (error) {
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
  await client.destroy();
  process.exit(0);
});

main();
