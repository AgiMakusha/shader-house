import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken, fetchUserInfo } from '@/lib/auth/oauth';
import { prisma } from '@/lib/db/prisma';
import { createSession } from '@/lib/auth/session';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider } = await params;
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Check for OAuth errors
    if (error) {
      console.error('OAuth error:', error);
      return NextResponse.redirect(new URL(`/login?error=oauth_${error}`, request.url));
    }

    if (!code) {
      return NextResponse.redirect(new URL('/login?error=no_code', request.url));
    }

    // Verify state parameter (CSRF protection)
    const storedState = request.cookies.get('oauth_state')?.value;
    if (!storedState || storedState !== state) {
      return NextResponse.redirect(new URL('/login?error=invalid_state', request.url));
    }

    // Exchange code for access token
    const tokens = await exchangeCodeForToken(provider, code);
    
    // Fetch user info
    const userInfo = await fetchUserInfo(provider, tokens.access_token);

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email: userInfo.email },
      include: { accounts: true },
    });

    if (user) {
      // Check if this OAuth account is already linked
      const existingAccount = user.accounts.find(
        (acc) => acc.provider === provider && acc.providerAccountId === userInfo.id
      );

      if (!existingAccount) {
        // Link this OAuth account to the existing user
        await prisma.account.create({
          data: {
            userId: user.id,
            type: 'oauth',
            provider,
            providerAccountId: userInfo.id,
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            expires_at: tokens.expires_in ? Math.floor(Date.now() / 1000) + tokens.expires_in : null,
            token_type: tokens.token_type,
            scope: tokens.scope,
            id_token: tokens.id_token,
          },
        });
      }

      // Update user info if needed
      if (!user.emailVerified) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            emailVerified: new Date(),
            image: user.image || userInfo.image,
          },
        });
      }
    } else {
      // Create new user with OAuth account
      user = await prisma.user.create({
        data: {
          email: userInfo.email,
          name: userInfo.name,
          emailVerified: new Date(),
          image: userInfo.image,
          accounts: {
            create: {
              type: 'oauth',
              provider,
              providerAccountId: userInfo.id,
              access_token: tokens.access_token,
              refresh_token: tokens.refresh_token,
              expires_at: tokens.expires_in ? Math.floor(Date.now() / 1000) + tokens.expires_in : null,
              token_type: tokens.token_type,
              scope: tokens.scope,
              id_token: tokens.id_token,
            },
          },
        },
      });
    }

    // Create session
    await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role.toLowerCase() as 'developer' | 'gamer',
      createdAt: user.createdAt.getTime(),
    }, true);

    // Clear OAuth state cookie
    const response = NextResponse.redirect(new URL('/register', request.url));
    response.cookies.delete('oauth_state');
    
    return response;
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(new URL('/login?error=oauth_callback_failed', request.url));
  }
}

