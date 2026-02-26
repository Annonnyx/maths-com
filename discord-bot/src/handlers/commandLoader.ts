import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import { client } from '../client.js';
import { config } from '../config.js';
import { readdir } from 'fs/promises';
import { join } from 'path';

export async function loadCommands() {
  const commands: SlashCommandBuilder[] = [];
  const commandsPath = join(process.cwd(), 'src/commands');
  
  try {
    const commandFiles = await readdir(commandsPath);
    
    for (const file of commandFiles) {
      if (!file.endsWith('.ts') && !file.endsWith('.js')) continue;
      
      const commandModule = await import(join(commandsPath, file));
      const command = commandModule.default || commandModule;
      
      if (command.data && command.execute) {
        client.commands.set(command.data.name, command);
        commands.push(command.data.toJSON());
        console.log(`📥 Commande chargée: ${command.data.name}`);
      }
    }
    
    // Déployer les commandes sur Discord
    if (commands.length > 0) {
      const rest = new REST({ version: '10' }).setToken(config.discord.token);
      
      await rest.put(
        Routes.applicationGuildCommands(config.discord.clientId, config.discord.guildId),
        { body: commands }
      );
      
      console.log(`🚀 ${commands.length} commande(s) déployée(s)`);
    }
  } catch (error) {
    console.error('❌ Erreur chargement commandes:', error);
  }
}
