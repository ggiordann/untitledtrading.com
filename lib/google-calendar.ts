import { getQuery, runQuery } from './database-vercel';
import { google } from 'googleapis';

export async function getUserGoogleAccessToken(userId: string): Promise<string | null> {
  try {
    const tokenData = await getQuery(
      'SELECT access_token, refresh_token, expires_at FROM google_tokens WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [userId]
    );

    if (!tokenData || !tokenData.access_token) {
      return null;
    }

    // Check if token is expired (with 5 minute buffer)
    if (tokenData.expires_at && tokenData.expires_at < Date.now() + 300000) {
      // Token is expired or about to expire, try to refresh it
      if (tokenData.refresh_token) {
        const refreshedToken = await refreshGoogleToken(userId, tokenData.refresh_token);
        if (refreshedToken) {
          return refreshedToken;
        }
      }
      // If refresh failed or no refresh token, return null
      return null;
    }

    return tokenData.access_token;
  } catch (error) {
    console.error('Error getting Google access token:', error);
    return null;
  }
}

async function refreshGoogleToken(userId: string, refreshToken: string): Promise<string | null> {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.NODE_ENV === 'production' 
        ? 'https://www.untitledtrading.com/api/google-calendar'
        : 'http://localhost:3000/api/google-calendar'
    );

    oauth2Client.setCredentials({ refresh_token: refreshToken });
    
    // Refresh the access token
    const { credentials } = await oauth2Client.refreshAccessToken();
    
    if (credentials.access_token) {
      // Update the database with new tokens
      await runQuery(
        `UPDATE google_tokens 
         SET access_token = $1, expires_at = $2, updated_at = CURRENT_TIMESTAMP 
         WHERE user_id = $3`,
        [
          credentials.access_token,
          credentials.expiry_date || (Date.now() + 3600000), // Default to 1 hour if no expiry
          userId
        ]
      );
      
      return credentials.access_token;
    }
    
    return null;
  } catch (error) {
    console.error('Error refreshing Google token:', error);
    return null;
  }
}

export async function hasGoogleCalendarAccess(userId: string): Promise<boolean> {
  const token = await getUserGoogleAccessToken(userId);
  return token !== null;
}

export async function cleanupExpiredTokens(userId: string): Promise<void> {
  try {
    // Remove tokens that are expired and have no refresh token
    await runQuery(
      `DELETE FROM google_tokens 
       WHERE user_id = $1 AND expires_at < $2 AND refresh_token IS NULL`,
      [userId, Date.now()]
    );
  } catch (error) {
    console.error('Error cleaning up expired tokens:', error);
  }
}

// Helper function to get Google Calendar client
export async function getCalendarClient(accessToken: string) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NODE_ENV === 'production' 
      ? 'https://www.untitledtrading.com/api/google-calendar'
      : 'http://localhost:3000/api/google-calendar'
  );

  oauth2Client.setCredentials({ access_token: accessToken });
  return google.calendar({ version: 'v3', auth: oauth2Client });
}

// Get upcoming calendar events with Adelaide timezone
export async function getUpcomingEvents(accessToken: string, maxResults = 10) {
  try {
    console.log('Getting calendar client with token:', accessToken ? 'Token exists' : 'No token'); // Debug logging
    const calendar = await getCalendarClient(accessToken);
    
    const timeMin = new Date().toISOString();
    console.log('Fetching events from:', timeMin); // Debug logging
    
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin,
      maxResults,
      singleEvents: true,
      orderBy: 'startTime',
      timeZone: 'Australia/Adelaide'
    });

    const events = response.data.items || [];
    console.log('Retrieved events:', events.length); // Debug logging
    return events;
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message, error.stack); // More detailed error logging
    }
    return [];
  }
}

// Create a calendar event with Adelaide timezone
export async function createCalendarEvent(accessToken: string, eventData: any) {
  try {
    const calendar = await getCalendarClient(accessToken);
    
    // Parse the date/time and ensure it's in Adelaide timezone
    const startTime = new Date(eventData.startTime);
    const endTime = new Date(eventData.endTime);
    
    const event = {
      summary: eventData.title,
      description: eventData.description || '',
      start: {
        dateTime: startTime.toISOString(),
        timeZone: 'Australia/Adelaide',
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'Australia/Adelaide',
      },
      location: eventData.location || '',
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });

    return response.data;
  } catch (error) {
    console.error('Error creating calendar event:', error);
    throw error;
  }
}

// Get today's events summary for Adelaide timezone
export async function getTodaysEventsSummary(accessToken: string): Promise<string> {
  try {
    const calendar = await getCalendarClient(accessToken);
    
    // Get start and end of today in Adelaide timezone
    const now = new Date();
    const adelaide = new Date(now.toLocaleString("en-US", {timeZone: "Australia/Adelaide"}));
    
    const startOfDay = new Date(adelaide);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(adelaide);
    endOfDay.setHours(23, 59, 59, 999);
    
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      timeZone: 'Australia/Adelaide'
    });

    const events = response.data.items || [];
    
    if (events.length === 0) {
      return "You have no events scheduled for today in Adelaide timezone.";
    }

    let summary = `Today's schedule (Adelaide time):
`;
    events.forEach((event, index) => {
      const start = event.start?.dateTime || event.start?.date;
      const title = event.summary || 'Untitled Event';
      
      if (start) {
        const eventTime = new Date(start);
        const adelaideTime = eventTime.toLocaleString("en-US", {
          timeZone: "Australia/Adelaide",
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        summary += `${index + 1}. ${title} at ${adelaideTime}
`;
      } else {
        summary += `${index + 1}. ${title} (All day)
`;
      }
    });

    return summary;
  } catch (error) {
    console.error('Error getting today\'s events summary:', error);
    return "Unable to fetch today's calendar events.";
  }
}

// Get this week's events summary
export async function getWeeklyEventsSummary(accessToken: string): Promise<string> {
  try {
    const calendar = await getCalendarClient(accessToken);
    
    // Get start of week (Monday) and end of week (Sunday) in Adelaide timezone
    const now = new Date();
    const adelaide = new Date(now.toLocaleString("en-US", {timeZone: "Australia/Adelaide"}));
    
    const startOfWeek = new Date(adelaide);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Monday
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startOfWeek.toISOString(),
      timeMax: endOfWeek.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      timeZone: 'Australia/Adelaide'
    });

    const events = response.data.items || [];
    
    if (events.length === 0) {
      return "You have no events scheduled for this week in Adelaide timezone.";
    }

    let summary = `This week's schedule (Adelaide time):
`;
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const eventsByDay: { [key: string]: any[] } = {};
    
    events.forEach(event => {
      const start = event.start?.dateTime || event.start?.date;
      if (start) {
        const eventDate = new Date(start);
        const dayName = days[eventDate.getDay()];
        if (!eventsByDay[dayName]) {
          eventsByDay[dayName] = [];
        }
        eventsByDay[dayName].push(event);
      }
    });

    Object.keys(eventsByDay).forEach(day => {
      summary += `
${day}:
`;
      eventsByDay[day].forEach(event => {
        const start = event.start?.dateTime || event.start?.date;
        const title = event.summary || 'Untitled Event';
        
        if (start) {
          const eventTime = new Date(start);
          const adelaideTime = eventTime.toLocaleString("en-US", {
            timeZone: "Australia/Adelaide",
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          });
          summary += `  • ${title} at ${adelaideTime}
`;
        } else {
          summary += `  • ${title} (All day)
`;
        }
      });
    });

    return summary;
  } catch (error) {
    console.error('Error getting weekly events summary:', error);
    return "Unable to fetch this week's calendar events.";
  }
}