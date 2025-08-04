import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth';
import { hasGoogleCalendarAccess, getUserGoogleAccessToken, getUpcomingEvents, cleanupExpiredTokens } from '../../../../../lib/google-calendar';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Clean up expired tokens without refresh tokens
    await cleanupExpiredTokens(session.user.id);
    
    const hasAccess = await hasGoogleCalendarAccess(session.user.id);
    
    let upcomingEvents: any[] = [];
    let eventsError: string | null = null;
    
    if (hasAccess) {
      try {
        const accessToken = await getUserGoogleAccessToken(session.user.id);
        if (accessToken) {
          console.log('Fetching upcoming events for user:', session.user.id); // Debug logging
          upcomingEvents = await getUpcomingEvents(accessToken, 5);
          console.log('Found upcoming events:', upcomingEvents.length); // Debug logging
        } else {
          eventsError = 'Access token expired. Please re-authenticate.';
          console.log('No access token found for user:', session.user.id); // Debug logging
        }
      } catch (error) {
        console.error('Error fetching upcoming events:', error);
        eventsError = `Failed to fetch calendar events: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
    }

    return NextResponse.json({
      connected: hasAccess,
      upcomingEvents: hasAccess ? upcomingEvents : [],
      eventsError,
      userId: session.user.id
    });

  } catch (error) {
    console.error('Google Calendar status error:', error);
    return NextResponse.json({ 
      error: 'Failed to check calendar status',
      connected: false,
      upcomingEvents: []
    }, { status: 500 });
  }
}
