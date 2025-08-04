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

    const messages = await allQuery(
      'SELECT * FROM chat_messages ORDER BY created_at ASC LIMIT 100'
    );

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching chat messages:', error);
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
    const { message } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const result = await runQuery(
      'INSERT INTO chat_messages (user_id, username, message) VALUES (?, ?, ?)',
      [session.user.id, session.user.username, message.trim()]
    );

    const newMessage = {
      id: result.lastID,
      user_id: session.user.id,
      username: session.user.username,
      message: message.trim(),
      created_at: new Date().toISOString()
    };

    return NextResponse.json(newMessage);
  } catch (error) {
    console.error('Error creating chat message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
