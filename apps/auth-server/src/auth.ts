import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { jwt, openAPI, organization as organizationPlugin } from "better-auth/plugins";
import { drizzle } from "drizzle-orm/tursodatabase/database";
import { account, session, user, verification } from "./schema/core";
import { invitation, member, organization } from "./schema/organization";
import { relations } from "./schema/relations";

const db = drizzle(process.env.DATABASE_URL!, {
  schema: { user, session, account, verification, invitation, member, organization },
  relations,
});

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "sqlite" }),
  secret: process.env.AUTH_SECRET,

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    autoSignIn: false,
  },

  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {},
  },

  experimental: { joins: true },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 ^ 60,
    },
  },

  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  plugins: [
    jwt(),
    organizationPlugin({
      allowUserToCreateOrganization: (user) => {
        return true;
      },
    }),
    openAPI(),
  ],
});
