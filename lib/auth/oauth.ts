export interface OAuthProvider {
  id: string;
  name: string;
  icon: string;
  authUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  scope: string;
  clientId: string;
  clientSecret: string;
}

export const oauthProviders: Record<string, OAuthProvider> = {
  google: {
    id: 'google',
    name: 'Google',
    icon: '🔵',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
    scope: 'openid email profile',
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  },
  github: {
    id: 'github',
    name: 'GitHub',
    icon: '⚫',
    authUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    userInfoUrl: 'https://api.github.com/user',
    scope: 'read:user user:email',
    clientId: process.env.GITHUB_CLIENT_ID || '',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
  },
  discord: {
    id: 'discord',
    name: 'Discord',
    icon: '🟣',
    authUrl: 'https://discord.com/api/oauth2/authorize',
    tokenUrl: 'https://discord.com/api/oauth2/token',
    userInfoUrl: 'https://discord.com/api/users/@me',
    scope: 'identify email',
    clientId: process.env.DISCORD_CLIENT_ID || '',
    clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
  },
};

export function getOAuthAuthorizationUrl(provider: string, state: string): string {
  const config = oauthProviders[provider];
  if (!config) {
    throw new Error(`Unknown OAuth provider: ${provider}`);
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/callback/${provider}`;
  
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: config.scope,
    state,
  });

  return `${config.authUrl}?${params.toString()}`;
}

export async function exchangeCodeForToken(provider: string, code: string): Promise<{
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
  id_token?: string;
}> {
  const config = oauthProviders[provider];
  if (!config) {
    throw new Error(`Unknown OAuth provider: ${provider}`);
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/callback/${provider}`;

  const params = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
  });

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    throw new Error(`Failed to exchange code for token: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchUserInfo(provider: string, accessToken: string): Promise<{
  id: string;
  email: string;
  name: string;
  image?: string;
}> {
  const config = oauthProviders[provider];
  if (!config) {
    throw new Error(`Unknown OAuth provider: ${provider}`);
  }

  const response = await fetch(config.userInfoUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user info: ${response.statusText}`);
  }

  const data = await response.json();

  // Normalize user data based on provider
  switch (provider) {
    case 'google':
      return {
        id: data.id,
        email: data.email,
        name: data.name,
        image: data.picture,
      };
    case 'github': {
      // GitHub may not return email if it's private - need to fetch from /user/emails
      let email = data.email;
      
      if (!email) {
        try {
          const emailResponse = await fetch('https://api.github.com/user/emails', {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: 'application/json',
            },
          });
          
          if (emailResponse.ok) {
            const emails = await emailResponse.json();
            // Find primary email, or first verified email, or first email
            const primaryEmail = emails.find((e: { primary: boolean; verified: boolean; email: string }) => e.primary && e.verified);
            const verifiedEmail = emails.find((e: { verified: boolean; email: string }) => e.verified);
            const firstEmail = emails[0];
            
            email = primaryEmail?.email || verifiedEmail?.email || firstEmail?.email;
          }
        } catch (emailError) {
          console.error('Failed to fetch GitHub emails:', emailError);
        }
      }
      
      if (!email) {
        throw new Error('Could not retrieve email from GitHub. Please make sure your GitHub account has a verified email address.');
      }
      
      return {
        id: data.id.toString(),
        email,
        name: data.name || data.login,
        image: data.avatar_url,
      };
    }
    case 'discord':
      return {
        id: data.id,
        email: data.email,
        name: data.username,
        image: data.avatar ? `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png` : undefined,
      };
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

