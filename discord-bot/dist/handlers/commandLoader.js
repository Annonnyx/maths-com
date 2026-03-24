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
exports.loadCommands = loadCommands;
const discord_js_1 = require("discord.js");
const client_js_1 = require("../client.js");
const config_js_1 = require("../config.js");
const promises_1 = require("fs/promises");
const path_1 = require("path");
// Fonction utilitaire pour attendre
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
// Fonction de retry avec backoff exponentiel
async function registerCommandsWithRetry(rest, clientId, guildId, commandsData, maxRetries = 3) {
    let lastError = null;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`📡 Tentative ${attempt}/${maxRetries} - Envoi des commandes à Discord...`);
            await rest.put(discord_js_1.Routes.applicationGuildCommands(clientId, guildId), { body: commandsData });
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
                try {
                    const command = await Promise.resolve(`${`../commands/${file.replace('.js', '')}`}`).then(s => __importStar(require(s)));
                    // Handle different export formats
                    let actualCommand = command.default;
                    if (actualCommand && actualCommand.default) {
                        actualCommand = actualCommand.default;
                    }
                    if (actualCommand && actualCommand.data) {
                        commands.push(actualCommand);
                        // Stocker dans client.commands pour interactionCreate
                        client_js_1.client.commands.set(actualCommand.data.name, actualCommand);
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
        const rest = new discord_js_1.REST({ version: '10' }).setToken(config_js_1.config.discord.token);
        // Utiliser la fonction de retry
        await registerCommandsWithRetry(rest, config_js_1.config.discord.clientId, config_js_1.config.discord.guildId, commandsData);
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
