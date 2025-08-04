import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth';
import { allQuery } from '../../../../../lib/database';

const LASTFM_API_KEY = process.env.NEXT_PUBLIC_LASTFM_API_KEY;

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all Last.fm users from the database
    const lastfmUsers = await allQuery('SELECT * FROM lastfm_users ORDER BY created_at DESC');

    if (!lastfmUsers || lastfmUsers.length === 0) {
      return NextResponse.json({ error: 'No Last.fm accounts linked' }, { status: 404 });
    }

    // Try to find a currently playing track from any user
    for (const user of lastfmUsers) {
      try {
        const response = await fetch(
          `http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${user.lastfm_username}&api_key=${LASTFM_API_KEY}&format=json&limit=1`
        );
        
        if (!response.ok) continue;
        
        const data = await response.json();
        const track = data.recenttracks?.track?.[0];
        
        if (track && track['@attr']?.nowplaying === 'true') {
          // Found a currently playing track
          const currentTrack = {
            name: track.name,
            artist: track.artist['#text'] || track.artist,
            album: track.album?.['#text'] || '',
            image: track.image?.[2]?.['#text'] || '', // medium size image
            nowPlaying: true,
            timestamp: Date.now(),
            username: user.username
          };
          
          return NextResponse.json(currentTrack);
        }
      } catch (error) {
        console.error(`Error fetching track for ${user.lastfm_username}:`, error);
        continue;
      }
    }

    // No currently playing tracks found, get the most recent track from the first user
    try {
      const firstUser = lastfmUsers[0];
      const response = await fetch(
        `http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${firstUser.lastfm_username}&api_key=${LASTFM_API_KEY}&format=json&limit=1`
      );
      
      if (response.ok) {
        const data = await response.json();
        const track = data.recenttracks?.track?.[0];
        
        if (track) {
          const currentTrack = {
            name: track.name,
            artist: track.artist['#text'] || track.artist,
            album: track.album?.['#text'] || '',
            image: track.image?.[2]?.['#text'] || '', // medium size image
            nowPlaying: false,
            timestamp: track.date?.uts ? parseInt(track.date.uts) * 1000 : Date.now(),
            username: firstUser.username
          };
          
          return NextResponse.json(currentTrack);
        }
      }
    } catch (error) {
      console.error('Error fetching recent track:', error);
    }

    return NextResponse.json({ error: 'No recent tracks found' }, { status: 404 });
  } catch (error) {
    console.error('Error in any-track endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
