'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { CardSpotlight } from '../../../components/ui/card-spotlight';

const AdminPage = () => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const runLeaderboardCleanup = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/cleanup-leaderboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      setResults({ type: 'leaderboard', data });
    } catch (error) {
      setResults({ type: 'error', data: { error: 'Failed to cleanup leaderboard' } });
    } finally {
      setLoading(false);
    }
  };

  const runSessionsCleanup = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/cleanup-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      setResults({ type: 'sessions', data });
    } catch (error) {
      setResults({ type: 'error', data: { error: 'Failed to cleanup sessions' } });
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-aeonik-bold mb-4">Admin Panel</h1>
          <p className="text-gray-400">Please sign in to access admin functions</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-aeonik-bold mb-8">Admin Panel</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CardSpotlight className="p-6">
          <h2 className="text-xl font-aeonik-bold mb-4">Leaderboard Cleanup</h2>
          <p className="text-gray-400 mb-4">
            Removes duplicate user entries from the leaderboard stats table.
          </p>
          <button
            onClick={runLeaderboardCleanup}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-aeonik-regular py-2 px-4 rounded-lg transition duration-200"
          >
            {loading ? 'Running...' : 'Clean Leaderboard'}
          </button>
        </CardSpotlight>

        <CardSpotlight className="p-6">
          <h2 className="text-xl font-aeonik-bold mb-4">Study Sessions Cleanup</h2>
          <p className="text-gray-400 mb-4">
            Fixes invalid timestamps and ends sessions with unreasonable durations.
          </p>
          <button
            onClick={runSessionsCleanup}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-aeonik-regular py-2 px-4 rounded-lg transition duration-200"
          >
            {loading ? 'Running...' : 'Clean Sessions'}
          </button>
        </CardSpotlight>
      </div>

      {results && (
        <CardSpotlight className="p-6">
          <h2 className="text-xl font-aeonik-bold mb-4">Results</h2>
          <div className="bg-gray-900 p-4 rounded-lg">
            <pre className="text-sm text-gray-300 whitespace-pre-wrap">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        </CardSpotlight>
      )}
    </div>
  );
};

export default AdminPage;
