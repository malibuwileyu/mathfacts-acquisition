/**
 * TimeBack Authentication
 * OAuth 2.0 client credentials (machine-to-machine)
 */

let cachedToken: { token: string; expiresAt: number } | null = null;

export async function getTimebackToken(): Promise<string> {
  // Return cached token if still valid
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const cognitoUrl = process.env.TIMEBACK_COGNITO_BASE_URL!;
  const clientId = process.env.TIMEBACK_CLIENT_ID!;
  const clientSecret = process.env.TIMEBACK_CLIENT_SECRET!;

  const response = await fetch(`${cognitoUrl}/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      scope: 'https://purl.imsglobal.org/spec/or/v1p1/scope/admin'
    })
  });

  if (!response.ok) {
    throw new Error(`TimeBack auth failed: ${response.status}`);
  }

  const data = await response.json();
  
  // Cache token (expires in 1 hour, refresh at 55 mins)
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (55 * 60 * 1000)
  };

  return data.access_token;
}

