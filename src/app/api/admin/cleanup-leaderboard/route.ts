import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth';
import { runQuery, allQuery } from '../../../../../lib/database';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only allow admin users (you can add your own admin check here)
    // For now, let's just allow any authenticated user to run this cleanup
    
    console.log('Starting leaderboard cleanup...');
    
    // Step 1: Find and log duplicate entries
    const duplicates = await allQuery(`
      SELECT user_id, COUNT(*) as count
      FROM leaderboard_stats 
      GROUP BY user_id 
      HAVING COUNT(*) > 1
    `);
    
    console.log('Found duplicate entries for users:', duplicates);
    
    // Step 2: For each user with duplicates, keep only the most recent entry
    for (const duplicate of duplicates) {
      const userId = duplicate.user_id;
      
      // Get all entries for this user, ordered by last_updated DESC
      const userEntries = await allQuery(`
        SELECT * FROM leaderboard_stats 
        WHERE user_id = ? 
        ORDER BY last_updated DESC, id DESC
      `, [userId]);
      
      if (userEntries.length > 1) {
        // Keep the first one (most recent), delete the rest
        const keepEntry = userEntries[0];
        const deleteEntries = userEntries.slice(1);
        
        console.log(`For user ${userId}: keeping entry ${keepEntry.id}, deleting ${deleteEntries.length} duplicates`);
        
        // Delete duplicate entries
        for (const deleteEntry of deleteEntries) {
          await runQuery('DELETE FROM leaderboard_stats WHERE id = ?', [deleteEntry.id]);
        }
      }
    }
    
    // Step 3: Verify cleanup
    const remainingDuplicates = await allQuery(`
      SELECT user_id, COUNT(*) as count
      FROM leaderboard_stats 
      GROUP BY user_id 
      HAVING COUNT(*) > 1
    `);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Leaderboard cleanup completed',
      duplicatesFound: duplicates.length,
      duplicatesRemaining: remainingDuplicates.length,
      details: {
        before: duplicates,
        after: remainingDuplicates
      }
    });
    
  } catch (error) {
    console.error('Error cleaning up leaderboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
