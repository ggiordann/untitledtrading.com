'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { CardSpotlight } from '../../../components/ui/card-spotlight';

interface Playlist {
  name: string;
  creator: string;
  url: string;
  genre: string;
  description?: string;
}

interface LastFmTrack {
  name: string;
  artist: string;
  album?: string;
  image?: string;
  url?: string;
  nowplaying?: boolean;
}

interface LastFmUser {
  username: string;
  lastfm_username?: string;
  track?: LastFmTrack;
  error?: string;
  imageLoaded?: boolean;
}

const MusicPlaylist = () => {
  const { data: session } = useSession();
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [customPlaylists, setCustomPlaylists] = useState<Playlist[]>([]);
  const [lastFmUsers, setLastFmUsers] = useState<LastFmUser[]>([]);
  const [lastFmUsername, setLastFmUsername] = useState('');
  const [showLastFmForm, setShowLastFmForm] = useState(false);
  const [lastFmLoading, setLastFmLoading] = useState(true);
  const [imageLoadingStates, setImageLoadingStates] = useState<{ [key: string]: boolean }>({});
  const [newPlaylist, setNewPlaylist] = useState({
    name: '',
    url: '',
    genre: 'study',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initializeData = async () => {
      fetchCustomPlaylists();
      await fetchPersistedLastFmUsers(); // Wait for users to load first
    };
    
    initializeData();
  }, []);

  // Separate useEffect for polling Last.fm data after users are loaded
  useEffect(() => {
    if (lastFmUsers.length === 0) return;
    
    // Fetch Last.fm data immediately and then every 30 seconds
    fetchLastFmData();
    const interval = setInterval(fetchLastFmData, 30000);
    return () => clearInterval(interval);
  }, [lastFmUsers.map(u => u.username).join(',')]); // Re-run when users change

  const handleImageLoad = (username: string) => {
    setImageLoadingStates(prev => ({
      ...prev,
      [username]: true
    }));
  };

  const handleImageError = (username: string) => {
    setImageLoadingStates(prev => ({
      ...prev,
      [username]: false
    }));
  };

  const fetchPersistedLastFmUsers = async () => {
    try {
      const response = await fetch('/api/lastfm-users');
      if (response.ok) {
        const persistedUsers = await response.json();
        // Convert to the format expected by the component, preserving both usernames
        setLastFmUsers(persistedUsers.map((u: any) => ({ 
          username: u.username,
          lastfm_username: u.lastfm_username 
        })));
      }
    } catch (error) {
      console.error('Error fetching persisted Last.fm users:', error);
    }
  };

  const fetchLastFmData = async () => {
    setLastFmLoading(true);
    
    // Get users from the current lastFmUsers state
    if (lastFmUsers.length === 0) {
      setLastFmLoading(false);
      return;
    }
    
    const updatedUsers: LastFmUser[] = [];

    for (const user of lastFmUsers) {
      try {
        const response = await fetch(`/api/lastfm-users/current-track?username=${encodeURIComponent(user.username)}`);
        
        if (response.ok) {
          const trackData = await response.json();
          
          // Pre-load the image if it exists
          if (trackData.image) {
            const img = new Image();
            img.onload = () => handleImageLoad(user.username);
            img.onerror = () => handleImageError(user.username);
            img.src = trackData.image;
          }
          
          updatedUsers.push({
            username: user.username,
            lastfm_username: user.lastfm_username,
            track: {
              name: trackData.name,
              artist: trackData.artist,
              album: trackData.album,
              image: trackData.image,
              url: trackData.url || '',
              nowplaying: trackData.nowPlaying
            }
          });
        } else {
          // Keep the user but without track data
          updatedUsers.push({
            username: user.username,
            lastfm_username: user.lastfm_username,
            error: response.status === 404 ? 'No recent tracks' : 'Failed to fetch'
          });
        }
      } catch (error) {
        console.error(`Error fetching Last.fm data for ${user.username}:`, error);
        updatedUsers.push({
          username: user.username,
          lastfm_username: user.lastfm_username,
          error: 'Failed to fetch'
        });
      }
    }
    
    setLastFmUsers(updatedUsers);
    setLastFmLoading(false);
  };

  const addLastFmUser = async () => {
    if (!lastFmUsername.trim()) return;
    
    try {
      // First, save to database
      const saveResponse = await fetch('/api/lastfm-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: lastFmUsername }),
      });

      if (!saveResponse.ok) {
        if (saveResponse.status === 409) {
          alert('This Last.fm user is already added');
          return;
        }
        throw new Error('Failed to save user');
      }

      // Then fetch their current track using our API
      const newUser: LastFmUser = {
        username: lastFmUsername,
        lastfm_username: lastFmUsername
      };

      try {
        const trackResponse = await fetch(`/api/lastfm-users/current-track?username=${encodeURIComponent(lastFmUsername)}`);
        
        if (trackResponse.ok) {
          const trackData = await trackResponse.json();
          
          // Pre-load the image for new user
          if (trackData.image) {
            const img = new Image();
            img.onload = () => handleImageLoad(lastFmUsername);
            img.onerror = () => handleImageError(lastFmUsername);
            img.src = trackData.image;
          }
          
          newUser.track = {
            name: trackData.name,
            artist: trackData.artist,
            album: trackData.album,
            image: trackData.image,
            url: trackData.url || '',
            nowplaying: trackData.nowPlaying
          };
        }
      } catch (trackError) {
        console.error('Error fetching track for new user:', trackError);
        // Continue without track data
      }
      
      setLastFmUsers(prev => [...prev, newUser]);
      setLastFmUsername('');
      setShowLastFmForm(false);
    } catch (error) {
      console.error('Error adding Last.fm user:', error);
      alert('Failed to add Last.fm user. Please try again.');
    }
  };

  const removeLastFmUser = async (username: string) => {
    try {
      const deleteResponse = await fetch(`/api/lastfm-users?username=${encodeURIComponent(username)}`, {
        method: 'DELETE',
      });

      if (deleteResponse.ok) {
        setLastFmUsers(prev => prev.filter(user => user.username !== username));
      } else {
        throw new Error('Failed to remove user');
      }
    } catch (error) {
      console.error('Error removing Last.fm user:', error);
      alert('Failed to remove Last.fm user. Please try again.');
    }
  };

  const fetchCustomPlaylists = async () => {
    try {
      const response = await fetch('/api/playlists');
      if (response.ok) {
        const data = await response.json();
        setCustomPlaylists(data);
      }
    } catch (error) {
      console.error('Error fetching custom playlists:', error);
    }
  };

  const playlists: Playlist[] = [
    // Study Playlists
    {
      name: 'hyper focus',
      creator: 'spotify',
      url: 'https://open.spotify.com/playlist/37i9dQZF1DX6iSJxWbeWLf?si=5f62231106474e8d',
      genre: 'study',
      description: 'intense focus music for deep work sessions'
    },
    {
      name: 'maison margiela jazz club',
      creator: 'giordan',
      url: 'https://open.spotify.com/playlist/4H6KeKVj6COwtGbMyRb9Nv?si=8b391bdae1d74a76',
      genre: 'study',
      description: 'sophisticated jazz for studying and contemplation'
    },
    {
      name: 'percussionist',
      creator: 'ghazi',
      url: 'https://open.spotify.com/playlist/5nfsryT4TErnuXuwvwSIdb?si=12d005bb15ed4d66',
      genre: 'study',
      description: 'rhythmic beats to keep you energized while studying'
    },
    {
      name: 'study',
      creator: 'kalan',
      url: 'https://open.spotify.com/playlist/7n3hWimNGlKMhli58NDyJN?si=17a294dc82ff47b7',
      genre: 'study',
      description: 'mac + others study playlist'
    },

    // Rap Playlists
    {
      name: 'home',
      creator: 'giordan, ghazi & kalan',
      url: 'https://open.spotify.com/playlist/1uyoBlnoq19JAeqXyF7Ppb?si=f143d3e4c2b8481d',
      genre: 'rap',
      description: 'collaborative rap playlist by the team'
    },
    {
      name: '💽',
      creator: 'giordan, ghazi',
      url: 'https://open.spotify.com/playlist/6cYHuycQWFlwg32iDUUrIs?si=97ef7a9a0392429c',
      genre: 'rap',
      description: 'curated rap tracks for motivation'
    },
    {
      name: 'blast!',
      creator: 'ghazi, giordan',
      url: 'https://open.spotify.com/playlist/5y6KieF7VjFiSNKgKjfyc6?si=a9fc054a380946a8',
      genre: 'rap',
      description: 'high-energy rap'
    },

    // Archive Playlists
    {
      name: 'archive4',
      creator: 'giordan',
      url: 'https://open.spotify.com/playlist/6l2sg90ctxyCmUCmseo3uf?si=d947b4475e02413a',
      genre: 'archive',
      description: 'collection of memorable tracks from the past'
    },
    {
      name: 'sonder',
      creator: 'ghazi',
      url: 'https://open.spotify.com/playlist/0H7E07qUHAeWOpzfqpOleO?si=0a0d88f214c94c3e',
      genre: 'archive',
      description: 'introspective and thoughtful music collection'
    },

    // Soul Playlists
    {
      name: 'time',
      creator: 'giordan, ghazi & kalan',
      url: 'https://open.spotify.com/playlist/17D0J75huwrqU0vZ9Aalyy?si=348910d6974f485b',
      genre: 'soul',
      description: 'soulful tracks that transcend time'
    }
  ];

  const genres = [
    { id: 'all', label: 'all playlists', icon: '' },
    { id: 'study', label: 'study', icon: '' },
    { id: 'rap', label: 'rap', icon: '' },
    { id: 'archive', label: 'archive', icon: '' },
    { id: 'soul', label: 'soul', icon: '' }
  ];

  // Combine default playlists with custom ones
  const allPlaylists = [...playlists, ...customPlaylists];

  const filteredPlaylists = selectedGenre === 'all' 
    ? allPlaylists 
    : allPlaylists.filter(playlist => playlist.genre === selectedGenre);

  const addPlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylist.name.trim() || !newPlaylist.url.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/playlists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPlaylist),
      });

      if (response.ok) {
        const createdPlaylist = await response.json();
        setCustomPlaylists(prev => [createdPlaylist, ...prev]);
        setNewPlaylist({
          name: '',
          url: '',
          genre: 'study',
          description: ''
        });
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Error adding playlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCreatorColor = (creator: string) => {
    return 'text-gray-400';
  };

  const getGenreColor = (genre: string) => {
    switch (genre) {
      case 'study': return 'bg-blue-600/20 text-blue-400 border-blue-400/30';
      case 'rap': return 'bg-red-600/20 text-red-400 border-red-400/30';
      case 'archive': return 'bg-yellow-600/20 text-yellow-400 border-yellow-400/30';
      case 'soul': return 'bg-purple-600/20 text-purple-400 border-purple-400/30';
      default: return 'bg-gray-600/20 text-gray-400 border-gray-400/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-center">
        <div className="flex space-x-3">
          <button
            onClick={() => setShowLastFmForm(!showLastFmForm)}
            className="bg-red-600/60 backdrop-blur-sm hover:bg-red-700/60 border border-red-500/20 text-white font-aeonik-regular py-2 px-4 rounded-lg transition-all duration-200 hover:shadow-md hover:shadow-red-500/10"
          >
            {showLastFmForm ? 'cancel' : 'add last.fm user'}
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-black/80 backdrop-blur-sm hover:bg-gray-900/80 border border-white/40 hover:border-white/60 text-white font-aeonik-regular py-2 px-4 rounded-lg transition-all duration-200 hover:shadow-md hover:shadow-white/10"
          >
            {showAddForm ? 'cancel' : 'add playlist'}
          </button>
        </div>
      </div>

      {/* Add Last.fm User Form */}
      {showLastFmForm && (
        <CardSpotlight className="p-6">
          <h3 className="font-aeonik-bold text-lg mb-4">add last.fm user</h3>
          <div className="flex space-x-3">
            <input
              type="text"
              value={lastFmUsername}
              onChange={(e) => setLastFmUsername(e.target.value)}
              placeholder="last.fm username"
              className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none font-aeonik-regular"
            />
            <button
              onClick={addLastFmUser}
              disabled={!lastFmUsername.trim()}
              className="bg-red-600/60 backdrop-blur-sm hover:bg-red-700/60 border border-red-500/20 disabled:bg-gray-600/40 disabled:border-gray-500/20 text-white font-aeonik-regular py-2 px-4 rounded-lg transition-all duration-200"
            >
              add user
            </button>
          </div>
        </CardSpotlight>
      )}

      {/* Currently Listening - Last.fm Integration */}
      {lastFmLoading ? (
        <CardSpotlight className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-400"></div>
            <span className="ml-3 font-aeonik-regular text-gray-400">loading music data...</span>
          </div>
        </CardSpotlight>
      ) : lastFmUsers.length > 0 && (
        <CardSpotlight className="p-6">
          <div className="mb-6">
            <h3 className="font-aeonik-bold text-xl">listening activity</h3>
          </div>
          <div className="space-y-4">
            {lastFmUsers.map((user, index) => (
              <div key={index} className="p-4 bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg shadow-lg hover:bg-white/10 transition-all duration-200">
                <div className="flex items-center space-x-4">
                  {user.track?.image ? (
                    <div className="relative w-16 h-16">
                      {!imageLoadingStates[user.username] && (
                        <div className="absolute inset-0 bg-gray-800 rounded-lg animate-pulse flex items-center justify-center">
                          <div className="w-8 h-8 border-2 border-gray-600 border-t-gray-400 rounded-full animate-spin"></div>
                        </div>
                      )}
                      <img
                        src={user.track.image}
                        alt="Album art"
                        className={`w-16 h-16 rounded-lg object-cover shadow-lg transition-opacity duration-300 ${
                          imageLoadingStates[user.username] ? 'opacity-100' : 'opacity-0'
                        }`}
                        onLoad={() => handleImageLoad(user.username)}
                        onError={() => handleImageError(user.username)}
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center">
                      <div className="text-gray-500 text-xs">No Art</div>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <p className="font-aeonik-bold text-lg text-white">@{user.username}</p>
                      {user.track?.nowplaying ? (
                        <span className="px-3 py-1 bg-green-500/20 backdrop-blur-sm border border-green-400/30 text-green-400 text-sm rounded-full font-aeonik-medium flex items-center">
                          <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                          LIVE
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-gray-500/20 backdrop-blur-sm border border-gray-400/30 text-gray-400 text-sm rounded-full font-aeonik-medium">
                          OFFLINE
                        </span>
                      )}
                    </div>
                    {user.track ? (
                      <div className="space-y-1">
                        <p className="font-aeonik-medium text-base text-white">
                          {user.track.name}
                        </p>
                        <p className="font-aeonik-regular text-sm text-gray-300">
                          by {user.track.artist}
                        </p>
                        {user.track.album && (
                          <p className="font-aeonik-regular text-xs text-gray-400">
                            from {user.track.album}
                          </p>
                        )}
                        <a
                          href={`https://www.last.fm/user/${user.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-red-400 hover:text-red-300 text-sm font-aeonik-regular inline-flex items-center mt-2 hover:underline transition-colors"
                        >
                          view profile →
                        </a>
                      </div>
                    ) : user.error ? (
                      <p className="text-red-400 text-sm font-aeonik-regular">{user.error}</p>
                    ) : (
                      <p className="text-gray-400 text-sm font-aeonik-regular">no recent tracks</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeLastFmUser(user.username)}
                    className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                    title="Remove user"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardSpotlight>
      )}

      {/* Add Playlist Form */}
      {showAddForm && (
        <CardSpotlight className="p-6">
          <h3 className="font-aeonik-bold text-lg mb-4">Add New Playlist</h3>
          <form onSubmit={addPlaylist} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-aeonik-regular text-gray-300 mb-2">
                  Playlist Name
                </label>
                <input
                  type="text"
                  value={newPlaylist.name}
                  onChange={(e) => setNewPlaylist({ ...newPlaylist, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-aeonik-regular"
                  placeholder="Enter playlist name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-aeonik-regular text-gray-300 mb-2">
                  Genre
                </label>
                <select
                  value={newPlaylist.genre}
                  onChange={(e) => setNewPlaylist({ ...newPlaylist, genre: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-aeonik-regular"
                  required
                >
                  <option value="study">Study</option>
                  <option value="rap">Rap</option>
                  <option value="archive">Archive</option>
                  <option value="soul">Soul</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-aeonik-regular text-gray-300 mb-2">
                Spotify URL
              </label>
              <input
                type="url"
                value={newPlaylist.url}
                onChange={(e) => setNewPlaylist({ ...newPlaylist, url: e.target.value })}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-aeonik-regular"
                placeholder="https://open.spotify.com/playlist/..."
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-aeonik-regular text-gray-300 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={newPlaylist.description}
                onChange={(e) => setNewPlaylist({ ...newPlaylist, description: e.target.value })}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-aeonik-regular"
                placeholder="Describe your playlist..."
                rows={2}
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black/80 backdrop-blur-sm hover:bg-gray-900/80 border border-white/40 hover:border-white/60 disabled:bg-gray-600/40 disabled:border-gray-500/20 text-white font-aeonik-regular py-2 rounded-lg transition-all duration-200 hover:shadow-md hover:shadow-white/10"
            >
              {loading ? 'adding...' : 'add playlist'}
            </button>
          </form>
        </CardSpotlight>
      )}

      {/* Genre Filter */}
      <div className="flex flex-wrap justify-center gap-3">
        {genres.map((genre) => (
          <button
            key={genre.id}
            onClick={() => setSelectedGenre(genre.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              selectedGenre === genre.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <span className="font-aeonik-regular">{genre.label}</span>
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {genres.slice(1).map((genre) => {
          const count = allPlaylists.filter(p => p.genre === genre.id).length;
          return (
            <CardSpotlight key={genre.id} className="p-4 text-center">
              <div className="text-lg font-aeonik-bold">{count}</div>
              <div className="text-xs font-aeonik-regular text-gray-400 capitalize">
                {genre.label} Playlists
              </div>
            </CardSpotlight>
          );
        })}
      </div>

      {/* Playlists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlaylists.map((playlist, index) => (
          <CardSpotlight key={index} className="p-6 h-full flex flex-col">
            <div className="flex-1">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-aeonik-bold text-lg">{playlist.name}</h3>
                <span className={`px-2 py-1 text-xs rounded border ${getGenreColor(playlist.genre)}`}>
                  {playlist.genre.toUpperCase()}
                </span>
              </div>
              
              <p className={`font-aeonik-medium text-sm mb-3 ${getCreatorColor(playlist.creator)}`}>
                created by {playlist.creator}
              </p>
              
              {playlist.description && (
                <p className="font-aeonik-regular text-sm text-gray-400 mb-4">
                  {playlist.description}
                </p>
              )}
            </div>
            
            <a
              href={playlist.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-black/80 backdrop-blur-sm hover:bg-gray-900/80 border border-white/40 hover:border-white/60 text-white font-aeonik-regular py-2 px-4 rounded-lg transition-all duration-200 text-center flex items-center justify-center space-x-2 hover:shadow-md hover:shadow-white/10"
            >
              <span>open in spotify</span>
            </a>
          </CardSpotlight>
        ))}
      </div>

      {filteredPlaylists.length === 0 && (
        <CardSpotlight className="p-8 text-center">
          <h3 className="font-aeonik-bold text-lg mb-2">No playlists found</h3>
          <p className="font-aeonik-regular text-gray-400">
            Try selecting a different genre or check back later for new playlists.
          </p>
        </CardSpotlight>
      )}
    </div>
  );
};

export default MusicPlaylist;
