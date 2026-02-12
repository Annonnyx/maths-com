import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import DiscordProvider from 'next-auth/providers/discord';
import FacebookProvider from 'next-auth/providers/facebook';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID || '',
      clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || '',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email ou Pseudo', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: any) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: credentials.email },
              { username: credentials.email }
            ]
          },
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          username: user.username,
          displayName: user.displayName,
          elo: user.elo,
          rankClass: user.rankClass,
          hasCompletedOnboarding: user.hasCompletedOnboarding,
        } as any;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  callbacks: {
    async signIn({ user, account }: any) {
      if (account?.provider === 'google' || account?.provider === 'discord' || account?.provider === 'facebook') {
        try {
          let existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });

          if (!existingUser) {
            const username = user.email!.split('@')[0] + Math.random().toString(36).substring(2, 6);
            existingUser = await prisma.user.create({
              data: {
                email: user.email!,
                username: username,
                displayName: user.name || username,
                avatarUrl: user.image,
                elo: 400,
                rankClass: 'F-',
                hasCompletedOnboarding: false,
              },
            });
            (user as any).id = existingUser.id;
            (user as any).username = existingUser.username;
            (user as any).displayName = existingUser.displayName;
            (user as any).elo = existingUser.elo;
            (user as any).rankClass = existingUser.rankClass;
            (user as any).hasCompletedOnboarding = existingUser.hasCompletedOnboarding;
          } else {
            (user as any).id = existingUser.id;
            (user as any).username = existingUser.username;
            (user as any).displayName = existingUser.displayName;
            (user as any).elo = existingUser.elo;
            (user as any).rankClass = existingUser.rankClass;
            (user as any).hasCompletedOnboarding = existingUser.hasCompletedOnboarding;
          }
          return true;
        } catch (error) {
          console.error('OAuth sign in error:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }: any) {
      // Initial sign in - persist user data to token
      if (user) {
        token.id = (user as any).id;
        token.email = (user as any).email;
        token.username = (user as any).username;
        token.displayName = (user as any).displayName;
        token.elo = (user as any).elo;
        token.rankClass = (user as any).rankClass;
        token.hasCompletedOnboarding = (user as any).hasCompletedOnboarding;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.username = token.username;
        session.user.displayName = token.displayName;
        session.user.elo = token.elo;
        session.user.rankClass = token.rankClass;
        session.user.hasCompletedOnboarding = token.hasCompletedOnboarding;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/login',
    newUser: '/register',
  },
};
