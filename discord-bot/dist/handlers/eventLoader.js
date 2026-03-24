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
            const eventModule = await Promise.resolve(`${`../events/${file.replace('.js', '')}`}`).then(s => __importStar(require(s)));
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
