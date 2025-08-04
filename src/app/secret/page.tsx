'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TracingBeam } from '../../components/ui/tracing-beam';
import { CardSpotlight } from '../../components/ui/card-spotlight';
import TaskManager from './components/TaskManager';
import Calendar from './components/Calendar';
import Chat from './components/Chat';
import MusicPlaylist from './components/MusicPlaylist';
import ProductivityStats from './components/ProductivityStats';
import StudyTimer from './components/StudyTimer';
import Leaderboard from './components/Leaderboard';
import UserStatus from './components/UserStatus';
import AIAssistant from './components/AIAssistant';
import RealTimeClock from './components/RealTimeClock';

const ProductivityHubContent = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('tasks');
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/secret/login');
    }
  }, [session, status, router]);

  useEffect(() => {
    // Check for calendar connection status
    const calendarStatus = searchParams?.get('calendar');
    if (calendarStatus === 'connected') {
      setNotification({
        type: 'success',
        message: 'Google Calendar connected successfully! 🎉'
      });
      setActiveTab('calendar'); // Switch to calendar tab
      // Clear the URL parameter
      const url = new URL(window.location.href);
      url.searchParams.delete('calendar');
      window.history.replaceState({}, '', url.toString());
    } else if (calendarStatus === 'error') {
      setNotification({
        type: 'error',
        message: 'Failed to connect Google Calendar. Please try again.'
      });
      // Clear the URL parameter
      const url = new URL(window.location.href);
      url.searchParams.delete('calendar');
      window.history.replaceState({}, '', url.toString());
    }

    // Auto-hide notification after 5 seconds
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams, notification]);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/secret/login');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p className="font-aeonik-regular">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const tabs = [
    { id: 'tasks', label: 'tasks', icon: '' },
    { id: 'calendar', label: 'calendar', icon: '' },
    { id: 'chat', label: 'chat', icon: '' },
    { id: 'music', label: 'music', icon: '' },
    { id: 'study', label: 'study timer', icon: '' },
    { id: 'leaderboard', label: 'board', icon: '' },
    { id: 'status', label: 'status', icon: '' },
    { id: 'ai', label: 'ai assistant', icon: '' },
    { id: 'stats', label: 'stats', icon: '' }
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'tasks':
        return <TaskManager />;
      case 'calendar':
        return <Calendar />;
      case 'chat':
        return <Chat />;
      case 'music':
        return <MusicPlaylist />;
      case 'study':
        return <StudyTimer />;
      case 'leaderboard':
        return <Leaderboard />;
      case 'status':
        return <UserStatus />;
      case 'ai':
        return <AIAssistant />;
      case 'stats':
        return <ProductivityStats onLoadingChange={() => {}} />;
      default:
        return <TaskManager />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          notification.type === 'success' 
            ? 'bg-green-600 border border-green-500' 
            : 'bg-red-600 border border-red-500'
        }`}>
          <div className="flex items-center space-x-2">
            <span className="font-aeonik-regular text-white">
              {notification.message}
            </span>
            <button
              onClick={() => setNotification(null)}
              className="text-white hover:text-gray-300 ml-2"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      
      <div className="flex w-full flex-col pt-8 items-center">
        <div className="flex flex-col w-full max-w-[90rem] px-12 items-center justify-center gap-y-4">
          <TracingBeam className="px-0">
            <div className="flex flex-col w-full align-center justify-center space-y-8 items-start">
              {/* Header */}
              <div className="flex flex-row justify-between items-center w-full">
                <div className="flex flex-col">
                  <p className="font-aeonik-bold tracking-tight text-[21px] mb-1">PRODUCTIVITY HUB</p>
                  <p className="font-aeonik-regular text-sm text-gray-400">
                    {session.user?.username}
                  </p>
                </div>
                
                {/* Center - Real Time Clock */}
                <div className="flex-1 flex justify-center">
                  <RealTimeClock />
                </div>
                
                <button
                  onClick={() => signOut({ callbackUrl: '/secret/login' })}
                  className="group relative bg-white/5 backdrop-blur-lg hover:bg-white/10 border border-white/10 hover:border-red-400/30 text-white font-aeonik-regular py-3 px-6 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-red-500/10 flex items-center space-x-2"
                >
                  <span>sign out</span>
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="flex flex-row w-full border-b border-gray-800 overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group relative flex-shrink-0 flex items-center justify-center py-4 px-2 sm:px-4 md:px-6 lg:px-8 min-w-[80px] sm:min-w-[100px] md:min-w-[120px] lg:min-w-[140px] xl:flex-1 transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'border-b-2 border-blue-500 text-blue-400'
                        : 'text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-gray-900/50 hover:via-gray-800/80 hover:to-gray-900/50 hover:shadow-lg hover:shadow-blue-500/20'
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="font-aeonik-regular text-xs sm:text-sm md:text-base relative z-10 group-hover:drop-shadow-sm truncate text-center">{tab.label}</span>
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 group-hover:w-3/4 transition-all duration-300"></div>
                  </button>
                ))}
              </div>

              {/* Active Tab Content */}
              <div className="w-full min-h-[600px]">
                {renderActiveTab()}
              </div>

              {/* Footer */}
              <div className="w-full py-8 border-t border-gray-800">
                <p className="font-aeonik-thin text-gray-500 text-center">
                  "Excellence is not a skill, it's an attitude." - Ralph Marston
                </p>
              </div>
            </div>
          </TracingBeam>
        </div>
      </div>
    </div>
  );
};

const ProductivityHub = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p className="font-aeonik-regular">Loading...</p>
        </div>
      </div>
    }>
      <ProductivityHubContent />
    </Suspense>
  );
};

export default ProductivityHub;
