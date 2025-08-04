import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import OpenAI from 'openai';
import { allQuery, runQuery, getQuery } from '../../../../lib/database-vercel';

function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// Define available tools for the AI assistant
const tools = [
  {
    type: "function" as const,
    function: {
      name: "get_tasks",
      description: "Get user's tasks with optional status filter",
      parameters: {
        type: "object",
        properties: {
          status: {
            type: "string",
            enum: ["pending", "completed", "all"],
            description: "Filter tasks by status"
          }
        }
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "add_task",
      description: "Add a new task for the user",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Task title" },
          description: { type: "string", description: "Task description" },
          priority: {
            type: "string",
            enum: ["low", "medium", "high"],
            description: "Task priority level"
          },
          due_date: { type: "string", description: "Due date in YYYY-MM-DD format" }
        },
        required: ["title"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "get_chat_messages",
      description: "Get recent chat messages from the team chat",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "number", description: "Number of messages to retrieve (default 20)" }
        }
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "send_chat_message",
      description: "Send a message to the team chat",
      parameters: {
        type: "object",
        properties: {
          message: { type: "string", description: "Message content to send" }
        },
        required: ["message"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "get_music_activity",
      description: "Get current music activity for all team members",
      parameters: {
        type: "object",
        properties: {}
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "get_study_sessions",
      description: "Get study session data for users",
      parameters: {
        type: "object",
        properties: {
          username: { type: "string", description: "Optional username to filter by" },
          timeframe: {
            type: "string",
            enum: ["today", "week", "month", "all"],
            description: "Time period to get data for"
          }
        }
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "start_study_session",
      description: "Start a new study session for the user",
      parameters: {
        type: "object",
        properties: {
          duration_minutes: { type: "number", description: "Planned duration in minutes" },
          subject: { type: "string", description: "Subject or topic being studied" }
        },
        required: ["duration_minutes"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "get_user_stats",
      description: "Get productivity stats for a user",
      parameters: {
        type: "object",
        properties: {
          username: { type: "string", description: "Username to get stats for" },
          timeframe: {
            type: "string",
            enum: ["today", "week", "month", "all"],
            description: "Time period for stats"
          }
        }
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "get_leaderboard",
      description: "Get productivity leaderboard for all users",
      parameters: {
        type: "object",
        properties: {
          metric: {
            type: "string",
            enum: ["study_time", "tasks_completed", "overall"],
            description: "Metric to rank by"
          },
          timeframe: {
            type: "string",
            enum: ["today", "week", "month", "all"],
            description: "Time period for leaderboard"
          }
        }
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "update_user_status",
      description: "Update user's status or availability",
      parameters: {
        type: "object",
        properties: {
          status: {
            type: "string",
            enum: ["available", "busy", "studying", "away"],
            description: "New status to set"
          },
          custom_message: { type: "string", description: "Optional custom status message" }
        },
        required: ["status"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "get_user_status",
      description: "Get current status for a user or all users",
      parameters: {
        type: "object",
        properties: {
          username: { type: "string", description: "Username to check, or omit for all users" }
        }
      }
    }
  }
];

// Tool execution functions
async function executeTool(toolName: string, parameters: any, session: any) {
  switch (toolName) {
    case 'get_tasks':
      let query = 'SELECT * FROM tasks WHERE user_id = $1';
      let params = [session.user.id];
      
      if (parameters.status && parameters.status !== 'all') {
        if (parameters.status === 'completed') {
          query += ' AND completed = 1';
        } else if (parameters.status === 'pending') {
          query += ' AND completed = 0';
        }
      }
      
      query += ' ORDER BY created_at DESC';
      const tasks = await allQuery(query, params);
      return { tasks };

    case 'add_task':
      const taskResult = await runQuery(
        'INSERT INTO tasks (user_id, title, description, due_date, status, completed) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        [
          session.user.id,
          parameters.title,
          parameters.description || null,
          parameters.due_date || null,
          'not_started',
          false
        ]
      );
      return { success: true, taskId: taskResult[0].id };

    case 'get_chat_messages':
      try {
        const limit = parameters.limit || 10;
        const messages = await allQuery(
          'SELECT cm.*, u.username FROM chat_messages cm JOIN users u ON cm.user_id = u.id ORDER BY cm.created_at DESC LIMIT $1',
          [limit]
        );
        return { messages: messages.reverse() };
      } catch (error) {
        return { messages: [], note: "Chat system not yet set up" };
      }

    case 'send_chat_message':
      try {
        await runQuery(
          'INSERT INTO chat_messages (user_id, message) VALUES ($1, $2)',
          [session.user.id, parameters.message]
        );
        return { success: true };
      } catch (error) {
        return { error: "Chat system not yet set up" };
      }

    case 'get_music_activity':
      const lastfmUsers = await allQuery('SELECT * FROM lastfm_users');
      const musicActivity = [];
      
      // Use the direct Last.fm API instead of our endpoint to avoid auth issues
      const LASTFM_API_KEY = process.env.NEXT_PUBLIC_LASTFM_API_KEY;
      
      for (const user of lastfmUsers) {
        try {
          const response = await fetch(
            `http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${user.lastfm_username}&api_key=${LASTFM_API_KEY}&format=json&limit=1`
          );
          
          if (response.ok) {
            const data = await response.json();
            const track = data.recenttracks?.track?.[0];
            
            if (track) {
              const isNowPlaying = track['@attr']?.nowplaying === 'true';
              const trackData = {
                name: track.name,
                artist: track.artist['#text'] || track.artist,
                album: track.album?.['#text'] || '',
                nowPlaying: isNowPlaying,
                timestamp: track.date?.uts ? parseInt(track.date.uts) * 1000 : Date.now()
              };
              
              musicActivity.push({
                username: user.username,
                lastfm_username: user.lastfm_username,
                track: trackData
              });
            } else {
              musicActivity.push({
                username: user.username,
                lastfm_username: user.lastfm_username,
                error: 'No recent tracks'
              });
            }
          } else {
            musicActivity.push({
              username: user.username,
              lastfm_username: user.lastfm_username,
              error: 'Failed to fetch from Last.fm'
            });
          }
        } catch (error) {
          musicActivity.push({
            username: user.username,
            lastfm_username: user.lastfm_username,
            error: 'API error'
          });
        }
      }
      return { musicActivity };

    case 'get_study_sessions':
      let studyQuery = `
        SELECT ss.*, u.username 
        FROM study_sessions ss 
        JOIN users u ON ss.user_id = u.id
      `;
      let studyParams = [];
      
      if (parameters.username) {
        studyQuery += ' WHERE u.username = $1';
        studyParams.push(parameters.username);
      }
      
      if (parameters.timeframe) {
        const whereClause = parameters.username ? ' AND' : ' WHERE';
        switch (parameters.timeframe) {
          case 'today':
            studyQuery += `${whereClause} DATE(ss.start_time) = DATE('now')`;
            break;
          case 'week':
            studyQuery += `${whereClause} ss.start_time >= CURRENT_TIMESTAMP - INTERVAL '7 days'`;
            break;
          case 'month':
            studyQuery += `${whereClause} ss.start_time >= CURRENT_TIMESTAMP - INTERVAL '30 days'`;
            break;
        }
      }
      
      studyQuery += ' ORDER BY ss.start_time DESC LIMIT 20';
      const sessions = await allQuery(studyQuery, studyParams);
      return { sessions };

    case 'start_study_session':
      const sessionResult = await runQuery(
        'INSERT INTO study_sessions (user_id, subject, duration_minutes, start_time, session_type, status) VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4, $5) RETURNING id',
        [session.user.id, parameters.subject || 'General Study', parameters.duration_minutes, 'study', 'active']
      );
      return { success: true, sessionId: sessionResult[0].id };

    case 'get_user_stats':
      const username = parameters.username || session.user.username;
      const timeframe = parameters.timeframe || 'all';
      
      // Get user ID first
      const userQuery = await getQuery('SELECT id FROM users WHERE username = $1', [username]);
      if (!userQuery) {
        return { error: 'User not found' };
      }
      
      let statsQuery = `
        SELECT 
          SUM(ps.study_hours) as total_study_hours,
          SUM(ps.tasks_completed) as total_tasks_completed,
          COUNT(ps.id) as active_days
        FROM productivity_stats ps 
        WHERE ps.user_id = $1
      `;
      let statsParams = [userQuery.id];
      
      if (timeframe !== 'all') {
        switch (timeframe) {
          case 'today':
            statsQuery += ' AND ps.date = DATE("now")';
            break;
          case 'week':
            statsQuery += ' AND ps.date >= DATE("now", "-7 days")';
            break;
          case 'month':
            statsQuery += ' AND ps.date >= DATE("now", "-30 days")';
            break;
        }
      }
      
      const stats = await getQuery(statsQuery, statsParams);
      return { stats: { ...stats, username } };

    case 'get_leaderboard':
      const metric = parameters.metric || 'study_time';
      const timeframe_lb = parameters.timeframe || 'all';
      
      let leaderboardQuery = `
        SELECT 
          u.username,
          SUM(ps.study_hours) as total_study_hours,
          SUM(ps.tasks_completed) as total_tasks_completed,
          COUNT(ps.id) as active_days
        FROM productivity_stats ps 
        JOIN users u ON ps.user_id = u.id
      `;
      
      if (timeframe_lb !== 'all') {
        switch (timeframe_lb) {
          case 'today':
            leaderboardQuery += ' WHERE ps.date = DATE("now")';
            break;
          case 'week':
            leaderboardQuery += ' WHERE ps.date >= DATE("now", "-7 days")';
            break;
          case 'month':
            leaderboardQuery += ' WHERE ps.date >= DATE("now", "-30 days")';
            break;
        }
      }
      
      leaderboardQuery += ' GROUP BY u.id, u.username';
      
      if (metric === 'study_time') {
        leaderboardQuery += ' ORDER BY total_study_hours DESC';
      } else if (metric === 'tasks_completed') {
        leaderboardQuery += ' ORDER BY total_tasks_completed DESC';
      } else {
        leaderboardQuery += ' ORDER BY (total_study_hours + total_tasks_completed) DESC';
      }
      
      leaderboardQuery += ' LIMIT 10';
      const leaderboard = await allQuery(leaderboardQuery);
      return { leaderboard };

    case 'update_user_status':
      await runQuery(
        'UPDATE users SET status = $1 WHERE id = $2',
        [parameters.status, session.user.id]
      );
      return { success: true };

    case 'get_user_status':
      if (parameters.username) {
        const userStatus = await getQuery(
          'SELECT username, status FROM users WHERE username = $1',
          [parameters.username]
        );
        return { user: userStatus };
      } else {
        const allStatuses = await allQuery(
          'SELECT username, status FROM users ORDER BY username'
        );
        return { users: allStatuses };
      }

    default:
      return { error: `Unknown tool: ${toolName}` };
  }
}

export async function POST(request: NextRequest) {
  try {
    const openai = getOpenAIClient();
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, messages } = await request.json();
    
    // If it's a new conversation, initialize with context
    let conversationMessages = messages || [];
    
    if (conversationMessages.length === 0) {
      conversationMessages = [
        {
          role: "system",
          content: `You are an AI assistant for ${session.user.username} in their productivity hub. You have access to their tasks, calendar, chat, music activity, study sessions, stats, and more.

Key capabilities:
- Task management (view, add, update tasks)
- Team chat (read messages, send messages)
- Music activity tracking (see what team members are listening to)
- Study session monitoring (see who's studying, start sessions)
- User stats and leaderboard
- Status updates

You should be conversational, helpful, and proactive. When users ask about team members, use their actual usernames. Current team: giordan, ghazi, kalan, asad.

Always use the available tools to get real-time data rather than making assumptions.

Important: Do not use markdown formatting in your responses. Avoid using ### for headers, ** for bold text, or any other markdown syntax. Use plain text with simple formatting like line breaks and basic punctuation only.

DO NOT USE ### OR ** PLEASE! EXTREMELY IMPORTANT!!!!!! YOU WILL BE TERMINATED IF YOU DO THAT UNFORTUNATELY.

`
        }
      ];
    }

    // Add the user's message
    conversationMessages.push({
      role: "user", 
      content: message
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: conversationMessages,
      tools: tools,
      tool_choice: "auto",
      temperature: 0.7,
      max_tokens: 1000,
    });

    const assistantMessage = completion.choices[0].message;
    let responseContent = assistantMessage.content || "";
    
    // Handle tool calls
    if (assistantMessage.tool_calls) {
      const toolResults = [];
      
      for (const toolCall of assistantMessage.tool_calls) {
        try {
          const result = await executeTool(
            toolCall.function.name,
            JSON.parse(toolCall.function.arguments),
            session
          );
          toolResults.push({
            tool_call_id: toolCall.id,
            result: result
          });
        } catch (error) {
          console.error(`Tool execution error for ${toolCall.function.name}:`, error);
          toolResults.push({
            tool_call_id: toolCall.id,
            result: { error: `Failed to execute ${toolCall.function.name}` }
          });
        }
      }

      // Add tool results to conversation and get final response
      conversationMessages.push(assistantMessage);
      
      for (const toolResult of toolResults) {
        conversationMessages.push({
          role: "tool",
          tool_call_id: toolResult.tool_call_id,
          content: JSON.stringify(toolResult.result)
        });
      }

      // Get final response after tool execution
      const finalCompletion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: conversationMessages,
        temperature: 0.7,
        max_tokens: 1000,
      });

      responseContent = finalCompletion.choices[0].message.content || "";
      conversationMessages.push(finalCompletion.choices[0].message);
    } else {
      conversationMessages.push(assistantMessage);
    }

    return NextResponse.json({
      response: responseContent,
      messages: conversationMessages
    });

  } catch (error) {
    console.error('AI Assistant error:', error);
    return NextResponse.json({ 
      error: 'Failed to process request',
      response: "Sorry, I encountered an error processing your request. Please try again."
    }, { status: 500 });
  }
}