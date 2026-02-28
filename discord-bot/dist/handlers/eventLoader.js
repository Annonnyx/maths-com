"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadEvents = loadEvents;
const promises_1 = require("fs/promises");
const path_1 = require("path");
const client_js_1 = require("../client.js");
async function loadEvents() {
    const eventsPath = (0, path_1.join)(process.cwd(), 'dist/events');
    try {
        const eventFiles = await (0, promises_1.readdir)(eventsPath);
        for (const file of eventFiles) {
            if (!file.endsWith('.js'))
                continue;
            const eventModule = await import(`file://${(0, path_1.join)(eventsPath, file)}`);
            const event = eventModule.default || eventModule;
            if (event.name && event.execute) {
                if (event.once) {
                    client_js_1.client.once(event.name, (...args) => event.execute(...args));
                }
                else {
                    client_js_1.client.on(event.name, (...args) => event.execute(...args));
                }
                console.log(`📡 Event chargé: ${event.name}`);
            }
        }
    }
    catch (error) {
        console.error('❌ Erreur chargement events:', error);
    }
}
//# sourceMappingURL=eventLoader.js.map