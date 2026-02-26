export declare function sendMessageToChannel(channelId: string, content: string, embeds?: any[]): Promise<string | null>;
export declare function publishLeaderboard(type?: 'solo' | 'multi'): Promise<void>;
export declare function createTicketFromDiscord(userId: string, username: string, subject: string, message: string): Promise<string>;
export declare function replyToTicket(ticketId: string, message: string, adminName: string): Promise<void>;
//# sourceMappingURL=discordActions.d.ts.map