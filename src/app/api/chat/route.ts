import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { runQuery, allQuery } from '../../../../lib/database-vercel';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const messages = await allQuery(`
      SELECT cm.id, cm.user_id, cm.message, cm.created_at, u.username 
      FROM chat_messages cm 
      JOIN users u ON cm.user_id = u.id 
      ORDER BY cm.created_at ASC 
      LIMIT 100
    `);

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Chat POST session:', JSON.stringify(session, null, 2));
    
    if (!session?.user?.id) {
      console.log('No session or user ID:', { 
        hasSession: !!session, 
        hasUser: !!session?.user, 
        userId: session?.user?.id 
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { message } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const result = await runQuery(
      'INSERT INTO chat_messages (user_id, message) VALUES ($1, $2) RETURNING id, user_id, message, created_at',
      [session.user.id, message.trim()]
    );

    console.log('Chat INSERT result:', result);

    if (!result || result.length === 0) {
      throw new Error('Failed to insert chat message - no result returned');
    }

    const newMessage = {
      id: result[0].id,
      user_id: result[0].user_id,
      username: session.user.username || session.user.name,
      message: result[0].message,
      created_at: result[0].created_at
    };

    return NextResponse.json(newMessage);
  } catch (error) {
    console.error('Error creating chat message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
