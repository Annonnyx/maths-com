import { Client } from 'discord.js';
export declare class KeepAliveService {
    private client;
    private interval;
    private readonly PING_INTERVAL;
    constructor(client: Client);
    private startKeepAlive;
    stop(): void;
}
//# sourceMappingURL=keepAlive.d.ts.map