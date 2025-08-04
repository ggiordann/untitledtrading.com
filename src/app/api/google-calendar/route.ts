import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { google } from 'googleapis';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    // Handle OAuth callback
    if (code) {
      const redirectUri = process.env.NODE_ENV === 'production' 
        ? 'https://untitledtrading.com/api/google-calendar'
        : 'http://localhost:3000/api/google-calendar';
        
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        redirectUri
      );

      try {
        // Exchange code for tokens
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // Save tokens to database for the user
        if (tokens.access_token) {
          const { runQuery } = await import('../../../../lib/database');
          await runQuery(
            `INSERT OR REPLACE INTO google_tokens (user_id, access_token, refresh_token, expires_at) 
             VALUES (?, ?, ?, ?)`,
            [
              session.user.id,
              tokens.access_token,
              tokens.refresh_token || null,
              tokens.expiry_date || null
            ]
          );
        }

        const redirectUrl = process.env.NODE_ENV === 'production'
          ? 'https://untitledtrading.com/secret?calendar=connected'
          : 'http://localhost:3000/secret?calendar=connected';

        return NextResponse.redirect(redirectUrl);
      } catch (error) {
        console.error('Error exchanging code for tokens:', error);
        const errorUrl = process.env.NODE_ENV === 'production'
          ? 'https://untitledtrading.com/secret?calendar=error'
          : 'http://localhost:3000/secret?calendar=error';
        
        return NextResponse.redirect(errorUrl);
      }
    }

    if (action === 'auth-url') {
      // Generate Google OAuth URL
      const redirectUri = process.env.NODE_ENV === 'production' 
        ? 'https://untitledtrading.com/api/google-calendar'
        : 'http://localhost:3000/api/google-calendar';
        
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        redirectUri
      );

      const scopes = ['https://www.googleapis.com/auth/calendar.readonly'];

      const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: scopes,
        state: session.user.username
      });

      return NextResponse.json({ authUrl: url });
    }

    return NextResponse.json({ message: 'Google Calendar integration - configure with your credentials' });
  } catch (error) {
    console.error('Error with Google Calendar:', error);
    return NextResponse.json({ error: 'Calendar service unavailable' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Placeholder for adding events to Google Calendar
    return NextResponse.json({ 
      message: 'Google Calendar integration ready - add your credentials to .env.local',
      note: 'Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET'
    });
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
