# LTI 1.3 Setup Guide

## Overview

The app now supports LTI 1.3 launches from TimeBack. Students authenticate through TimeBack and are redirected to our app with their identity.

---

## Environment Variables

Add these to your `.env.local`:

```bash
# LTI 1.3 Configuration (from TimeBack Platform - App Onboarding Guide)
TIMEBACK_JWKS_URL=https://jherbpzmm0.execute-api.us-east-1.amazonaws.com/api/.well-known/jwks.json
TIMEBACK_LTI_AUDIENCE=mathfacts-acquisition
TIMEBACK_LTI_ISSUER=https://timeback.com
```

**Note:** These are the production values from the official guide. TimeBack may update the audience value during registration.

---

## LTI Launch Flow

```
1. Student clicks app in TimeBack
   ↓
2. TimeBack generates JWT with student identity
   ↓
3. POST to https://mathfacts-acquisition-production.up.railway.app/api/lti/launch
   ↓
4. We verify JWT against TimeBack's JWKS
   ↓
5. Extract user info (userId, name, email, roles)
   ↓
6. Create session cookie
   ↓
7. Redirect to app homepage
   ↓
8. Student uses app with their identity
   ↓
9. On lesson completion → submit to TimeBack with real student ID
```

---

## Implementation Files

### Core Files:
- `lib/lti/verify.ts` - JWT verification using JWKS
- `lib/lti/session.ts` - Session management (cookie-based)
- `app/api/lti/launch/route.ts` - LTI launch endpoint

### Updated Files:
- `app/lesson/[id]/page.tsx` - Uses session for student ID
- `app/assessment/page.tsx` - Uses session for student ID

---

## Testing

### Local Testing:
1. Install packages: `npm install`
2. Start dev server: `npm run dev`
3. Test endpoint: `curl http://localhost:3000/api/lti/launch` (should return health check)

### Production Testing (with TimeBack):
1. Deploy to Railway (already done)
2. Email TimeBack team with LTI details (see REGISTRATION.md)
3. They configure your app in alpha.timeback.com
4. Launch from TimeBack as test student
5. Verify:
   - JWT validates correctly
   - Session created
   - Redirects to app
   - Lesson completion submits with real student ID

---

## Registration Details for TimeBack

**LTI launch URL:**
```
https://mathfacts-acquisition-production.up.railway.app/api/lti/launch
```

**LTI "audience":**
```
mathfacts-acquisition
```

**LTI v1.3 Compliance:**
```
Yes
```

**Landing URL:**
```
https://mathfacts-acquisition-production.up.railway.app/
```

**Provisioning Method:**
```
Automatic (users created on first launch)
```

---

## Troubleshooting

### "Invalid LTI token" error:
- Check JWKS_URL is correct
- Verify AUDIENCE matches what TimeBack sends
- Check ISSUER matches TimeBack's platform URL

### Session not persisting:
- Ensure cookies are enabled
- Check cookie `sameSite` and `secure` settings match environment
- Verify SESSION_MAX_AGE is reasonable (24 hours)

### Student ID showing as "demo-student":
- Session not created properly
- Check LTI launch flow in logs
- Verify `createSession()` is being called

---

## Security Notes

- JWT tokens are verified against TimeBack's public keys (JWKS)
- Sessions are stored in httpOnly cookies (not accessible to JavaScript)
- Sessions expire after 24 hours
- In production, cookies are marked as `secure` (HTTPS only)
- Token verification happens on every launch

---

## Next Steps

1. ✅ LTI endpoint implemented
2. ✅ Session management working
3. ✅ Student ID from session
4. ⏳ Get values from TimeBack team for JWKS_URL, AUDIENCE, ISSUER
5. ⏳ Test LTI launch from alpha.timeback.com
6. ⏳ Verify result submission with real student IDs

