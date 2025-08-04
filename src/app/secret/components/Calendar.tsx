'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { CardSpotlight } from '../../../components/ui/card-spotlight';
import CalendarConnectionStatus from './CalendarConnectionStatus';

interface CalendarEvent {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  user_id: number;
  username?: string;
  created_at: string;
}

const Calendar = () => {
  const { data: session } = useSession();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [googleCalendarEvents, setGoogleCalendarEvents] = useState<any[]>([]);
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: ''
  });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [startDatePreview, setStartDatePreview] = useState<string>('');
  const [endDatePreview, setEndDatePreview] = useState<string>('');
  const [startDateTimeout, setStartDateTimeout] = useState<NodeJS.Timeout | null>(null);
  const [endDateTimeout, setEndDateTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchEvents();
    
    // Cleanup timeouts on unmount
    return () => {
      if (startDateTimeout) clearTimeout(startDateTimeout);
      if (endDateTimeout) clearTimeout(endDateTimeout);
    };
  }, []);

  // Enhanced natural language date parsing function using GPT-4o-mini
  const parseNaturalDate = async (input: string): Promise<string> => {
    if (!input.trim()) return '';
    
    // Try standard date formats first
    const standardDate = new Date(input);
    if (!isNaN(standardDate.getTime())) {
      return formatDateTimeForAPI(standardDate);
    }

    try {
      const response = await fetch('/api/parse-date', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: input.trim(),
          currentDate: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.parsedDate || input;
      }
    } catch (error) {
      console.error('Error parsing date:', error);
    }
    
    // If API fails, return the original input
    return input;
  };

  const formatDateTimeForAPI = (date: Date): string => {
    // Format as YYYY-MM-DDTHH:MM in local timezone
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleStartDateChange = (value: string) => {
    setNewEvent({ ...newEvent, start_date: value });
    
    // Clear existing timeout
    if (startDateTimeout) {
      clearTimeout(startDateTimeout);
    }
    
    // Clear preview immediately when typing
    setStartDatePreview('');
    
    // Show preview of parsed date after 1 second of no typing
    if (value && value.length > 2) {
      const timeout = setTimeout(async () => {
        try {
          const parsed = await parseNaturalDate(value);
          if (parsed !== value) {
            const date = new Date(parsed);
            if (!isNaN(date.getTime())) {
              setStartDatePreview(`→ ${date.toLocaleString()}`);
            } else {
              setStartDatePreview('');
            }
          } else {
            setStartDatePreview('');
          }
        } catch (error) {
          setStartDatePreview('');
        }
      }, 500);
      
      setStartDateTimeout(timeout);
    } else {
      setStartDatePreview('');
    }
  };

  const handleEndDateChange = (value: string) => {
    setNewEvent({ ...newEvent, end_date: value });
    
    // Clear existing timeout
    if (endDateTimeout) {
      clearTimeout(endDateTimeout);
    }
    
    // Clear preview immediately when typing
    setEndDatePreview('');
    
    // Show preview of parsed date after 1 second of no typing
    if (value && value.length > 2) {
      const timeout = setTimeout(async () => {
        try {
          const parsed = await parseNaturalDate(value);
          if (parsed !== value) {
            const date = new Date(parsed);
            if (!isNaN(date.getTime())) {
              setEndDatePreview(`→ ${date.toLocaleString()}`);
            } else {
              setEndDatePreview('');
            }
          } else {
            setEndDatePreview('');
          }
        } catch (error) {
          setEndDatePreview('');
        }
      }, 500);
      setEndDateTimeout(timeout);
    } else {
      setEndDatePreview('');
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/calendar');
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title.trim() || !newEvent.start_date || !newEvent.end_date) return;

    setLoading(true);
    try {
      // Parse natural language dates
      const parsedStartDate = await parseNaturalDate(newEvent.start_date);
      const parsedEndDate = await parseNaturalDate(newEvent.end_date);

      const response = await fetch('/api/calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newEvent,
          start_date: parsedStartDate,
          end_date: parsedEndDate
        }),
      });

      if (response.ok) {
        const event = await response.json();
        setEvents([event, ...events]);
        setNewEvent({
          title: '',
          description: '',
          start_date: '',
          end_date: ''
        });
        setStartDatePreview('');
        setEndDatePreview('');
        setShowForm(false);
      }
    } catch (error) {
      console.error('Error creating event:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (eventId: number) => {
    try {
      const response = await fetch(`/api/calendar/${eventId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setEvents(events.filter(event => event.id !== eventId));
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const getEventsForDate = (date: string) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_date).toISOString().split('T')[0];
      return eventDate === date;
    });
  };

  const getTodayEvents = () => {
    const today = new Date().toISOString().split('T')[0];
    const localEvents = getEventsForDate(today);
    
    // Count Google Calendar events for today
    const todayGoogleEvents = googleCalendarEvents.filter(event => {
      const start = event.start?.dateTime || event.start?.date;
      if (start) {
        const eventDate = new Date(start).toISOString().split('T')[0];
        return eventDate === today;
      }
      return false;
    });
    
    return { 
      local: localEvents, 
      google: todayGoogleEvents, 
      total: localEvents.length + todayGoogleEvents.length 
    };
  };

  const getUpcomingEvents = () => {
    const today = new Date();
    const localUpcoming = events
      .filter(event => new Date(event.start_date) > today)
      .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
      .slice(0, 5);
    
    return localUpcoming;
  };

  const handleGoogleCalendarSync = async () => {
    try {
      const response = await fetch('/api/google-calendar?action=auth-url');
      const data = await response.json();
      
      if (data.authUrl) {
        window.open(data.authUrl, '_blank');
      } else {
        alert('Google Calendar integration requires setup. Please check your environment variables.');
      }
    } catch (error) {
      console.error('Error with Google Calendar sync:', error);
      alert('Google Calendar integration not configured yet.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const todayEventsData = getTodayEvents();
  const upcomingEvents = getUpcomingEvents();

  return (
    <div className="space-y-6">
      {/* Header with Add Event Button */}
            {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">📅</span>
          <div>
            <h2 className="font-aeonik-bold text-xl">Team Calendar</h2>
            <p className="font-aeonik-regular text-sm text-gray-400">
              Shared calendar for team events
            </p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-aeonik-regular py-2 px-4 rounded-lg transition duration-200"
          >
            {showForm ? 'Cancel' : 'Add Event'}
          </button>
          
        </div>
      </div>

      {/* Google Calendar Connection Status */}
      <CalendarConnectionStatus 
        onStatusChange={(connected) => {
          setCalendarConnected(connected);
        }}
        onEventsChange={(events) => {
          setGoogleCalendarEvents(events);
        }}
      />

      {/* Add Event Form */}
      {showForm && (
        <CardSpotlight className="p-6">
          <h3 className="font-aeonik-bold text-lg mb-4">Create New Event</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-aeonik-regular text-gray-300 mb-2">
                Event Title
              </label>
              <input
                type="text"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-aeonik-regular"
                placeholder="What's happening?"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-aeonik-regular text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-aeonik-regular"
                placeholder="Event details..."
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-aeonik-regular text-gray-300 mb-2">
                  Start Date & Time
                </label>
                <input
                  type="text"
                  value={newEvent.start_date}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-aeonik-regular"
                  placeholder="tomorrow 2pm, next monday 9am, today 14:30"
                  required
                />
                {startDatePreview && (
                  <p className="text-xs text-green-400 mt-1">{startDatePreview}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-aeonik-regular text-gray-300 mb-2">
                  End Date & Time
                </label>
                <input
                  type="text"
                  value={newEvent.end_date}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-aeonik-regular"
                  placeholder="tomorrow 4pm, next monday 11am, today 16:30"
                  required
                />
                {endDatePreview && (
                  <p className="text-xs text-green-400 mt-1">{endDatePreview}</p>
                )}
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-aeonik-regular py-2 px-4 rounded-lg transition duration-200"
            >
              {loading ? 'Creating...' : 'Create Event'}
            </button>
          </form>
        </CardSpotlight>
      )}

      {/* Today's Events */}
      <div>
        <h3 className="font-aeonik-bold text-lg mb-4">Today's Events</h3>
        {todayEventsData.local.length > 0 ? (
          <div className="space-y-3">
            {todayEventsData.local.map((event) => (
              <CardSpotlight key={event.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-aeonik-medium text-lg">{event.title}</h4>
                    {event.description && (
                      <p className="font-aeonik-regular text-gray-400 text-sm mt-1">{event.description}</p>
                    )}
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-xs text-blue-400">
                        {formatDate(event.start_date)}
                      </span>
                      {event.username && (
                        <span className="text-xs text-gray-500">
                          by {event.username}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteEvent(event.id)}
                    className="text-red-400 hover:text-red-300 ml-4"
                  >
                    🗑️
                  </button>
                </div>
              </CardSpotlight>
            ))}
          </div>
        ) : (
          <CardSpotlight className="p-6 text-center">
            <div className="text-4xl mb-4">📅</div>
            <p className="font-aeonik-regular text-gray-400">No events scheduled for today</p>
          </CardSpotlight>
        )}
      </div>

      {/* Upcoming Events */}
      <div>
        <h3 className="font-aeonik-bold text-lg mb-4">Upcoming Events</h3>
        {upcomingEvents.length > 0 ? (
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <CardSpotlight key={event.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-aeonik-medium text-lg">{event.title}</h4>
                    {event.description && (
                      <p className="font-aeonik-regular text-gray-400 text-sm mt-1">{event.description}</p>
                    )}
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-xs text-yellow-400">
                        {formatDate(event.start_date)}
                      </span>
                      {event.username && (
                        <span className="text-xs text-gray-500">
                          by {event.username}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteEvent(event.id)}
                    className="text-red-400 hover:text-red-300 ml-4"
                  >
                    🗑️
                  </button>
                </div>
              </CardSpotlight>
            ))}
          </div>
        ) : (
          <CardSpotlight className="p-6 text-center">
            <div className="text-4xl mb-4">🎯</div>
            <p className="font-aeonik-regular text-gray-400">No upcoming events scheduled</p>
          </CardSpotlight>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CardSpotlight className="p-4 text-center">
          <div className="text-2xl font-aeonik-bold text-blue-400">{todayEventsData.total}</div>
          <div className="text-sm font-aeonik-regular text-gray-400">Today's Events</div>
          {calendarConnected && (
            <div className="text-xs font-aeonik-regular text-gray-500 mt-1">
              {todayEventsData.local.length} local + {todayEventsData.google.length} Google
            </div>
          )}
        </CardSpotlight>
        <CardSpotlight className="p-4 text-center">
          <div className="text-2xl font-aeonik-bold text-green-400">{events.length}</div>
          <div className="text-sm font-aeonik-regular text-gray-400">Local Events</div>
        </CardSpotlight>
        <CardSpotlight className="p-4 text-center">
          <div className="text-2xl font-aeonik-bold text-purple-400">{googleCalendarEvents.length}</div>
          <div className="text-sm font-aeonik-regular text-gray-400">Google Events</div>
          {!calendarConnected && (
            <div className="text-xs font-aeonik-regular text-gray-500 mt-1">
              Connect to see count
            </div>
          )}
        </CardSpotlight>
      </div>
    </div>
  );
};

export default Calendar;
