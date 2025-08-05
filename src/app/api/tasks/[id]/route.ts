import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth';
import { runQuery, getQuery } from '../../../../../lib/database-vercel';

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const taskId = params.id;
    const body = await request.json();
    const { title, description, priority, status, due_date, completed } = body;

    // Verify task belongs to user
    const task = await getQuery(
      'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
      [taskId, session.user.id]
    );

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Build update query dynamically based on provided fields
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramCount}`);
      values.push(title);
      paramCount++;
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount}`);
      values.push(description);
      paramCount++;
    }
    if (priority !== undefined) {
      updates.push(`priority = $${paramCount}`);
      values.push(priority);
      paramCount++;
    }
    if (status !== undefined) {
      updates.push(`status = $${paramCount}`);
      values.push(status);
      paramCount++;
    }
    if (due_date !== undefined) {
      updates.push(`due_date = $${paramCount}`);
      values.push(due_date);
      paramCount++;
    }
    if (completed !== undefined) {
      updates.push(`completed = $${paramCount}`);
      values.push(completed);
      paramCount++;
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    values.push(taskId);
    await runQuery(
      `UPDATE tasks SET ${updates.join(', ')} WHERE id = $${paramCount}`,
      values
    );

    // Return updated task
    const updatedTask = await getQuery(
      'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
      [taskId, session.user.id]
    );

    return NextResponse.json(updatedTask);
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
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const taskId = params.id;

    // Verify task belongs to user
    const task = await getQuery(
      'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
      [taskId, session.user.id]
    );

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    await runQuery('DELETE FROM tasks WHERE id = $1', [taskId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
