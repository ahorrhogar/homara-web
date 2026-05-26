import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";

import { db } from "./db";

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

  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false,
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
