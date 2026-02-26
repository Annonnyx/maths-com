export declare const config: {
    discord: {
        token: string;
        clientId: string;
        guildId: string;
    };
    api: {
        port: number;
        secret: string;
    };
    website: {
        url: string;
        apiUrl: string;
    };
    channels: {
        leaderboardSolo: string;
        leaderboardMulti: string;
        ticketCategory: string;
        ticketLog: string;
        announcements: string;
        general: string;
    };
    roles: Record<string, any>;
    tickets: {
        maxPerUser: number;
        autoCloseHours: number;
    };
    cron: {
        monthlyLeaderboard: string;
        roleCheck: string;
    };
};
export declare const BADGE_ROLE_NAMES: Record<string, string>;
export declare const COLORS: {
    primary: number;
    success: number;
    error: number;
    warning: number;
    info: number;
    gold: number;
    silver: number;
    bronze: number;
};
//# sourceMappingURL=config.d.ts.map