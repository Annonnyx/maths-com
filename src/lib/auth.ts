import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import DiscordProvider from 'next-auth/providers/discord';

export const authOptions: NextAuthOptions = {
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    ...(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET
      ? [
          DiscordProvider({
            clientId: process.env.DISCORD_CLIENT_ID,
            clientSecret: process.env.DISCORD_CLIENT_SECRET,
            authorization: {
              params: {
                scope: 'identify email',
                response_type: 'code',
              },
            },
          }),
        ]
      : []),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email ou Pseudo', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: any) {
        console.log('🔐 Authorize callback:', { email: credentials?.email });
        
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Credentials manquants');
          return null;
        }

        try {
          console.log('🔍 Recherche utilisateur...');
          // Vérifier si c'est un email ou un username
          const isEmail = credentials.email.includes('@');
          
          const user = await Promise.race([
            prisma.user.findFirst({
              where: isEmail ? 
                { email: credentials.email } : 
                { username: credentials.email }
            }),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('DB timeout')), 10000)
            )
          ]) as any;

          console.log('👤 Utilisateur trouvé:', user ? 'OUI' : 'NON', 'Type:', isEmail ? 'email' : 'username');

          if (!user || !user.password) {
            console.log('❌ Utilisateur sans mot de passe');
            return null;
          }

          console.log('🔑 Vérification mot de passe...');
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          console.log('🔐 Mot de passe valide:', isPasswordValid);

          if (!isPasswordValid) {
            return null;
          }

          console.log('✅ Autorisation réussie pour:', user.id);
          return {
            id: user.id,
            email: user.email,
            username: user.username,
            displayName: user.displayName,
            soloElo: user.soloElo,
            soloRankClass: user.soloRankClass,
            multiplayerElo: user.multiplayerElo,
            multiplayerRankClass: user.multiplayerRankClass,
            hasCompletedOnboarding: user.hasCompletedOnboarding,
          } as any;
        } catch (error) {
          console.error('💥 Authorize error:', error);
          return null;
        }
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
      console.log('🔐 SignIn callback:', { provider: account?.provider, email: user.email });
      
      if (account?.provider === 'google' || account?.provider === 'discord') {
        try {
          console.log('🔍 Recherche utilisateur OAuth...');
          let existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });

          if (!existingUser) {
            console.log('👤 Création nouvel utilisateur OAuth...');
            const username = user.email!.split('@')[0] + Math.random().toString(36).substring(2, 6);
            existingUser = await prisma.user.create({
              data: {
                email: user.email!,
                username: username,
                displayName: user.name || username,
                avatarUrl: user.image,
                soloElo: 400,
                soloRankClass: 'F-',
                multiplayerElo: 400,
                multiplayerRankClass: 'F-',
                hasCompletedOnboarding: false,
              },
            });
            console.log('✅ Utilisateur OAuth créé:', existingUser.id);
          } else {
            console.log('👤 Utilisateur OAuth existant:', existingUser.id);
          }
          
          (user as any).id = existingUser.id;
          (user as any).username = existingUser.username;
          (user as any).displayName = existingUser.displayName;
          (user as any).soloElo = existingUser.soloElo;
          (user as any).soloRankClass = existingUser.soloRankClass;
          (user as any).hasCompletedOnboarding = existingUser.hasCompletedOnboarding;
          return true;
        } catch (error) {
          console.error('❌ OAuth sign in error:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }: any) {
      console.log('🔑 JWT callback:', { hasUser: !!user, hasAccount: !!account });
      
      // Initial sign in - persist user data to token
      if (user) {
        token.id = (user as any).id;
        token.email = (user as any).email;
        token.username = (user as any).username;
        token.displayName = (user as any).displayName;
        token.soloElo = (user as any).soloElo;
        token.soloRankClass = (user as any).soloRankClass;
        token.multiplayerElo = (user as any).multiplayerElo;
        token.multiplayerRankClass = (user as any).multiplayerRankClass;
        token.hasCompletedOnboarding = (user as any).hasCompletedOnboarding;
        console.log('✅ Token updated with user data');
      }
      return token;
    },
    async session({ session, token }: any) {
      console.log('📝 Session callback:', { hasToken: !!token });
      
      if (token) {
        session.user = session.user ?? {};
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.username = token.username;
        session.user.displayName = token.displayName;
        session.user.soloElo = token.soloElo;
        session.user.soloRankClass = token.soloRankClass;
        session.user.multiplayerElo = token.multiplayerElo;
        session.user.multiplayerRankClass = token.multiplayerRankClass;
        session.user.hasCompletedOnboarding = token.hasCompletedOnboarding;
        console.log('✅ Session updated');
      }
      return session;
    },
  },
  events: {
    async signIn(message: any) {
      console.log('🎉 SignIn event:', message);
    },
    async signOut(message: any) {
      console.log('👋 SignOut event:', message);
    },
  },
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/login',
    newUser: '/register',
  },
};
