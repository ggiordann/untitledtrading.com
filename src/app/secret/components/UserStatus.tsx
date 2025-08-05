'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { CardSpotlight } from '../../../components/ui/card-spotlight';

interface UserStatus {
  id: number;
  username: string;
  status: string;
  notes: string;
  current_playlist: string;
}

const UserStatus = () => {
  const { data: session } = useSession();
  const [users, setUsers] = useState<UserStatus[]>([]);
  const [currentUser, setCurrentUser] = useState<UserStatus | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    status: '',
    notes: '',
    current_playlist: ''
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Cache keys for localStorage
  const STATUS_CACHE_KEY = 'user-status-cache';
  const CACHE_EXPIRY_KEY = 'status-cache-expiry';
  const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes in milliseconds

  const statusOptions = [
    { value: 'Available', emoji: '✅', color: 'text-green-400' },
    { value: 'Studying', emoji: '📚', color: 'text-blue-400' },
    { value: 'Break', emoji: '☕', color: 'text-yellow-400' },
    { value: 'Busy', emoji: '🔴', color: 'text-red-400' },
    { value: 'Away', emoji: '⏰', color: 'text-gray-400' }
  ];

  useEffect(() => {
    loadStatusWithCache();
    
    // Refresh every 30 seconds
    const interval = setInterval(() => fetchStatusAndCache(false), 30000);
    return () => clearInterval(interval);
  }, []);

  // Load status with intelligent caching
  const loadStatusWithCache = async () => {
    try {
      // Check if we have valid cached data
      const cachedStatus = localStorage.getItem(STATUS_CACHE_KEY);
      const cacheExpiry = localStorage.getItem(CACHE_EXPIRY_KEY);
      const now = Date.now();

      if (cachedStatus && cacheExpiry && now < parseInt(cacheExpiry)) {
        // Use cached data for instant loading
        const parsedData = JSON.parse(cachedStatus);
        setUsers(parsedData.users || []);
        if (parsedData.currentUser) {
          setCurrentUser(parsedData.currentUser);
          setEditForm({
            status: parsedData.currentUser.status || '',
            notes: parsedData.currentUser.notes || '',
            current_playlist: parsedData.currentUser.current_playlist || ''
          });
        }
        setInitialLoading(false);
        
        // Still fetch fresh data in background
        setTimeout(() => {
          fetchStatusAndCache(false);
        }, 100);
        return;
      }

      // No valid cache, fetch fresh data
      await fetchStatusAndCache(true);
    } catch (error) {
      console.error('Error loading status with cache:', error);
      // Fallback to regular fetch
      await fetchStatusAndCache(true);
    }
  };

  // Fetch status and update cache
  const fetchStatusAndCache = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      
      const response = await fetch('/api/user-status');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
        
        // Find current user
        const current = data.find((user: UserStatus) => 
          user.username === session?.user?.username
        );
        
        if (current) {
          setCurrentUser(current);
          setEditForm({
            status: current.status || '',
            notes: current.notes || '',
            current_playlist: current.current_playlist || ''
          });
        }
        
        // Update cache
        const cacheData = {
          users: data,
          currentUser: current || null
        };
        localStorage.setItem(STATUS_CACHE_KEY, JSON.stringify(cacheData));
        localStorage.setItem(CACHE_EXPIRY_KEY, (Date.now() + CACHE_DURATION).toString());
      }
    } catch (error) {
      console.error('Error fetching status:', error);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
      setInitialLoading(false);
    }
  };

  // Clear cache when status is modified
  const clearStatusCache = () => {
    localStorage.removeItem(STATUS_CACHE_KEY);
    localStorage.removeItem(CACHE_EXPIRY_KEY);
  };

  const fetchUserStatus = async () => {
    try {
      const response = await fetch('/api/user-status');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
        
        // Find current user
        const current = data.find((user: UserStatus) => user.username === session?.user?.username);
        if (current) {
          setCurrentUser(current);
          setEditForm({
            status: current.status,
            notes: current.notes,
            current_playlist: current.current_playlist
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user status:', error);
    }
  };

  const updateStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/user-status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setCurrentUser(updatedUser);
        setEditMode(false);
        clearStatusCache(); // Clear cache after update
        fetchStatusAndCache(false); // Refresh all users
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = (status: string) => {
    const statusConfig = statusOptions.find(opt => opt.value === status);
    return statusConfig || { value: status, emoji: '❓', color: 'text-gray-400' };
  };

  return (
    <div className="space-y-6">
      {/* Current User Status */}
      <CardSpotlight className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">👤</span>
            <div>
              <h2 className="font-aeonik-bold text-xl">Your Status</h2>
              <p className="font-aeonik-regular text-sm text-gray-400">
                Let your team know what you're up to
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setEditMode(!editMode)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-aeonik-regular py-2 px-4 rounded-lg transition duration-200"
          >
            {editMode ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {editMode ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-aeonik-regular text-gray-300 mb-2">
                Status
              </label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-aeonik-regular"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.emoji} {option.value}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-aeonik-regular text-gray-300 mb-2">
                Notes
              </label>
              <textarea
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-aeonik-regular"
                placeholder="What are you working on?"
                rows={2}
              />
            </div>
            
            <div>
              <label className="block text-sm font-aeonik-regular text-gray-300 mb-2">
                Current Playlist
              </label>
              <input
                type="text"
                value={editForm.current_playlist}
                onChange={(e) => setEditForm({ ...editForm, current_playlist: e.target.value })}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-aeonik-regular"
                placeholder="What are you listening to?"
              />
            </div>
            
            <button
              onClick={updateStatus}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-aeonik-regular py-2 rounded-lg transition duration-200"
            >
              {loading ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        ) : (
          currentUser && (
            <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
              <div className="flex items-center space-x-3 mb-2">
                <span className={`text-lg ${getStatusDisplay(currentUser.status).color}`}>
                  {getStatusDisplay(currentUser.status).emoji}
                </span>
                <span className="font-aeonik-bold text-white">
                  {currentUser.username}
                </span>
                <span className={`text-sm font-aeonik-regular ${getStatusDisplay(currentUser.status).color}`}>
                  {currentUser.status}
                </span>
              </div>
              
              {currentUser.notes && (
                <p className="text-sm font-aeonik-regular text-gray-300 mb-2">
                  💭 {currentUser.notes}
                </p>
              )}
              
              {currentUser.current_playlist && (
                <p className="text-sm font-aeonik-regular text-gray-400">
                  🎵 {currentUser.current_playlist}
                </p>
              )}
            </div>
          )
        )}
      </CardSpotlight>

      {/* Team Status */}
      <CardSpotlight className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <span className="text-2xl">👥</span>
          <div>
            <h3 className="font-aeonik-bold text-lg">Team Status</h3>
            <p className="font-aeonik-regular text-sm text-gray-400">
              See what everyone is up to
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {users
            .filter(user => user.username !== session?.user?.username)
            .map((user) => (
              <div
                key={user.id}
                className="p-4 bg-gray-900/50 rounded-lg border border-gray-700"
              >
                <div className="flex items-center space-x-3 mb-2">
                  <span className={`text-lg ${getStatusDisplay(user.status).color}`}>
                    {getStatusDisplay(user.status).emoji}
                  </span>
                  <span className="font-aeonik-bold text-white">
                    {user.username}
                  </span>
                  <span className={`text-sm font-aeonik-regular ${getStatusDisplay(user.status).color}`}>
                    {user.status}
                  </span>
                </div>
                
                {user.notes && (
                  <p className="text-sm font-aeonik-regular text-gray-300 mb-2">
                    💭 {user.notes}
                  </p>
                )}
                
                {user.current_playlist && (
                  <p className="text-sm font-aeonik-regular text-gray-400">
                    🎵 {user.current_playlist}
                  </p>
                )}
              </div>
            ))}
        </div>
      </CardSpotlight>
    </div>
  );
};

export default UserStatus;
