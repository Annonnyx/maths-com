import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = async (req: Request, context: any) => {
  try {
    console.log('NextAuth handler called:', req.method, req.url);
    const response = await NextAuth(authOptions)(req, context);
    return response;
  } catch (error) {
    console.error('NextAuth handler error:', error);
    throw error;
  }
};

export { handler as GET, handler as POST };
