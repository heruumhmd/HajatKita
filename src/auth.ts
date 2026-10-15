import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

// In production on Vercel, ensure NEXT_PUBLIC_APP_URL and/or AUTH_URL start with "https://".
// REQUIREMENTS FOR __Host- COOKIE PREFIX IN PRODUCTION:
// 1. Both process.env.NODE_ENV must be "production" and the configured URL must strictly start with "https://".
// 2. If NEXT_PUBLIC_APP_URL or AUTH_URL is set to http:// in production, useSecureCookies evaluates to false,
//    disabling the '__Host-' prefix and secure flag on session cookies. This can cause session dropouts,
//    prevent session cookies from persisting across tabs/devices, and trigger authentication sync failures.
// 3. For local development, http://localhost:3000 is used and useSecureCookies is disabled automatically.
const isHttps = process.env.NEXT_PUBLIC_APP_URL?.startsWith("https://") || process.env.AUTH_URL?.startsWith("https://");
const useSecureCookies = process.env.NODE_ENV === "production" && Boolean(isHttps);

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

