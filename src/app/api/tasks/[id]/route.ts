import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth';
import { runQuery, getQuery } from '../../../../../lib/database';

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const taskId = params.id;
    const body = await request.json();
    const { completed } = body;

    // Verify task belongs to user
    const task = await getQuery(
      'SELECT * FROM tasks WHERE id = ? AND user_id = ?',
      [taskId, session.user.id]
    );

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    await runQuery(
      'UPDATE tasks SET completed = ? WHERE id = ?',
      [completed, taskId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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
    const taskId = params.id;

    // Verify task belongs to user
    const task = await getQuery(
      'SELECT * FROM tasks WHERE id = ? AND user_id = ?',
      [taskId, session.user.id]
    );

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    await runQuery('DELETE FROM tasks WHERE id = ?', [taskId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
