import { NextResponse } from 'next/server';
import { allQuery, runQuery } from '../../../../lib/database';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const tasks = await allQuery('SELECT * FROM tasks WHERE user_id = ?', [session.user.id]);
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { title, description, priority, status, subject, due_date } = await req.json();

  if (!title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }

  try {
    const result = runQuery(
      'INSERT INTO tasks (user_id, title, description, priority, status, subject, due_date, completed) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
      [session.user.id, title, description || '', priority || 'medium', status || 'not_started', subject || '', due_date || '', false]
    );
    const newTask = await allQuery('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [result.lastInsertRowid, session.user.id]);
    return NextResponse.json(newTask[0], { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}