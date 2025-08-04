import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { runQuery, getQuery, allQuery } from '../../../../lib/database';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all users with their status and notes
    const users = await allQuery(`
      SELECT id, username, status, notes, current_playlist
      FROM users
      ORDER BY username
    `);

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching user status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status, notes, current_playlist } = await request.json();

    // Update user's status, notes, and current playlist
    await runQuery(
      'UPDATE users SET status = COALESCE(?, status), notes = COALESCE(?, notes), current_playlist = COALESCE(?, current_playlist) WHERE username = ?',
      [status, notes, current_playlist, session.user.username]
    );

    // Get updated user data
    const updatedUser = await getQuery(
      'SELECT id, username, status, notes, current_playlist FROM users WHERE username = ?',
      [session.user.username]
    );

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
