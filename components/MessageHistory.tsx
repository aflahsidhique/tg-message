"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageCircle, Search, Calendar, Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface MessageLog {
  id: string;
  message: string;
  recipient_type: string;
  total_recipients: number;
  success_count: number;
  failed_count: number;
  status: 'pending' | 'sending' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
}

export function MessageHistory() {
  const [messages, setMessages] = useState<MessageLog[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<MessageLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessageHistory();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [messages, searchTerm, statusFilter]);

  const fetchMessageHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/message-history');
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching message history:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = messages;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(message =>
        message.message.toLowerCase().includes(term) ||
        message.recipient_type.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(message => message.status === statusFilter);
    }

    setFilteredMessages(filtered);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'sending':
        return <Clock className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'default',
      failed: 'destructive',
      sending: 'secondary',
      pending: 'outline'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getSuccessRate = (message: MessageLog) => {
    if (message.total_recipients === 0) return 0;
    return Math.round((message.success_count / message.total_recipients) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Message History</h3>
        <p className="text-slate-600">
          Track and analyze your sent messages and delivery performance
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Messages</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="sending">Sending</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredMessages.map((message) => (
          <Card key={message.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(message.status)}
                    <h4 className="font-semibold text-slate-900">
                      {message.recipient_type.charAt(0).toUpperCase() + message.recipient_type.slice(1)} Message
                    </h4>
                    {getStatusBadge(message.status)}
                  </div>
                  <p className="text-slate-600 mb-3 line-clamp-2">
                    {message.message}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDistanceToNow(new Date(message.created_at))} ago
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {message.total_recipients} recipients
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      {getSuccessRate(message)}% success rate
                    </div>
                  </div>
                </div>
              </div>

              {message.status === 'completed' && (
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200">
                  <div className="text-center">
                    <p className="text-lg font-bold text-slate-900">{message.total_recipients}</p>
                    <p className="text-xs text-slate-500">Total</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-600">{message.success_count}</p>
                    <p className="text-xs text-slate-500">Delivered</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-red-600">{message.failed_count}</p>
                    <p className="text-xs text-slate-500">Failed</p>
                  </div>
                </div>
              )}

              {message.status === 'sending' && (
                <div className="pt-4 border-t border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm text-slate-600">Sending in progress...</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMessages.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No messages found</h3>
              <p className="text-slate-600">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'You haven\'t sent any messages yet'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}