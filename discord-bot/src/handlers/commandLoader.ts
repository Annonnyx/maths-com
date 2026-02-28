import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import { client } from '../client.js';
import { config } from '../config.js';
import { readdir } from 'fs/promises';
import { join } from 'path';

export async function loadCommands() {
  const commands: any[] = [];
  const commandsPath = join(process.cwd(), 'dist/commands');
  
  try {
    const commandFiles = await readdir(commandsPath);
    
    // Charger chaque fichier de commande
    for (const file of commandFiles) {
      if (file.endsWith('.js')) {
        const commandPath = join(commandsPath, file);
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
          } else {
            console.warn(`⚠️ La commande ${file} n'a pas de data ou de default export`);
          }
        } catch (importError) {
          console.error(`❌ Erreur d'import pour ${file}:`, importError);
        }
      }
    }
    
    const commandsData = commands.map(cmd => cmd.data.toJSON());
    
    const rest = new REST({ version: '10' }).setToken(config.discord.token);

    console.log('📡 Envoi des commandes à Discord...');
    await rest.put(
      Routes.applicationGuildCommands(config.discord.clientId, config.discord.guildId),
      { body: commandsData }
    );

    console.log(`✅ ${commandsData.length} commandes slash enregistrées avec succès !`);
    
    // Log des commandes chargées
    commands.forEach(cmd => {
      console.log(`   📝 ${cmd.data.name}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur lors du chargement des commandes:', error);
    throw error;
  }
}
