# Better-Auth Migration Plan - Replace LTI with Cognito OAuth

## Overview

Switching from LTI 1.3 to better-auth with Cognito OAuth. Students will login directly via Cognito (which TimeBack uses), allowing seamless authentication without LTI complexity.

---

## Why Better-Auth?

From llamalit reference:
- Direct Cognito OAuth integration
- Automatic account linking
- Session management built-in
- Works with TimeBack's existing Cognito user pool
- Simpler than LTI (no JWT verification, no launch endpoints)

---

## Implementation Steps

### Step 1: Remove LTI Code (30 mins)

**Delete:**
- `lib/lti/verify.ts`
- `lib/lti/session.ts`
- `lib/lti/getUserServer.ts`
- `app/api/lti/launch/route.ts`
- `LTI-SETUP.md`

**Remove from package.json:**
- `aws-jwt-verify`
- `jose`

### Step 2: Install Better-Auth (5 mins)

```bash
npm install better-auth drizzle-orm postgres
npm install -D drizzle-kit
```

### Step 3: Create Database Schema (15 mins)

Create `lib/schema.ts` (from llamalit pattern):

```typescript
import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()).notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()).notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()).notNull(),
});
```

### Step 4: Setup Drizzle & Database (20 mins)

Create `lib/db.ts`:

```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);

export const db = drizzle(client);
```

Create `drizzle.config.ts`:

```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './lib/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

Run migrations:
```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

### Step 5: Create Better-Auth Instance (10 mins)

Create `lib/auth.ts`:

```typescript
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";
import * as schema from "@/lib/schema";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL,
  trustedOrigins: [
    "http://localhost:3000",
    "https://mathfacts-acquisition-production.up.railway.app"
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
      clientId: process.env.COGNITO_CLIENT_ID as string,
      clientSecret: process.env.COGNITO_CLIENT_SECRET as string,
      domain: process.env.COGNITO_DOMAIN as string,
      region: process.env.COGNITO_REGION as string,
      userPoolId: process.env.COGNITO_USERPOOL_ID as string,
    },
  },
});

export async function getSession() {
  return auth.api.getSession({
    headers: await import('next/headers').then(m => m.headers()),
  });
}
```

### Step 6: Create Auth Client (5 mins)

Create `lib/auth-client.ts`:

```typescript
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
});

export { useSession } from "better-auth/react";
```

### Step 7: Create Auth Route Handler (2 mins)

Create `app/api/auth/[...all]/route.ts`:

```typescript
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler(auth);
```

### Step 8: Add Login Button (10 mins)

On home page, add:

```typescript
import { authClient, useSession } from '@/lib/auth-client';

export default function HomePage() {
  const { data: session } = useSession();
  
  if (!session) {
    return (
      <button onClick={() => authClient.signIn.social({ provider: "cognito" })}>
        Login with TimeBack
      </button>
    );
  }
  
  // Show lessons...
}
```

### Step 9: Update Result Submission (5 mins)

In `app/api/submit-result/route.ts`:

```typescript
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await import('next/headers').then(m => m.headers()),
  });
  
  const studentId = session?.user?.id || 'demo-student';
  
  // Submit to TimeBack...
}
```

### Step 10: Update Environment Variables (2 mins)

Already in `.env.local`:
```
COGNITO_CLIENT_ID=3bu9iphl652rnv27b2khaoipso
COGNITO_CLIENT_SECRET=1232ube4g7lbuig293mktg6b2m3a635votg6eppa981494saad4b
COGNITO_DOMAIN=https://prod-beyond-timeback-api-2-idp.auth.us-east-1.amazoncognito.com
COGNITO_REGION=us-east-1
COGNITO_USERPOOL_ID=us-east-1_3uhuoRM3R
DATABASE_URL=postgresql://... (already have)
```

Add:
```
BETTER_AUTH_URL=https://mathfacts-acquisition-production.up.railway.app
NEXT_PUBLIC_APP_URL=https://mathfacts-acquisition-production.up.railway.app
```

### Step 11: Update Registration Email (5 mins)

Change:
```
Auth Method: LTI
```

To:
```
Auth Method: Cognito OAuth (via better-auth)
```

Remove all LTI fields (launch URL, audience, etc.)

---

## Total Time: ~2 hours

---

## Testing Flow

1. Student goes to https://mathfacts-acquisition-production.up.railway.app
2. Clicks "Login with TimeBack"
3. Redirects to Cognito (TimeBack login)
4. Student logs in with TimeBack credentials
5. Redirects back to app with session
6. Student completes lessons
7. Results submit to TimeBack with real student ID

---

## Benefits vs LTI

- No LTI launch complexity
- No JWT verification
- Direct database integration
- Students can bookmark app directly
- Works standalone AND with TimeBack
- Simpler to test (just login with Cognito)

---

## Next Steps

1. Implement steps 1-10 above
2. Test locally with Cognito login
3. Deploy to Railway
4. Update registration email
5. Send to TimeBack

Ready to start? This is way simpler than LTI!

