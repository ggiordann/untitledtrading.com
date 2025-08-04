import React, { useState, useEffect } from 'react';

interface CalendarStatusProps {
  onStatusChange?: (connected: boolean) => void;
  onEventsChange?: (events: any[]) => void;
}

const CalendarConnectionStatus: React.FC<CalendarStatusProps> = ({ onStatusChange, onEventsChange }) => {
  const [status, setStatus] = useState<{
    connected: boolean;
    loading: boolean;
    upcomingEvents: any[];
    eventsError: string | null;
  }>({
    connected: false,
    loading: true,
    upcomingEvents: [],
    eventsError: null
  });

  const checkCalendarStatus = async () => {
    try {
      setStatus(prev => ({ ...prev, loading: true }));
      const response = await fetch('/api/google-calendar/status');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Calendar status response:', data); // Debug logging
      
      setStatus({
        connected: data.connected,
        loading: false,
        upcomingEvents: data.upcomingEvents || [],
        eventsError: data.eventsError || null
      });
      
      if (onStatusChange) {
        onStatusChange(data.connected);
      }
      
      if (onEventsChange) {
        onEventsChange(data.upcomingEvents || []);
      }
    } catch (error) {
      console.error('Error checking calendar status:', error);
      setStatus({
        connected: false,
        loading: false,
        upcomingEvents: [],
        eventsError: `Failed to check calendar status: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  };

  useEffect(() => {
    checkCalendarStatus();
  }, []);

  const handleConnectCalendar = () => {
    const redirectUri = `${window.location.origin}/api/google-calendar`;
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    
    if (!clientId) {
      console.error('Google Client ID not configured');
      return;
    }
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent('https://www.googleapis.com/auth/calendar')}` +
      `&access_type=offline`;
      
    window.location.href = authUrl;
  };

  if (status.loading) {
    return (
      <div className="flex items-center gap-3 p-4 bg-gray-900/50 border border-gray-700 rounded-lg backdrop-blur-sm">
        <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
        <span className="text-sm text-gray-300 font-aeonik-regular">checking calendar connection...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <div className="flex items-center justify-between p-4 bg-gray-900/50 border border-gray-700 rounded-lg backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${status.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <div>
            <p className="font-aeonik-bold text-white">
              google calendar
            </p>
            <p className="text-sm text-gray-400 font-aeonik-regular">
              {status.connected ? 'connected' : 'not connected'}
            </p>
          </div>
        </div>
        
        {!status.connected && (
          <button
            onClick={handleConnectCalendar}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-aeonik-regular"
          >
            connect calendar
          </button>
        )}
        
        {status.connected && (
          <button
            onClick={checkCalendarStatus}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm font-aeonik-regular"
          >
            refresh
          </button>
        )}
      </div>

      {/* Upcoming Events */}
      {status.connected && (
        <div className="space-y-3">
          <h3 className="font-aeonik-bold text-white text-lg">
            your google calendar events
          </h3>
          
          {status.eventsError ? (
            <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg backdrop-blur-sm">
              <p className="text-sm text-red-400 font-aeonik-regular">
                {status.eventsError}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {status.upcomingEvents.length > 0 ? (
                status.upcomingEvents.map((event: any, index: number) => {
                  const start = event.start?.dateTime || event.start?.date;
                  const title = event.summary || 'Untitled Event';
                  
                  let timeDisplay = 'All day';
                  if (start) {
                    const eventTime = new Date(start);
                    timeDisplay = eventTime.toLocaleString("en-US", {
                      timeZone: "Australia/Adelaide",
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    });
                  }
                  
                  return (
                    <div key={index} className="p-4 bg-gray-900/30 border border-gray-700 rounded-lg backdrop-blur-sm hover:bg-gray-900/50 transition-colors">
                      <div className="font-aeonik-bold text-white text-sm">
                        {title}
                      </div>
                      <div className="text-xs text-blue-400 mt-1 font-aeonik-regular">
                        {timeDisplay} (adelaide time)
                      </div>
                      {event.location && (
                        <div className="text-xs text-gray-400 mt-1 font-aeonik-regular">
                          {event.location}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="p-4 bg-gray-900/30 border border-gray-700 rounded-lg backdrop-blur-sm">
                  <p className="text-sm text-gray-400 font-aeonik-regular">
                    no upcoming events found
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CalendarConnectionStatus;
