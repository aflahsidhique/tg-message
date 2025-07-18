"use client";

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Filter, MessageCircle, User, Calendar, Activity, CoinsIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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

export function UsersList() {
  const [users, setUsers] = useState<TelegramUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<TelegramUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    fetchUsers();
  }, [page, pageSize]);

  useEffect(() => {
    applyFilters();
  }, [users, searchTerm, filterType]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
      });
      const response = await fetch(`/api/users?${params.toString()}`);
      const data = await response.json();
      setUsers(data.users);
      setTotalUsers(data.total);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = users;

    // Apply text search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.username?.toLowerCase().includes(term) ||
        user.first_name?.toLowerCase().includes(term) ||
        user.last_name?.toLowerCase().includes(term) ||
        user.telegram_id.includes(term)
      );
    }

    // Apply status filter
    switch (filterType) {
      case 'active':
        filtered = filtered.filter(user => user.is_active);
        break;
      case 'inactive':
        filtered = filtered.filter(user => !user.is_active);
        break;
      case 'recent':
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(user => new Date(user.last_activity) > thirtyDaysAgo);
        break;
      default:
        break;
    }

    setFilteredUsers(filtered);
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllFiltered = () => {
    setSelectedUsers(filteredUsers.map(user => user.id));
  };

  const clearSelection = () => {
    setSelectedUsers([]);
  };

  const sendMessageToSelected = () => {
    // This would open the message composer with selected users
    console.log('Send message to:', selectedUsers);
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
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder="Search by username, name, or Telegram ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full md:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter users" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="active">Active Users</SelectItem>
            <SelectItem value="inactive">Inactive Users</SelectItem>
            <SelectItem value="recent">Recent Activity</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {selectedUsers.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <p className="font-medium text-blue-900">
                  {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
                </p>
                <p className="text-sm text-blue-700">
                  Ready to send messages to selected users
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={clearSelection}>
                  Clear Selection
                </Button>
                <Button size="sm" onClick={sendMessageToSelected}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Users ({totalUsers})
          </h3>
          <p className="text-sm text-slate-600">
            Manage your Telegram bot users
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={selectAllFiltered}>
            Select All ({filteredUsers.length})
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredUsers.map((user) => (
          <Card
            key={user.id}
            className={`cursor-pointer transition-all ${
              selectedUsers.includes(user.id)
                ? 'ring-2 ring-blue-500 bg-blue-50'
                : 'hover:shadow-md'
            }`}
            // onClick={() => toggleUserSelection(user.telegram_id)}
          >
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {user.first_name?.[0] || user.username?.[0] || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-slate-900">
                        {user.first_name} {user.last_name}
                      </h4>
                      <Badge variant={user.is_active ? 'default' : 'secondary'}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">
                      @{user.username || 'No username'} • ID: {user.telegram_id}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Joined {formatDistanceToNow(new Date(user.created_at))} ago
                      </div>
                      <div className="flex items-center gap-1">
                        <Activity className="h-3 w-3" />
                        Last seen {formatDistanceToNow(new Date(user.last_activity))} ago
                      </div>
                      <div className="flex items-center gap-1">
                        <CoinsIcon className="h-3 w-3" />
                        {user.total_coins} coins
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>
                        <User className="h-4 w-4 mr-2" />
                        Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>User Details</DialogTitle>
                        <DialogDescription>
                          Detailed information about this Telegram user
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-slate-700">Full Name</label>
                          <p className="text-slate-900">{user.first_name} {user.last_name}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-700">Username</label>
                          <p className="text-slate-900">@{user.username || 'Not set'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-700">Telegram ID</label>
                          <p className="text-slate-900">{user.telegram_id}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-700">Status</label>
                          <Badge variant={user.is_active ? 'default' : 'secondary'}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-700">Joined</label>
                          <p className="text-slate-900">{new Date(user.created_at).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-700">Last Activity</label>
                          <p className="text-slate-900">{new Date(user.last_activity).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <User className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No users found</h3>
              <p className="text-slate-600">
                {searchTerm || filterType !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'No users have interacted with your bot yet'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination controls */}
      <div className="flex justify-center items-center gap-4 mt-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </Button>
        <span className="text-sm text-slate-700">
          Page {page} of {Math.max(1, Math.ceil(totalUsers / pageSize))}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => p + 1)}
          disabled={page >= Math.ceil(totalUsers / pageSize)}
        >
          Next
        </Button>
        <select
          className="ml-4 border rounded px-2 py-1 text-sm"
          value={pageSize}
          onChange={e => {
            setPageSize(Number(e.target.value));
            setPage(1);
          }}
        >
          {[10, 20, 50, 100].map(size => (
            <option key={size} value={size}>{size} / page</option>
          ))}
        </select>
      </div>
    </div>
  );
}