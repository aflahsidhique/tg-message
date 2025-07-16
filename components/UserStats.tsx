"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Activity, MessageCircle, Calendar } from 'lucide-react';

interface UserStatsProps {
  stats: {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    // messagesSent: number;
  };
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

export function UserStats({ stats }: UserStatsProps) {
  const activityData = [
    { name: 'Active', value: stats.activeUsers, color: '#10B981' },
    { name: 'Inactive', value: stats.inactiveUsers, color: '#F59E0B' },
  ];

  const weeklyData = [
    { day: 'Mon', users: 45, messages: 123 },
    { day: 'Tue', users: 52, messages: 156 },
    { day: 'Wed', users: 48, messages: 134 },
    { day: 'Thu', users: 61, messages: 198 },
    { day: 'Fri', users: 55, messages: 167 },
    { day: 'Sat', users: 43, messages: 111 },
    { day: 'Sun', users: 38, messages: 95 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Analytics Overview</h3>
        <p className="text-slate-600">
          Comprehensive insights into your Telegram bot performance
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              User Activity Distribution
            </CardTitle>
            <CardDescription>
              Breakdown of active vs inactive users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={activityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {activityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              {activityData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-slate-600">
                    {item.name}: {item.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Weekly Activity
            </CardTitle>
            <CardDescription>
              Daily user engagement and message volume
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="users" fill="#3B82F6" name="Active Users" />
                  <Bar dataKey="messages" fill="#10B981" name="Messages" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card> */}
      </div>

      {/* <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Growth Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">New users this week</span>
              <Badge variant="default">+23</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Growth rate</span>
              <Badge variant="default">+15.2%</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Retention rate</span>
              <Badge variant="default">78.5%</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Engagement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Avg. messages per user</span>
              <Badge variant="outline">12.4</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Response rate</span>
              <Badge variant="outline">85.3%</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Peak activity time</span>
              <Badge variant="outline">2-4 PM</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Messages today</span>
              <Badge variant="secondary">156</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Active users today</span>
              <Badge variant="secondary">89</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Last broadcast</span>
              <Badge variant="secondary">2h ago</Badge>
            </div>
          </CardContent>
        </Card>
      </div> */}
    </div>
  );
}