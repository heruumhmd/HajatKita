import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const isProduction = process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL);

// Always ensure production OAuth callback domain is https://hajatkita.vercel.app when running in production
if (isProduction) {
  const productionBase = "https://hajatkita.vercel.app";
  if (!process.env.AUTH_URL || process.env.AUTH_URL.includes("localhost")) {
    process.env.AUTH_URL = productionBase;
  }
  if (!process.env.NEXTAUTH_URL || process.env.NEXTAUTH_URL.includes("localhost")) {
    process.env.NEXTAUTH_URL = productionBase;
  }
}

const isHttps = process.env.AUTH_URL?.startsWith("https://") || isProduction;
const useSecureCookies = isProduction && Boolean(isHttps);

if (process.env.NODE_ENV === "production" && !process.env.AUTH_SECRET) {
  throw new Error("AUTH_SECRET environment variable is required in production");
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  callbacks: {
    async session({ session, token }) {
      if (token?.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});

