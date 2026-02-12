import { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      username: string;
      displayName?: string;
      elo: number;
      rankClass: string;
      hasCompletedOnboarding: boolean;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    username?: string;
    displayName?: string;
    elo?: number;
    rankClass?: string;
    hasCompletedOnboarding?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    email?: string;
    username?: string;
    displayName?: string;
    elo?: number;
    rankClass?: string;
    hasCompletedOnboarding?: boolean;
  }
}
