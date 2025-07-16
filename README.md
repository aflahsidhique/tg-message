# Telegram Bot Message Management System

A comprehensive Next.js admin dashboard for managing Telegram bot users and sending targeted messages with advanced filtering and analytics.

## Features

- **User Management**: View, search, and filter Telegram bot users
- **Targeted Messaging**: Send messages to all users, active users, inactive users, or specific users
- **Real-time Progress**: Track message delivery with live progress updates
- **Analytics Dashboard**: Comprehensive insights into user engagement and message performance
- **Message History**: Track all sent messages with delivery statistics
- **Advanced Search**: Find users by Telegram ID, username, or name
- **Responsive Design**: Works perfectly on desktop and mobile devices

## Setup Instructions

### 1. Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

### 2. Telegram Bot Setup

1. Create a Telegram bot by messaging [@BotFather](https://t.me/botfather)
2. Get your bot token and add it to `.env.local`
3. Set up webhooks or polling to collect user data

### 3. Database Setup

Click the "Connect to Supabase" button in the top right to set up your database, then create these tables:

#### Telegram Users Table

```sql
-- Telegram users table
CREATE TABLE telegram_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id TEXT UNIQUE NOT NULL,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  is_active BOOLEAN DEFAULT true,
  last_activity TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  total_messages INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE telegram_users ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated access
CREATE POLICY "Enable read access for authenticated users"
  ON telegram_users FOR SELECT
  TO authenticated
  USING (true);
```

#### Message Logs Table

```sql
-- Message logs table
CREATE TABLE message_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  recipient_type TEXT NOT NULL,
  total_recipients INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE message_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated access
CREATE POLICY "Enable full access for authenticated users"
  ON message_logs FOR ALL
  TO authenticated
  USING (true);
```

### 4. Running the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the admin dashboard.

## Usage

### Managing Users

1. Navigate to the "Manage Users" tab
2. Use the search bar to find specific users
3. Apply filters to view active, inactive, or recently active users
4. Select multiple users for bulk messaging
5. View detailed user information in the user details modal

### Sending Messages

1. Go to the "Send Message" tab
2. Compose your message with optional Markdown formatting
3. Choose your target audience:
   - All Users: Send to everyone
   - Active Users: Users active in the last 30 days
   - Inactive Users: Users inactive for 30+ days
   - Specific Users: Enter specific Telegram user IDs
4. Click "Send Message" and monitor real-time progress

### Viewing Analytics

The overview tab provides:
- User statistics and growth metrics
- Activity distribution charts
- Weekly engagement trends
- Performance metrics

### Message History

Track all sent messages with:
- Delivery statistics
- Success/failure rates
- Message content and targeting
- Send timestamps

## API Integration

Replace the mock data in the API routes with actual Supabase queries:

### Update API Routes

1. Install Supabase client: `npm install @supabase/supabase-js`
2. Create Supabase client configuration
3. Replace mock data in `/app/api/` routes with real database queries
4. Implement proper error handling and validation

### Telegram Bot Integration

Integrate with your existing Telegram bot to:
1. Automatically add new users to the database
2. Update user activity timestamps
3. Track message interactions
4. Handle bot commands and responses

## Security Considerations

- Always validate input data
- Use environment variables for sensitive information
- Implement proper authentication for the admin dashboard
- Enable Row Level Security (RLS) on all database tables
- Regularly monitor and log access attempts

## Deployment

The application is ready for deployment to platforms like:
- Vercel
- Netlify
- AWS
- Google Cloud Platform

Make sure to set up environment variables in your deployment platform.