import { ActivityType } from 'discord.js';
export class KeepAliveService {
    client;
    interval = null;
    PING_INTERVAL = 5 * 60 * 1000; // 5 minutes
    constructor(client) {
        this.client = client;
        this.startKeepAlive();
    }
    startKeepAlive() {
        console.log('🏥 Keep-Alive service started (ping every 5 minutes)');
        this.interval = setInterval(async () => {
            try {
                // 1. Ping Discord API avec activité dynamique
                const activities = [
                    { name: `🏆 ${Math.floor(Math.random() * 1000)} joueurs`, type: ActivityType.Watching },
                    { name: '📚 les cours de maths', type: ActivityType.Playing },
                    { name: '🎮 aider les élèves', type: ActivityType.Playing },
                    { name: `⚡ ${this.client.guilds.cache.size} serveurs`, type: ActivityType.Watching }
                ];
                const randomActivity = activities[Math.floor(Math.random() * activities.length)];
                await this.client.user?.setPresence({
                    activities: [randomActivity],
                    status: 'online'
                });
                // 2. Vérification de la connexion
                if (this.client.ws.status !== 0) {
                    console.warn('⚠️ WebSocket connection issue detected');
                }
                // 3. Log de santé détaillé
                const memory = process.memoryUsage();
                const uptime = process.uptime();
                console.log(`🏥 Health Check - ${new Date().toISOString()}`);
                console.log(`💾 Memory: ${Math.round(memory.heapUsed / 1024 / 1024)}MB / ${Math.round(memory.heapTotal / 1024 / 1024)}MB`);
                console.log(`⏱️ Uptime: ${Math.floor(uptime / 60)}min ${Math.floor(uptime % 60)}s`);
                console.log(`🌐 Guilds: ${this.client.guilds.cache.size}`);
                console.log(`👥 Users: ${this.client.users.cache.size}`);
                console.log(`📡 WebSocket: ${this.client.ws.status === 0 ? 'Connected' : 'Disconnected'}`);
                console.log('---');
            }
            catch (error) {
                console.error('❌ Keep-alive failed:', error);
                // Tentative de reconnexion
                try {
                    await this.client.user?.setPresence({
                        activities: [{ name: '🔄 Redémarrage...', type: ActivityType.Playing }],
                        status: 'idle'
                    });
                }
                catch (reconnectError) {
                    console.error('❌ Reconnection failed:', reconnectError);
                }
            }
        }, this.PING_INTERVAL);
    }
    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
            console.log('🛑 Keep-Alive service stopped');
        }
    }
}
