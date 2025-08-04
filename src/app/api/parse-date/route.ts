import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export async function POST(request: NextRequest) {
  const openai = getOpenAIClient();
  let input = '';
  
  try {
    const body = await request.json();
    input = body.input;
    const currentDate = body.currentDate;

    if (!input) {
      return NextResponse.json({ error: 'No input provided' }, { status: 400 });
    }

    const prompt = `You are a precise date/time parser. Parse the natural language date/time input and return it in YYYY-MM-DDTHH:MM format (24-hour time, local timezone).

Current date and time: ${currentDate}
Current day of week: ${new Date(currentDate).toLocaleDateString('en-US', { weekday: 'long' })}

User input: "${input}"

Rules:
1. For "friday" or weekday names without modifiers, interpret as the NEXT occurrence of that weekday
2. For "this friday", use THIS week's friday if it hasn't passed, otherwise NEXT week's friday
3. For "next friday", always use NEXT week's friday (7+ days from now)
4. Default times: If no time specified, use 09:00 for meetings/events
5. Handle relative terms: today, tomorrow, next week, in 3 days, etc.
6. Handle specific times: 2pm, 14:30, noon, midnight
7. Handle complex phrases: "next monday at 2:30pm", "friday morning", "in two weeks"
8. If the input is already a valid date format, return it formatted correctly
9. Be smart about context - "friday 2pm" means the next friday at 2pm

Return ONLY the parsed date in YYYY-MM-DDTHH:MM format. No explanations or additional text.

Examples:
- "friday" → 2025-08-08T09:00 (if today is Monday Aug 4, 2025)
- "this friday 2pm" → 2025-08-08T14:00
- "next friday 2pm" → 2025-08-15T14:00
- "tomorrow 9am" → 2025-08-05T09:00
- "in 3 days" → 2025-08-07T09:00`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a precise date/time parser. Return only the formatted date, no explanations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 50,
    });

    const parsedDate = completion.choices[0]?.message?.content?.trim();

    if (!parsedDate) {
      return NextResponse.json({ parsedDate: input });
    }

    // Validate the parsed date
    const testDate = new Date(parsedDate);
    if (isNaN(testDate.getTime())) {
      return NextResponse.json({ parsedDate: input });
    }

    return NextResponse.json({ parsedDate });

  } catch (error) {
    console.error('Error parsing date:', error);
    return NextResponse.json({ parsedDate: input });
  }
}
