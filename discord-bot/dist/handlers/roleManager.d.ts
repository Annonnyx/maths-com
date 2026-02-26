import { Guild, GuildMember } from 'discord.js';
export declare function updateUserRoles(member: GuildMember, badges: string[], elo: number, rank: number, frenchClass?: string): Promise<void>;
export declare function updateMonthlyTop1(newTop1UserId: string): Promise<void>;
export declare function updateAllUserRoles(): Promise<void>;
export declare function ensureClassRolesExist(guild: Guild): Promise<void>;
//# sourceMappingURL=roleManager.d.ts.map