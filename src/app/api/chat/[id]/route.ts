import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth';
import { runQuery, getQuery } from '../../../../../lib/database';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const messageId = params.id;

    // Verify message belongs to user
    const message = await getQuery(
      'SELECT * FROM chat_messages WHERE id = ? AND user_id = ?',
      [messageId, session.user.id]
    );

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    await runQuery('DELETE FROM chat_messages WHERE id = ?', [messageId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting chat message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
