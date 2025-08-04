import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth';
import { getQuery } from '../../../../../lib/database';

const LASTFM_API_KEY = process.env.NEXT_PUBLIC_LASTFM_API_KEY;

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username') || session.user.username;

    // Get Last.fm username mapping
    const lastfmUser = await getQuery(
      'SELECT lastfm_username FROM lastfm_users WHERE username = ?',
      [username]
    );

    if (!lastfmUser) {
      return NextResponse.json({ error: 'No Last.fm account linked' }, { status: 404 });
    }

    // Fetch current track from Last.fm
    const response = await fetch(
      `http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${lastfmUser.lastfm_username}&api_key=${LASTFM_API_KEY}&format=json&limit=1`
    );
    
    if (!response.ok) {
      throw new Error('Last.fm API request failed');
    }
    
    const data = await response.json();
    const track = data.recenttracks?.track?.[0];
    
    if (track) {
      const currentTrack = {
        name: track.name,
        artist: track.artist['#text'] || track.artist,
        album: track.album?.['#text'] || '',
        image: track.image?.[2]?.['#text'] || '', // medium size image
        nowPlaying: track['@attr']?.nowplaying === 'true',
        timestamp: track.date?.uts ? parseInt(track.date.uts) * 1000 : Date.now()
      };
      
      return NextResponse.json(currentTrack);
    }
    
    return NextResponse.json({ error: 'No recent tracks found' }, { status: 404 });
  } catch (error) {
    console.error('Error fetching current track:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
