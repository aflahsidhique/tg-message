import { NextResponse } from 'next/server';
import pool from '../../../lib/db';
interface TelegramUser {
  id: string;
  telegram_id: string;
  username: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  last_activity: string;
  created_at: string;
  total_coins: number;
}

export async function GET(req: Request) {
  try {
    // Parse pagination params
    const { searchParams } = new URL(req.url);
    

    // Get total count
    const totalResult = await pool.query('SELECT COUNT(*) FROM users');
    const total = parseInt(totalResult.rows[0].count, 10);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || total.toString());
    const offset = (page - 1) * limit;

    // Get paginated users
    const result = await pool.query('SELECT * FROM users ORDER BY id DESC LIMIT $1 OFFSET $2', [limit, offset]);
    const now = new Date();

    const users: TelegramUser[] = result.rows.map((row: { last_login: string | number | Date; id: { toString: () => any; }; telegramid: any; username: any; firstname: any; lastname: any; created_at: string | number | Date; total_coins: any; }) => {
      const lastLogin = new Date(row.last_login);
      const diffDays =
        (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24);

      return {
        id: row.id.toString(),
        telegram_id: row.telegramid,
        username: row.username,
        first_name: row.firstname,
        last_name: row.lastname,
        is_active: diffDays <= 3,
        last_activity: lastLogin.toISOString(),
        created_at: new Date(row.created_at).toISOString(),
        total_coins: Number(row.total_coins),
      };
    });

    return new Response(JSON.stringify({ users, total }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    let message = 'Unknown error';
    if (error instanceof Error) {
      message = error.message;
    }
    return new Response(
      JSON.stringify({ error: 'Failed to fetch users', details: message }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    );
  }
}