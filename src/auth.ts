import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

// In production on Vercel, ensure NEXT_PUBLIC_APP_URL and AUTH_URL start with https://
// so that useSecureCookies is enabled and cookies use the __Host- prefix securely.
const isHttps = process.env.NEXT_PUBLIC_APP_URL?.startsWith("https://") || process.env.AUTH_URL?.startsWith("https://");
const useSecureCookies = process.env.NODE_ENV === "production" && Boolean(isHttps);

if (process.env.NODE_ENV === "production" && !process.env.AUTH_SECRET) {
  throw new Error("AUTH_SECRET environment variable is required in production");
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET || "",
    }),
  ],
  secret: process.env.AUTH_SECRET,
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

