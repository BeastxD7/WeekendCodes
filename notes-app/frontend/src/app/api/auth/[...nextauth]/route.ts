import NextAuth, { Session, DefaultSession, User } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@/generated/prisma";
import { JWT } from "next-auth/jwt";
import { log } from "node:console";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      username?: string;
    } & DefaultSession["user"];
  }
  interface User {
    id: string;
    username?: string;
  }
}

const prisma = new PrismaClient();

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      // On initial sign in, add id and username from user object
      if (user) {
        console.log("User object on JWT callback:", user);
        
        token.id = user.id;
        token.username = user.username;
      } else if (!token.username && token.id) {
        // On subsequent calls without user, load username from DB if missing
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { username: true },
        });
        token.username = dbUser?.username;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string | undefined;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }: { user: { id: string; email?: string | null } }) {
      if (user.email) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            // Automatically set username as email prefix
            username: user.email.split("@")[0],
          },
        });
      }
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
