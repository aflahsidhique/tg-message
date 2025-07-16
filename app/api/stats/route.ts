import { NextResponse } from 'next/server';
import pool from '../../../lib/db';

export async function GET() {
  try {
    // Query total users
    const totalUsersRes = await pool.query('SELECT COUNT(*) FROM users');
    const totalUsers = parseInt(totalUsersRes.rows[0].count, 10);

    // Query active users (last_login within 3 days)
    const activeUsersRes = await pool.query(
      "SELECT COUNT(*) FROM users WHERE last_login >= NOW() - INTERVAL '3 days'"
    );
    const activeUsers = parseInt(activeUsersRes.rows[0].count, 10);

    // Set inactive users as totalUsers - activeUsers
    const inactiveUsers = totalUsers - activeUsers;

    // // Query total messages sent (from message_logs table)
    // let messagesSent = 0;
    // try {
    //   const messagesSentRes = await pool.query('SELECT COUNT(*) FROM message_logs');
    //   messagesSent = parseInt(messagesSentRes.rows[0].count, 10);
    // } catch (err) {
    //   // If message_logs table does not exist, fallback to 0
    //   messagesSent = 0;
    // }

    const stats = {
      totalUsers,
      activeUsers,
      inactiveUsers,
      // messagesSent,
    };

    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}