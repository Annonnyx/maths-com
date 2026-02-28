import { SlashCommandBuilder, ModalSubmitInteraction, ButtonInteraction, ChatInputCommandInteraction } from 'discord.js';
declare const _default: {
    data: SlashCommandBuilder;
    execute(interaction: ChatInputCommandInteraction): Promise<import("discord.js").InteractionResponse<boolean>>;
};
export default _default;
export declare function handleTicketModal(interaction: ModalSubmitInteraction): Promise<void>;
export declare function handleTicketClose(interaction: ButtonInteraction, ticketUserId: string): Promise<void>;
export declare function confirmTicketClose(interaction: ModalSubmitInteraction, ticketUserId: string): Promise<void>;
//# sourceMappingURL=ticket-enhanced.d.ts.map