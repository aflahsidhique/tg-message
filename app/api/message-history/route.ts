import { NextResponse } from 'next/server';

// Mock data - replace with actual Supabase queries
const mockMessageHistory = [
  {
    id: '1',
    message: 'Welcome to our new features! Check out the latest updates in our bot.',
    recipient_type: 'all',
    total_recipients: 1245,
    success_count: 1198,
    failed_count: 47,
    status: 'completed',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    completed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    message: 'Important announcement: Server maintenance scheduled for tomorrow 2-4 AM UTC.',
    recipient_type: 'active',
    total_recipients: 892,
    success_count: 875,
    failed_count: 17,
    status: 'completed',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    completed_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 3 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    message: 'We miss you! Come back and see what\'s new in our bot.',
    recipient_type: 'inactive',
    total_recipients: 353,
    success_count: 298,
    failed_count: 55,
    status: 'completed',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    completed_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 1000).toISOString()
  }
];

export async function GET() {
  try {
    // TODO: Replace with actual Supabase query
    // const { data, error } = await supabase
    //   .from('message_logs')
    //   .select('*')
    //   .order('created_at', { ascending: false });

    return NextResponse.json(mockMessageHistory);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch message history' },
      { status: 500 }
    );
  }
}