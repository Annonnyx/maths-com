import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import DiscordProvider from 'next-auth/providers/discord';

// Adjectives and nouns for generating random usernames
const ADJECTIVES = [
  'rapide', 'sage', 'futé', 'agile', 'brillant', 'vif', 'audacieux', 'malin',
  'calcul', 'logique', 'précis', 'expert', 'maître', 'génie', 'stratège',
  'penseur', 'analyste', 'mathématicien', 'calculateur', 'virtuose',
  'lumineux', 'astucieux', 'déterminé', 'fougueux', 'adroit',
  'magique', 'numérique', 'quantique', 'algébrique', 'géométrique'
];

const NOUNS = [
  'tigre', 'aigle', 'faucon', 'loup', 'panthère', 'dragon', 'phénix', 'lion',
  'cerveau', 'ordinateur', 'algorithme', 'équation', 'théorème', 'axiome',
  'maître', 'champion', 'prodige', 'virtuose', 'stratège', 'génie',
  'calculateur', 'analyste', 'mathématicien', 'logicien', 'penseur',
  'architecte', 'constructeur', 'résolveur', 'explorateur', 'navigateur'
];

// Generate a random username in format: adjective_noun_number
async function generateUniqueUsername(): Promise<string> {
  let attempts = 0;
  const maxAttempts = 100;
  
  while (attempts < maxAttempts) {
    const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const number = Math.floor(Math.random() * 9999).toString().padStart(2, '0');
    const username = `${adjective}_${noun}_${number}`;
    
    // Check if username already exists
    const existing = await prisma.user.findUnique({
      where: { username }
    });
    
    if (!existing) {
      return username;
    }
    
    attempts++;
  }
  
  // Fallback with timestamp if all attempts failed
  const timestamp = Date.now().toString(36).substring(2, 8);
  return `math_user_${timestamp}`;
}

// Debug des variables d'environnement
const isDev = process.env.NODE_ENV === 'development';
const nextAuthUrl = isDev ? 'http://localhost:3000' : (process.env.NEXTAUTH_URL || 'https://maths-app.com');

console.log('🔧 Environment:', isDev ? 'DEVELOPMENT' : 'PRODUCTION');
console.log('🔧 NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? 'DEFINED' : 'MISSING');
console.log('🔧 NEXTAUTH_URL:', nextAuthUrl);
console.log('🔧 GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'DEFINED' : 'MISSING');
console.log('🔧 DISCORD_CLIENT_ID:', process.env.DISCORD_CLIENT_ID ? 'DEFINED' : 'MISSING');

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
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
            isTeacher: user.isTeacher,
            isAdmin: user.isAdmin,
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
            const username = await generateUniqueUsername();
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
      
      // Gérer les connexions par email/mot de passe (Credentials)
      if (account?.provider === 'credentials') {
        try {
          console.log('🔍 Recherche utilisateur Credentials...');
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });

          if (!existingUser) {
            console.log('❌ Utilisateur Credentials non trouvé');
            return false;
          }
          
          console.log('👤 Utilisateur Credentials trouvé:', existingUser.id);
          (user as any).id = existingUser.id;
          (user as any).username = existingUser.username;
          (user as any).displayName = existingUser.displayName;
          (user as any).soloElo = existingUser.soloElo;
          (user as any).soloRankClass = existingUser.soloRankClass;
          (user as any).multiplayerElo = existingUser.multiplayerElo;
          (user as any).multiplayerRankClass = existingUser.multiplayerRankClass;
          (user as any).hasCompletedOnboarding = existingUser.hasCompletedOnboarding;
          (user as any).isTeacher = existingUser.isTeacher;
          (user as any).isAdmin = existingUser.isAdmin;
          return true;
        } catch (error) {
          console.error('❌ Credentials sign in error:', error);
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
        token.isTeacher = (user as any).isTeacher;
        token.isAdmin = (user as any).isAdmin;
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
        session.user.isTeacher = token.isTeacher;
        session.user.isAdmin = token.isAdmin;
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
