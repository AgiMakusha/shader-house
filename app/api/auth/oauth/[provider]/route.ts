import { NextRequest, NextResponse } from 'next/server';
import { getOAuthAuthorizationUrl, oauthProviders } from '@/lib/auth/oauth';
import { v4 as uuidv4 } from 'uuid';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider } = await params;
    const searchParams = request.nextUrl.searchParams;
    
    // Get OAuth mode: 'login' (existing users only) or 'signup' (allow new users)
    const mode = searchParams.get('mode') || 'login';
    
    // Check if provider exists and is configured
    const providerConfig = oauthProviders[provider];
    if (!providerConfig) {
      return NextResponse.redirect(new URL('/login?error=invalid_provider', request.url));
    }
    
    if (!providerConfig.clientId || !providerConfig.clientSecret) {
      console.error(`OAuth provider ${provider} is not configured. Missing credentials.`);
      return NextResponse.redirect(
        new URL(`/login?error=oauth_not_configured&provider=${provider}`, request.url)
      );
    }
    
    // Generate a state parameter for CSRF protection
    const state = uuidv4();
    
    // Store state in a cookie for verification later
    const response = NextResponse.redirect(getOAuthAuthorizationUrl(provider, state));
    response.cookies.set('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10 minutes
    });
    
    // Store OAuth mode in cookie to check in callback
    response.cookies.set('oauth_mode', mode, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10 minutes
    });
    
    return response;
  } catch (error) {
    console.error('OAuth initiation error:', error);
    return NextResponse.redirect(new URL('/login?error=oauth_init_failed', request.url));
  }
}

