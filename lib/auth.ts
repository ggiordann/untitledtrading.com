import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { getQuery } from './database';

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          const user = await getQuery(
            'SELECT * FROM users WHERE username = ?',
            [credentials.username]
          );

          if (!user || !await bcrypt.compare(credentials.password, user.password)) {
            return null;
          }

          return {
            id: user.id.toString(),
            username: user.username,
            email: user.email
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }
      if (token.username) {
        session.user.username = token.username as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/secret/login'
  }
};
