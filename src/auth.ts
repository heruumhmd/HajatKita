import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const isHttps = process.env.NEXT_PUBLIC_APP_URL?.startsWith("https://") || process.env.AUTH_URL?.startsWith("https://");
const useSecureCookies = process.env.NODE_ENV === "production" && Boolean(isHttps);

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET || "",
    }),
  ],
  secret: process.env.AUTH_SECRET || "hajatkita_9f8c2b7e1a4d6f038592c1e7a4b8d0e5_wedding_secure_key",
  trustHost: true,
  useSecureCookies,
  cookies: {
    csrfToken: {
      name: useSecureCookies ? "__Host-authjs.csrf-token" : "authjs.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
  },
  callbacks: {
    async session({ session, token }) {
      if (token?.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});

