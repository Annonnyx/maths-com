import { ChatInputCommandInteraction } from 'discord.js';
declare const _default: {
    data: import("discord.js").SlashCommandOptionsOnlyBuilder;
    execute(interaction: ChatInputCommandInteraction): Promise<import("discord.js").Message<boolean> | import("discord.js").InteractionResponse<boolean>>;
};
export default _default;
export declare function verifyLinkCode(code: string, supabaseUserId: string): Promise<{
    valid: boolean;
    error: string;
    discordUserId?: undefined;
    message?: undefined;
} | {
    valid: boolean;
    discordUserId: any;
    message: string;
    error?: undefined;
}>;
//# sourceMappingURL=link.d.ts.map