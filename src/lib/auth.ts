import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";

import { db } from "./db";
import { isSuperadmin } from "./superadmin";

const secret = process.env.BETTER_AUTH_SECRET;
if (!secret && process.env.NODE_ENV === "production") {
  throw new Error("BETTER_AUTH_SECRET must be set in production");
}

export const auth = betterAuth({
  database: prismaAdapter(db, { provider: "postgresql" }),
  secret: secret ?? "dev-only-fallback-secret",
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",

  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    minPasswordLength: 12,
  },

  databaseHooks: {
    user: {
      create: {
        // Single chokepoint for account creation: only SUPERADMIN_EMAILS
        // addresses may ever get an account, regardless of entry point (the
        // /admin/registro server action OR the public /api/auth/sign-up/email
        // endpoint that better-auth mounts). Without this, the public endpoint
        // bypasses the isSuperadmin gate in the signup action.
        before: async (user) => {
          if (!isSuperadmin(user.email)) {
            throw new APIError("FORBIDDEN", { message: "Email no autorizado." });
          }
          return { data: user };
        },
      },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },

  advanced: {
    cookiePrefix: "homara",
  },

  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
