import { Client, Collection } from 'discord.js';
declare module 'discord.js' {
    interface Client {
        commands: Collection<string, any>;
    }
}
export declare const client: Client<boolean>;
//# sourceMappingURL=client.d.ts.map