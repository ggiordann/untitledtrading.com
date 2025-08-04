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

    const events = await allQuery(`
      SELECT ce.*, u.username 
      FROM calendar_events ce 
      JOIN users u ON ce.user_id = u.id 
      ORDER BY ce.start_date ASC
    `);

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, start_date, end_date } = body;

    if (!title || !start_date || !end_date) {
      return NextResponse.json({ error: 'Title, start_date, and end_date are required' }, { status: 400 });
    }

    const result = await runQuery(
      'INSERT INTO calendar_events (user_id, title, description, start_date, end_date) VALUES (?, ?, ?, ?, ?)',
      [session.user.id, title, description || '', start_date, end_date]
    );

    const newEvent = {
      id: result.lastID,
      user_id: session.user.id,
      title,
      description: description || '',
      start_date,
      end_date,
      username: session.user.username,
      created_at: new Date().toISOString()
    };

    return NextResponse.json(newEvent);
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
