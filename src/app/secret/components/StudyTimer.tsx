'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { CardSpotlight } from '../../../components/ui/card-spotlight';

interface CurrentTrack {
  name: string;
  artist: string;
  album: string;
  image: string;
  nowPlaying: boolean;
  timestamp: number;
}

interface StudySession {
  id: number;
  user_id: number;
  username?: string;
  subject: string;
  duration_minutes: number;
  status: string;
  start_time: string;
  end_time?: string;
}

interface Subject {
  id: number;
  name: string;
  color: string;
}

interface PomodoroSettings {
  workDuration: number; // in minutes
  shortBreak: number;   // in minutes
  longBreak: number;    // in minutes
  longBreakInterval: number; // after how many work sessions
}

type TimerType = 'study';

const StudyTimer = () => {
  const { data: session } = useSession();
  const [activeSession, setActiveSession] = useState<StudySession | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [activeSessions, setActiveSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<CurrentTrack | null>(null);
  
  // New timer functionality
  const [timerType, setTimerType] = useState<TimerType>('study');

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch current track from Last.fm
  const fetchCurrentTrack = async () => {
    try {
      const response = await fetch(`/api/lastfm-users/current-track?username=${encodeURIComponent(session?.user?.username || '')}`);
      if (response.ok) {
        const track = await response.json();
        setCurrentTrack(track);
      } else {
        setCurrentTrack(null);
      }
    } catch (error) {
      console.error('Error fetching current track:', error);
      setCurrentTrack(null);
    }
  };

  // Clear interval on component unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    fetchSubjects();
    fetchActiveSessions();
    checkActiveSession();
    fetchCurrentTrack();
    
    // Refresh active sessions every 30 seconds
    const sessionsInterval = setInterval(() => {
      fetchActiveSessions();
    }, 30000);
    
    // Refresh current track every 10 seconds
    const trackInterval = setInterval(() => {
      fetchCurrentTrack();
    }, 10000);
    
    return () => {
      clearInterval(sessionsInterval);
      clearInterval(trackInterval);
    };
  }, []);

  // Timer effect - only run when activeSession exists
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (activeSession) {
      const updateTimer = () => {
        const start = new Date(activeSession.start_time);
        const now = new Date();
        
        // Check if start_time is valid
        if (isNaN(start.getTime())) {
          console.error('Invalid start_time:', activeSession.start_time);
          setTimeElapsed(0);
          return;
        }
        
        // Ensure start time is not in the future (more than 1 minute ahead)
        if (start.getTime() > now.getTime() + 60000) {
          console.error('Start time is in the future:', activeSession.start_time);
          setTimeElapsed(0);
          return;
        }
        
        const elapsed = Math.floor((now.getTime() - start.getTime()) / 1000);
        
        // Only set if elapsed time is reasonable (between 0 and 24 hours)
        if (elapsed >= 0 && elapsed < 86400) {
          setTimeElapsed(elapsed);
        } else {
          console.error('Unreasonable elapsed time:', elapsed, 'seconds. Start:', activeSession.start_time, 'Now:', now.toISOString());
          // Try to fix by assuming start time was meant to be recent
          setTimeElapsed(0);
        }
      };

      // Update immediately
      updateTimer();
      
      // Then update every second
      intervalRef.current = setInterval(updateTimer, 1000);
    } else {
      setTimeElapsed(0);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [activeSession]);

  const fetchSubjects = async () => {
    try {
      const response = await fetch('/api/subjects');
      if (response.ok) {
        const data = await response.json();
        setSubjects(data);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchActiveSessions = async () => {
    try {
      const response = await fetch('/api/study-sessions/active');
      if (response.ok) {
        const data = await response.json();
        setActiveSessions(data);
      }
    } catch (error) {
      console.error('Error fetching active sessions:', error);
    }
  };

  const checkActiveSession = async () => {
    try {
      const response = await fetch('/api/study-sessions/my-active');
      if (response.ok) {
        const data = await response.json();
        if (data.session) {
          setActiveSession(data.session);
          setSelectedSubject(data.session.subject);
        } else {
          setActiveSession(null);
          setTimeElapsed(0);
        }
      }
    } catch (error) {
      console.error('Error checking active session:', error);
    }
  };

  const startStudySession = async () => {
    if (!selectedSubject) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/study-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: selectedSubject,
          timerType: 'study'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setActiveSession(data.session);
        setTimeElapsed(0);
        fetchActiveSessions();
      }
    } catch (error) {
      console.error('Error starting study session:', error);
    } finally {
      setLoading(false);
    }
  };

  const endStudySession = async () => {
    if (!activeSession) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/study-sessions/${activeSession.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'completed'
        }),
      });

      if (response.ok) {
        setActiveSession(null);
        setTimeElapsed(0);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        fetchActiveSessions();
        // Reset selections
        setSelectedSubject('');
      }
    } catch (error) {
      console.error('Error ending study session:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    // Ensure seconds is a valid number and not negative
    if (isNaN(seconds) || seconds < 0) {
      return '00:00:00';
    }
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimeShort = (seconds: number) => {
    // For active sessions, use shorter format
    if (isNaN(seconds) || seconds < 0) {
      return '0m';
    }
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Study Timer Card */}
      <CardSpotlight className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div>
            <h2 className="font-aeonik-bold text-xl">Timer</h2>
            <p className="font-aeonik-regular text-sm text-gray-400">
              Track your study sessions with focus music
            </p>
          </div>
        </div>

        {activeSession ? (
          <div className="space-y-6">
            {/* Active Session Display - Made Much Bigger */}
            <div className="text-center p-24 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg border border-blue-500/30 min-h-[700px] flex flex-col justify-center">
              <div className="text-8xl font-aeonik-bold text-blue-400 mb-8">
                {formatTime(timeElapsed)}
              </div>
              <div className="text-2xl font-aeonik-regular text-gray-300 mb-6">
                Studying: <span className="text-white">{activeSession.subject}</span>
              </div>
              
              {/* Current Track from Last.fm */}
              {currentTrack ? (
                <div className="flex items-center justify-center space-x-4 p-4 bg-black/30 rounded-lg max-w-md mx-auto">
                  <div className="relative">
                    {currentTrack.image && (
                      <img src={currentTrack.image} alt="Album Art" className="w-12 h-12 rounded" />
                    )}
                    {currentTrack.nowPlaying && (
                      <div 
                        className="absolute -top-2 -right-2"
                        style={{ fontSize: '14px' }}
                      >
                        <span className="rotating-emoji">💿</span>
                      </div>
                    )}
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-aeonik-medium text-white">
                      {currentTrack.nowPlaying ? 'Now Playing:' : 'Recently Played'}
                    </div>
                    <div className="text-sm text-gray-300">
                      {currentTrack.name} by {currentTrack.artist}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-400 text-center p-4">
                  🎵 No music detected from your Last.fm
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex justify-center space-x-3">
              <button
                onClick={endStudySession}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-aeonik-regular py-3 px-8 rounded-lg transition duration-200 text-lg"
              >
                {loading ? 'Ending...' : 'End Session'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Subject Selection */}
            <div>
              <label className="block text-sm font-aeonik-regular text-gray-300 mb-2">
                Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-aeonik-regular"
              >
                <option value="">Select a subject</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.name}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Button */}
            <button
              onClick={startStudySession}
              disabled={!selectedSubject || loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-aeonik-regular py-2 px-4 rounded-lg transition duration-200"
            >
              {loading ? 'Starting...' : 'Start Study Session'}
            </button>
          </div>
        )}
      </CardSpotlight>

      {/* Active Sessions */}
      <CardSpotlight className="p-6">
        <h3 className="font-aeonik-bold text-lg mb-4">Active Study Sessions</h3>
        {activeSessions.length > 0 ? (
          <div className="space-y-3">
            {activeSessions.map((session) => {
              const start = new Date(session.start_time);
              const now = new Date();
              const elapsed = Math.floor((now.getTime() - start.getTime()) / 1000);
              
              return (
                <div
                  key={session.id}
                  className="p-3 bg-gray-900/50 border border-gray-700 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <div>
                        <div className="font-aeonik-bold text-sm text-white">
                          {session.username || 'Anonymous'}
                        </div>
                        <div className="text-xs text-gray-400 font-aeonik-regular">
                          {session.subject}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-aeonik-bold text-blue-400">
                      {formatTimeShort(elapsed)}
                    </div>
                  </div>
                  
                  {/* Music info for active sessions */}
                  {currentTrack && (
                    <div className="flex items-center space-x-3 mt-2 p-2 bg-black/20 rounded">
                      <div className="relative">
                        {currentTrack.image && (
                          <img src={currentTrack.image} alt="Album Art" className="w-8 h-8 rounded" />
                        )}
                        {currentTrack.nowPlaying && (
                          <div 
                            className="absolute -top-1 -right-1"
                            style={{ fontSize: '8px' }}
                          >
                            <span className="rotating-emoji">💿</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-aeonik-medium text-white truncate">
                          {currentTrack.nowPlaying ? 'Now Playing' : 'Recently Played'}
                        </div>
                        <div className="text-xs text-gray-300 truncate">
                          {currentTrack.name} by {currentTrack.artist}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-gray-400 font-aeonik-regular">
            No active study sessions
          </div>
        )}
      </CardSpotlight>
    </div>
  );
};

export default StudyTimer;
