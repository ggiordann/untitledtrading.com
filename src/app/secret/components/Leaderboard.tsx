'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { CardSpotlight } from '../../../components/ui/card-spotlight';

interface LeaderboardEntry {
  id: number;
  username: string;
  total_study_hours: number;
  total_tasks_completed: number;
  current_streak: number;
  longest_streak: number;
  level: number;
  points: number;
  status: string;
  notes: string;
}

const Leaderboard = () => {
  const { data: session } = useSession();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('all-time');

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedPeriod]);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`/api/leaderboard?period=${selectedPeriod}`);
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateLevel = (points: number) => {
    return Math.floor(points / 100) + 1;
  };

  const getProgressToNextLevel = (points: number) => {
    const currentLevelPoints = (calculateLevel(points) - 1) * 100;
    const progressInLevel = points - currentLevelPoints;
    return (progressInLevel / 100) * 100;
  };

  const getRankEmoji = (index: number) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return '🏅';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Studying': return 'text-green-400';
      case 'Break': return 'text-yellow-400';
      case 'Available': return 'text-blue-400';
      case 'Busy': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <CardSpotlight className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-800 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-16 bg-gray-800 rounded"></div>
            ))}
          </div>
        </div>
      </CardSpotlight>
    );
  }

  return (
    <CardSpotlight className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">🏆</span>
          <div>
            <h2 className="font-aeonik-bold text-xl">Leaderboard</h2>
            <p className="font-aeonik-regular text-sm text-gray-400">
              Team productivity rankings
            </p>
          </div>
        </div>
        
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="px-3 py-1 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-aeonik-regular text-sm"
        >
          <option value="all-time">All Time</option>
          <option value="weekly">This Week</option>
          <option value="monthly">This Month</option>
        </select>
      </div>

      <div className="space-y-3">
        {leaderboard.map((entry, index) => (
          <div
            key={entry.id}
            className={`p-4 rounded-lg border transition-all duration-200 ${
              entry.username === session?.user?.username
                ? 'bg-blue-900/20 border-blue-500/50'
                : 'bg-gray-900/50 border-gray-700 hover:border-gray-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-2xl">
                  {getRankEmoji(index)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-aeonik-bold text-white">
                      {entry.username}
                    </span>
                    <div className={`w-2 h-2 rounded-full ${
                      entry.status === 'Studying' ? 'bg-green-400' :
                      entry.status === 'Break' ? 'bg-yellow-400' :
                      entry.status === 'Available' ? 'bg-blue-400' :
                      'bg-gray-400'
                    }`}></div>
                    <span className={`text-xs font-aeonik-regular ${getStatusColor(entry.status)}`}>
                      {entry.status}
                    </span>
                  </div>
                  
                  {entry.notes && (
                    <p className="text-xs text-gray-400 font-aeonik-regular mt-1">
                      {entry.notes}
                    </p>
                  )}
                  
                  <div className="flex items-center space-x-4 mt-2 text-sm font-aeonik-regular text-gray-300">
                    <span>📚 {entry.total_study_hours.toFixed(1)}h</span>
                    <span>✅ {entry.total_tasks_completed} tasks</span>
                    <span>🔥 {entry.current_streak} streak</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-lg font-aeonik-bold text-yellow-400">
                  Level {entry.level}
                </div>
                <div className="text-sm text-gray-400 font-aeonik-regular">
                  {entry.points} points
                </div>
                
                {/* Level Progress Bar */}
                <div className="w-20 h-1 bg-gray-800 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                    style={{ width: `${getProgressToNextLevel(entry.points)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {leaderboard.length === 0 && (
        <div className="text-center py-8 text-gray-400 font-aeonik-regular">
          No leaderboard data available yet
        </div>
      )}

      {/* Points System Info */}
      <div className="mt-6 p-4 bg-gray-900/30 rounded-lg border border-gray-800">
        <h4 className="font-aeonik-bold text-sm text-gray-300 mb-2">🎯 Point System</h4>
        <div className="grid grid-cols-2 gap-2 text-xs font-aeonik-regular text-gray-400">
          <div>• Complete task: +10 points</div>
          <div>• Study hour: +20 points</div>
          <div>• Daily streak: +5 points</div>
          <div>• Level up: Every 100 points</div>
        </div>
      </div>
    </CardSpotlight>
  );
};

export default Leaderboard;
