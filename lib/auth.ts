/**
 * Better-Auth configuration with Cognito OAuth
 * Students login via TimeBack's Cognito user pool
 */

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";
import * as schema from "@/lib/schema";
import { headers } from "next/headers";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  trustedOrigins: [
    "http://localhost:3000",
    "https://mathfacts-acquisition-production.up.railway.app",
    "https://alpha.timeback.com"
  ],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  socialProviders: {
    cognito: {
      clientId: process.env.COGNITO_CLIENT_ID!,
      clientSecret: process.env.COGNITO_CLIENT_SECRET!,
      domain: process.env.COGNITO_DOMAIN!,
      region: process.env.COGNITO_REGION!,
      userPoolId: process.env.COGNITO_USERPOOL_ID!,
    },
  },
});

/**
 * Get current session (server-side)
 */
export async function getSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

