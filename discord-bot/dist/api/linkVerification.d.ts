export declare function verifyLinkingCode(discordId: string, code: string): {
    userId: string;
} | null;
export declare function sendLinkDm(discordId: string, code: string, websiteUsername: string): Promise<{
    success: boolean;
    message: string;
    error?: undefined;
} | {
    success: boolean;
    error: string;
    message?: undefined;
}>;
export declare function verifyLink(request: any): Promise<{
    valid: boolean;
    error: string;
    userId?: undefined;
    discordId?: undefined;
    discordUsername?: undefined;
} | {
    valid: boolean;
    userId: string;
    discordId: string;
    discordUsername: string;
    error?: undefined;
}>;
//# sourceMappingURL=linkVerification.d.ts.map