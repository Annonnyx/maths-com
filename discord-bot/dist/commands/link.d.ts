import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
declare const _default: {
    data: SlashCommandBuilder;
    execute(interaction: ChatInputCommandInteraction): Promise<void>;
};
export default _default;
export declare function verifyLinkCode(code: string): {
    valid: boolean;
    error: string;
    discordId?: undefined;
    discordUsername?: undefined;
} | {
    valid: boolean;
    discordId: string;
    discordUsername: string;
    error?: undefined;
};
//# sourceMappingURL=link.d.ts.map