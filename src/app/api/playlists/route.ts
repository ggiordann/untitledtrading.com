import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { runQuery, allQuery } from '../../../../lib/database';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const playlists = await allQuery('SELECT * FROM playlists ORDER BY created_at DESC');
    return NextResponse.json(playlists);
  } catch (error) {
    console.error('Error fetching playlists:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, url, genre, description } = await request.json();

    if (!name || !url || !genre) {
      return NextResponse.json({ error: 'Name, URL, and genre are required' }, { status: 400 });
    }

    const result = await runQuery(
      'INSERT INTO playlists (user_id, name, url, genre, description, creator) VALUES ((SELECT id FROM users WHERE username = ?), ?, ?, ?, ?, ?)',
      [session.user.username, name, url, genre, description || '', session.user.username]
    );

    const newPlaylist = {
      id: result.lastID,
      name,
      url,
      genre,
      description: description || '',
      creator: session.user.username,
      created_at: new Date().toISOString()
    };

    return NextResponse.json(newPlaylist, { status: 201 });
  } catch (error) {
    console.error('Error creating playlist:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
