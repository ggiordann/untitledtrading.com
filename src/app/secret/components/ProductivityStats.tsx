'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { CardSpotlight } from '../../../components/ui/card-spotlight';

interface ProductivityStat {
  id: number;
  user_id: number;
  date: string;
  tasks_completed: number;
  study_hours: number;
  created_at: string;
}

interface ProductivityStatsProps {
  onLoadingChange: (isLoading: boolean) => void;
}

const ProductivityStats: React.FC<ProductivityStatsProps> = ({ onLoadingChange }) => {
  const { data: session } = useSession();
  const [stats, setStats] = useState<ProductivityStat[]>([]);
  const [todayStats, setTodayStats] = useState({
  tasks_completed: 0,
  study_hours: 0
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Cache keys for localStorage
  const STATS_CACHE_KEY = 'productivity-stats-cache';
  const CACHE_EXPIRY_KEY = 'stats-cache-expiry';
  const CACHE_DURATION = 3 * 60 * 1000; // 3 minutes in milliseconds

  useEffect(() => {
    loadStatsWithCache();
  }, []);

  useEffect(() => {
    if (onLoadingChange) {
      onLoadingChange(loading || initialLoading);
    }
  }, [loading, initialLoading, onLoadingChange]);

  // Load stats with intelligent caching
  const loadStatsWithCache = async () => {
    try {
      // Check if we have valid cached data
      const cachedStats = localStorage.getItem(STATS_CACHE_KEY);
      const cacheExpiry = localStorage.getItem(CACHE_EXPIRY_KEY);
      const now = Date.now();

      if (cachedStats && cacheExpiry && now < parseInt(cacheExpiry)) {
        // Use cached data for instant loading
        const parsedData = JSON.parse(cachedStats);
        setStats(parsedData.stats || []);
        setTodayStats(parsedData.today || { tasks_completed: 0, study_hours: 0 });
        setInitialLoading(false);
        
        // Still fetch fresh data in background
        setTimeout(() => {
          fetchStatsAndCache(false);
        }, 100);
        return;
      }

      // No valid cache, fetch fresh data
      await fetchStatsAndCache(true);
    } catch (error) {
      console.error('Error loading stats with cache:', error);
      // Fallback to regular fetch
      await fetchStatsAndCache(true);
    }
  };

  // Fetch stats and update cache
  const fetchStatsAndCache = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      
      const response = await fetch('/api/stats');
      if (response.ok) {
        const data = await response.json();
        const statsData = {
          stats: data.stats || [],
          today: data.today || { tasks_completed: 0, study_hours: 0 }
        };
        
        setStats(statsData.stats);
        setTodayStats(statsData.today);
        
        // Update cache
        localStorage.setItem(STATS_CACHE_KEY, JSON.stringify(statsData));
        localStorage.setItem(CACHE_EXPIRY_KEY, (Date.now() + CACHE_DURATION).toString());
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
      setInitialLoading(false);
    }
  };

  // Legacy function for compatibility
  const fetchStats = () => fetchStatsAndCache(true);

  // Clear cache when stats are modified
  const clearStatsCache = () => {
    localStorage.removeItem(STATS_CACHE_KEY);
    localStorage.removeItem(CACHE_EXPIRY_KEY);
  };

  const updateTodayStats = async (field: string, value: number) => {
    setLoading(true);
    try {
      const response = await fetch('/api/stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [field]: value
        }),
      });

      if (response.ok) {
        setTodayStats(prev => ({
          ...prev,
          [field]: value
        }));
        clearStatsCache(); // Clear cache after update
      }
    } catch (error) {
      console.error('Error updating stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeeklyStats = () => {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    return stats.filter(stat => 
      new Date(stat.date) >= weekAgo && new Date(stat.date) <= today
    );
  };

  const getMonthlyStats = () => {
    const today = new Date();
    const monthAgo = new Date(today);
    monthAgo.setDate(monthAgo.getDate() - 30);

    return stats.filter(stat => 
      new Date(stat.date) >= monthAgo && new Date(stat.date) <= today
    );
  };

  const calculateAverage = (statsList: ProductivityStat[], field: keyof ProductivityStat) => {
    if (statsList.length === 0) return 0;
    const sum = statsList.reduce((acc, stat) => acc + (stat[field] as number), 0);
    return Math.round((sum / statsList.length) * 100) / 100;
  };

  const calculateTotal = (statsList: ProductivityStat[], field: keyof ProductivityStat) => {
    return statsList.reduce((acc, stat) => acc + (stat[field] as number), 0);
  };

  const weeklyStats = getWeeklyStats();
  const monthlyStats = getMonthlyStats();

  const getStreakDays = () => {
    const sortedStats = [...stats].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < sortedStats.length; i++) {
      const statDate = new Date(sortedStats[i].date);
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);
      
      if (statDate.toDateString() === expectedDate.toDateString() && 
          sortedStats[i].tasks_completed > 0) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const streak = getStreakDays();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="font-aeonik-bold text-2xl mb-2">Productivity Dashboard</h2>
        <p className="font-aeonik-regular text-gray-400">
          Track your daily progress and build consistent habits
        </p>
      </div>

      {/* Key Metrics */}
      <div className="flex justify-between gap-4 w-full max-w-4xl mx-auto">
        <CardSpotlight className="flex-1 p-4 text-center">
          <div className="text-2xl font-aeonik-bold text-white">{streak}</div>
          <div className="text-sm font-aeonik-regular text-gray-400">Day Streak</div>
        </CardSpotlight>
        
        <CardSpotlight className="flex-1 p-4 text-center">
          <div className="text-2xl font-aeonik-bold text-white">
            {calculateTotal(weeklyStats, 'tasks_completed')}
          </div>
          <div className="text-sm font-aeonik-regular text-gray-400">Tasks This Week</div>
        </CardSpotlight>
        
        <CardSpotlight className="flex-1 p-4 text-center">
          <div className="text-2xl font-aeonik-bold text-white">
            {(calculateTotal(weeklyStats, 'study_hours')).toFixed(2)}h
          </div>
          <div className="text-sm font-aeonik-regular text-gray-400">Study This Week</div>
        </CardSpotlight>
        
      </div>

      {/* Weekly vs Monthly Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CardSpotlight className="p-6">
          <h3 className="font-aeonik-bold text-lg mb-4">Weekly Averages</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-aeonik-regular text-gray-300">Tasks/Day</span>
              <span className="font-aeonik-bold text-gray-200">
                {calculateAverage(weeklyStats, 'tasks_completed')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-aeonik-regular text-gray-300">Study Hours/Day</span>
              <span className="font-aeonik-bold text-gray-200">
                {calculateAverage(weeklyStats, 'study_hours')}h
              </span>
            </div>
          </div>
        </CardSpotlight>

        <CardSpotlight className="p-6">
          <h3 className="font-aeonik-bold text-lg mb-4">Monthly Averages</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-aeonik-regular text-gray-300">Tasks/Day</span>
              <span className="font-aeonik-bold text-gray-200">
                {calculateAverage(monthlyStats, 'tasks_completed')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-aeonik-regular text-gray-300">Study Hours/Day</span>
              <span className="font-aeonik-bold text-gray-200">
                {calculateAverage(monthlyStats, 'study_hours')}h
              </span>
            </div>
          </div>
        </CardSpotlight>
      </div>

      {/* Recent Activity */}
      <CardSpotlight className="p-6">
        <h3 className="font-aeonik-bold text-lg mb-4">Recent Activity</h3>
        {stats.length > 0 ? (
          <div className="space-y-2">
            {stats.slice(0, 7).map((stat) => (
                <div key={stat.id} className="flex items-center justify-between py-3 px-4 hover:bg-gray-900/30 rounded-lg transition-colors">
                  <span className="font-aeonik-medium text-gray-300">
                    {new Date(stat.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                  <div className="flex items-center space-x-4 text-sm font-aeonik-regular">
                    <span className="text-gray-400">{stat.tasks_completed}</span>
                    <span className="text-gray-400">{stat.study_hours.toFixed(1)}h</span>
                  </div>
                </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="font-aeonik-regular text-gray-400 text-lg mb-2">
              No activity recorded yet
            </p>
            <p className="font-aeonik-regular text-gray-500 text-sm">
              Start tracking your daily progress to see your stats here!
            </p>
          </div>
        )}
      </CardSpotlight>

      {/* Motivational Quotes */}
      <CardSpotlight className="p-6">
        <h3 className="font-aeonik-bold text-lg mb-4">Daily Motivation</h3>
        <div className="text-center">
          <p className="font-aeonik-regular text-lg text-gray-300 italic mb-2">
            "The only way to do great work is to love what you do."
          </p>
          <p className="font-aeonik-thin text-sm text-gray-500">- Steve Jobs</p>
        </div>
      </CardSpotlight>
    </div>
  );
};

export default ProductivityStats;
