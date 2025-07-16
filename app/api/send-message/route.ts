export const dynamic = 'force-dynamic' 
import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../lib/db';

// Mock Telegram Bot API
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

async function sendTelegramMessage(
  chatId: string,
  message: string,
  parseMode?: string
): Promise<boolean> {
  try {
    // Perform a POST request to the sendMessage endpoint with the bot token
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',                                     // Use HTTP POST to send the message
        headers: { 'Content-Type': 'application/json' },   // Tell Telegram we're sending JSON
        body: JSON.stringify({
          chat_id: chatId,                                  // Specify which chat receives the message
          text: message,                                    // The actual text to send
          parse_mode: parseMode                             // Optional formatting mode
        }),
      }
    );


    // Return true if HTTP status indicates success (2xx)
    return response.ok;
  } catch (error) {
    // Log any network or parsing errors
    console.error('❌ Error sending Telegram message:', error);
    return false;  // Indicate failure
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message, recipientType, specificUserIds, includeMarkdown } = await request.json();

    // TODO: Replace with actual Supabase queries to get users
    let targetUsers: string[] = [];
    
    switch (recipientType) {
      case 'all': {
        const allRes = await pool.query<{ telegramid: string }>(
          'SELECT telegramid FROM users'
        );
        targetUsers = allRes.rows.map((r: { telegramid: any; }) => r.telegramid);
        break;
      }
      case 'active': {
        const activeRes = await pool.query<{ telegramid: string }>(
          "SELECT telegramid FROM users WHERE last_login >= NOW() - INTERVAL '3 days'"
        );
        targetUsers = activeRes.rows.map((r: { telegramid: any; }) => r.telegramid);
        break;
      }
      case 'inactive': {
        const inactiveRes = await pool.query<{ telegramid: string }>(
          "SELECT telegramid FROM users WHERE last_login < NOW() - INTERVAL '3 days'"
        );
        targetUsers = inactiveRes.rows.map((r: { telegramid: any; }) => r.telegramid);
        break;
      }
      case 'recent': {
        const recentRes = await pool.query<{ telegramid: string }>(
          "SELECT telegramid FROM users WHERE last_login >= NOW() - INTERVAL '30 days'"
        );
        targetUsers = recentRes.rows.map((r: { telegramid: any; }) => r.telegramid);
        break;
      }
      case 'specific':
        targetUsers = specificUserIds;
        break;
      default:
        targetUsers = [];
    }

    // Create a readable stream for real-time progress updates
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let successCount = 0;
        let failedCount = 0;
        const errors: string[] = [];

        for (let i = 0; i < targetUsers.length; i++) {
          const userId = targetUsers[i];
          const progress = Math.round(((i + 1) / targetUsers.length) * 100);

          try {
            const success = await sendTelegramMessage(
              userId, 
              message, 
              includeMarkdown ? 'Markdown' : undefined
            );

            if (success) {
              successCount++;
            } else {
              failedCount++;
              errors.push(`Failed to send to user ${userId}`);
            }
          } catch (error) {
            failedCount++;
            errors.push(`Error sending to user ${userId}: ${error}`);
          }

          // Send progress update
          const progressData= {
            progress,
            sent: i + 1,
            total: targetUsers.length
          };
          
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(progressData)}\n\n`)
          );

          // Small delay to simulate real sending
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Send final results
        const results = {
          total: targetUsers.length,
          success: successCount,
          failed: failedCount,
          errors: errors.slice(0, 5) // Limit errors to first 5
        };

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ results })}\n\n`)
        );

        // TODO: Log message to database
        // await logMessage({
        //   message,
        //   recipientType,
        //   totalRecipients: targetUsers.length,
        //   successCount,
        //   failedCount
        // });

        controller.close();
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('Error in send-message API:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}