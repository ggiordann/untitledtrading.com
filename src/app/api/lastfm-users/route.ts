import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { runQuery, getQuery, allQuery } from '../../../../lib/database';

// Last.fm API key - you'll need to get this from last.fm/api
const LASTFM_API_KEY = process.env.NEXT_PUBLIC_LASTFM_API_KEY;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const users = await allQuery('SELECT * FROM lastfm_users ORDER BY username');
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching Last.fm users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { username } = await request.json();

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    // Check if user already exists
    const existing = await getQuery(
      'SELECT * FROM lastfm_users WHERE username = ?',
      [username]
    );

    if (existing) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    // Create new user
    await runQuery(
      'INSERT INTO lastfm_users (username, lastfm_username) VALUES (?, ?)',
      [username, username]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding Last.fm user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    await runQuery('DELETE FROM lastfm_users WHERE username = ?', [username]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting Last.fm user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Function to get current playing track from Last.fm
async function getCurrentTrack(lastfmUsername: string) {
  try {
    const response = await fetch(
      `http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${lastfmUsername}&api_key=${LASTFM_API_KEY}&format=json&limit=1`
    );
    
    if (!response.ok) {
      throw new Error('Last.fm API request failed');
    }
    
    const data = await response.json();
    const track = data.recenttracks?.track?.[0];
    
    if (track && track['@attr']?.nowplaying) {
      return {
        name: track.name,
        artist: track.artist['#text'] || track.artist,
        album: track.album['#text'] || track.album,
        image: track.image?.[2]?.['#text'] || '', // medium size image
        nowPlaying: true
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching current track:', error);
    return null;
  }
}
