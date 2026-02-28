export declare const supabase: import("@supabase/supabase-js").SupabaseClient<any, "public", "public", any, any>;
export declare const discordDb: {
    createLinkCode(discordUserId: string, code: string): Promise<any>;
    verifyLinkCode(code: string): Promise<{
        valid: boolean;
        error: string;
        data?: undefined;
    } | {
        valid: boolean;
        data: any;
        error?: undefined;
    }>;
    markCodeAsUsed(codeId: string): Promise<void>;
    createUserLink(supabaseUserId: string, discordUserId: string): Promise<any>;
    getUserLink(discordUserId: string): Promise<any>;
    deactivateUserLink(discordUserId: string): Promise<void>;
    getUserProfile(supabaseUserId: string): Promise<any>;
};
//# sourceMappingURL=supabase.d.ts.map