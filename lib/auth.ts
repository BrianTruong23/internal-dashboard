import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { userStorage } from "@/lib/users";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        console.log(`[Auth] Attempting login for: ${credentials.email}`);
        const user = userStorage.verify(credentials.email, credentials.password);
        
        if (user) {
          console.log(`[Auth] Login successful for: ${user.email}`);
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role, // Include role here
          };
        }
        
        console.log(`[Auth] Login failed for: ${credentials.email}`);
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
