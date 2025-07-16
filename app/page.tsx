"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, MessageCircle, Activity, Send, Search, Filter } from 'lucide-react';
import { UsersList } from '@/components/UsersList';
import { MessageComposer } from '@/components/MessageComposer';
import { UserStats } from '@/components/UserStats';
import { MessageHistory } from '@/components/MessageHistory';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    // messagesSent: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <UsersList />;
      case 'compose':
        return <MessageComposer onMessageSent={fetchStats} />;
      // case 'history':
      //   return <MessageHistory />;
      default:
        return <UserStats stats={stats} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Telegram Bot Admin
          </h1>
          <p className="text-slate-600">
            Manage your Telegram bot users and send targeted messages
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <svg className="animate-spin h-8 w-8 text-blue-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
            <span className="text-slate-600 text-lg">Loading stats...</span>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-white shadow-sm border-0 ring-1 ring-slate-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Total Users
                  </CardTitle>
                  <Users className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{stats.totalUsers}</div>
                  <p className="text-xs text-slate-500">
                    Registered users
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm border-0 ring-1 ring-slate-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Active Users
                  </CardTitle>
                  <Activity className="h-4 w-4 text-emerald-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{stats.activeUsers}</div>
                  <p className="text-xs text-slate-500">
                    Active in last 3 days
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm border-0 ring-1 ring-slate-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Inactive Users
                  </CardTitle>
                  <Users className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{stats.inactiveUsers}</div>
                  <p className="text-xs text-slate-500">
                    No activity in 3+ days
                  </p>
                </CardContent>
              </Card>

              {/* <Card className="bg-white shadow-sm border-0 ring-1 ring-slate-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Messages Sent
                  </CardTitle>
                  <MessageCircle className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{stats.messagesSent}</div>
                  <p className="text-xs text-slate-500">
                    Total messages delivered
                  </p>
                </CardContent>
              </Card> */}
            </div>

            {/* Navigation */}
            <div className="flex flex-wrap gap-2 mb-6">
              <Button
                variant={activeTab === 'overview' ? 'default' : 'outline'}
                onClick={() => setActiveTab('overview')}
                className="flex items-center gap-2"
              >
                <Activity className="h-4 w-4" />
                Overview
              </Button>
              <Button
                variant={activeTab === 'users' ? 'default' : 'outline'}
                onClick={() => setActiveTab('users')}
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Manage Users
              </Button>
              <Button
                variant={activeTab === 'compose' ? 'default' : 'outline'}
                onClick={() => setActiveTab('compose')}
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                Send Message
              </Button>
              {/* <Button
                variant={activeTab === 'history' ? 'default' : 'outline'}
                onClick={() => setActiveTab('history')}
                className="flex items-center gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                Message History
              </Button> */}
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-lg shadow-sm border-0 ring-1 ring-slate-200 p-6">
              {renderContent()}
            </div>
          </>
        )}
      </div>
    </div>
  );
}