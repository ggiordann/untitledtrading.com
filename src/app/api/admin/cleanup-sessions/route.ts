import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth';
import { runQuery, allQuery } from '../../../../../lib/database-vercel';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Starting study sessions cleanup...');
    
    // Step 1: Find sessions with invalid start_time
    const invalidSessions = await allQuery(`
      SELECT id, user_id, start_time, status 
      FROM study_sessions 
      WHERE status = 'active'
    `);
    
    let fixedSessions = 0;
    let endedSessions = 0;
    
    const now = new Date();
    
    for (const sessionData of invalidSessions) {
      const startTime = new Date(sessionData.start_time);
      
      // Check if start time is invalid or too far in the past/future
      if (isNaN(startTime.getTime())) {
        console.log(`Invalid start_time for session ${sessionData.id}: ${sessionData.start_time}`);
        // End this session as it's corrupted
        await runQuery(
          'UPDATE study_sessions SET status = "ended", end_time = ? WHERE id = ?',
          [now.toISOString(), sessionData.id]
        );
        endedSessions++;
      } else {
        const elapsed = (now.getTime() - startTime.getTime()) / 1000;
        
        // If session is more than 24 hours old or starts in future, end it
        if (elapsed > 86400 || elapsed < -300) { // 5 minutes tolerance for future times
          console.log(`Session ${sessionData.id} has unreasonable time. Elapsed: ${elapsed}s, Start: ${sessionData.start_time}`);
          await runQuery(
            'UPDATE study_sessions SET status = "ended", end_time = ? WHERE id = ?',
            [now.toISOString(), sessionData.id]
          );
          endedSessions++;
        } else {
          // Session is valid but let's update the start_time format to ISO string
          await runQuery(
            'UPDATE study_sessions SET start_time = ? WHERE id = ?',
            [startTime.toISOString(), sessionData.id]
          );
          fixedSessions++;
        }
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Study sessions cleanup completed',
      sessionsChecked: invalidSessions.length,
      sessionsFixed: fixedSessions,
      sessionsEnded: endedSessions
    });
    
  } catch (error) {
    console.error('Error cleaning up study sessions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
