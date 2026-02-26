import { readdir } from 'fs/promises';
import { join } from 'path';
import { client } from '../client.js';

export async function loadEvents() {
  const eventsPath = join(process.cwd(), 'src/events');
  
  try {
    const eventFiles = await readdir(eventsPath);
    
    for (const file of eventFiles) {
      if (!file.endsWith('.ts') && !file.endsWith('.js')) continue;
      
      const eventModule = await import(join(eventsPath, file));
      const event = eventModule.default || eventModule;
      
      if (event.name && event.execute) {
        if (event.once) {
          client.once(event.name, (...args) => event.execute(...args));
        } else {
          client.on(event.name, (...args) => event.execute(...args));
        }
        console.log(`📡 Event chargé: ${event.name}`);
      }
    }
  } catch (error) {
    console.error('❌ Erreur chargement events:', error);
  }
}
