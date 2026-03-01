import { REST, Routes } from 'discord.js';
import { client } from '../client.js';
import { config } from '../config.js';
import { readdir } from 'fs/promises';
import { join } from 'path';
// Fonction utilitaire pour attendre
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
// Fonction de retry avec backoff exponentiel
async function registerCommandsWithRetry(rest, clientId, guildId, commandsData, maxRetries = 3) {
    let lastError = null;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`📡 Tentative ${attempt}/${maxRetries} - Envoi des commandes à Discord...`);
            await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commandsData });
            console.log(`✅ Commandes enregistrées avec succès à la tentative ${attempt}`);
            return; // Succès, on sort de la fonction
        }
        catch (error) {
            lastError = error;
            console.error(`❌ Tentative ${attempt} échouée:`, error);
            if (attempt < maxRetries) {
                const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000); // Exponential backoff, max 10s
                console.log(`⏳ Attente de ${delay}ms avant retry...`);
                await sleep(delay);
            }
        }
    }
    // Toutes les tentatives ont échoué
    throw new Error(`Échec de l'enregistrement des commandes après ${maxRetries} tentatives: ${lastError?.message}`);
}
export async function loadCommands() {
    const commands = [];
    const commandsPath = join(process.cwd(), 'dist/commands');
    try {
        const commandFiles = await readdir(commandsPath);
        // Charger chaque fichier de commande
        for (const file of commandFiles) {
            if (file.endsWith('.js')) {
                const commandPath = join(commandsPath, file);
                console.log(`📂 Chargement de la commande: ${file}`);
                try {
                    const command = await import(`file://${commandPath}`);
                    // Handle nested exports (compiled CommonJS)
                    const actualCommand = command.default.default || command.default;
                    if (actualCommand && actualCommand.data) {
                        commands.push(actualCommand);
                        // Stocker dans client.commands pour interactionCreate
                        client.commands.set(actualCommand.data.name, actualCommand);
                        console.log(`✅ Commande chargée: ${actualCommand.data.name}`);
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
        if (commands.length === 0) {
            console.warn('⚠️ Aucune commande trouvée à enregistrer');
            return;
        }
        const commandsData = commands.map(cmd => cmd.data.toJSON());
        const rest = new REST({ version: '10' }).setToken(config.discord.token);
        // Utiliser la fonction de retry
        await registerCommandsWithRetry(rest, config.discord.clientId, config.discord.guildId, commandsData);
        console.log(`✅ ${commandsData.length} commandes slash enregistrées avec succès !`);
        // Log des commandes chargées
        commands.forEach(cmd => {
            console.log(`   📝 ${cmd.data.name}`);
        });
    }
    catch (error) {
        console.error('❌ Erreur fatale lors du chargement des commandes:', error);
        // Ne pas throw l'erreur pour permettre au bot de démarrer même sans commandes
        // Les commandes peuvent être rechargées manuellement plus tard
        console.warn('⚠️ Le bot démarre sans commandes slash - recharge manuelle nécessaire');
    }
}
