"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { FileText, Users, Send, AlertCircle, CheckCircle, ChevronsUpDown } from 'lucide-react';

interface TelegramUser {
  id: string;
  telegram_id: string;
  username: string | null;
  first_name: string;
  last_name: string;
  last_activity: string;
}

interface MessageComposerProps {
  onMessageSent: () => void;
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function MessageComposer({ onMessageSent }: MessageComposerProps) {
  const [messageText, setMessageText] = useState('');  // message body state
  const [recipientType, setRecipientType] = useState<'all' | 'active' | 'inactive' | 'recent' | 'specific'>('all');  // recipient filter
  const [includeMarkdown, setIncludeMarkdown] = useState(false);  // markdown toggle
  const [sending, setSending] = useState(false);  // sending state
  const [sendProgress, setSendProgress] = useState(0);  // progress percentage
  const [sendResults, setSendResults] = useState<{ total: number; success: number; failed: number; errors: string[] } | null>(null);  // results
  const [users, setUsers] = useState<TelegramUser[]>([]);  // all users list
  const [selectedUsers, setSelectedUsers] = useState<TelegramUser[]>([]);  // specifically selected users
  const [search, setSearch] = useState('');  // user search input
  const [loadingUsers, setLoadingUsers] = useState(false); // loading state for users
  const textareaRef = useRef<HTMLTextAreaElement>(null);  // ref to textarea for cursor position
  const debouncedSearch = useDebounce(search, 300);

  // Fetch users only when recipientType is 'specific' and on search
  useEffect(() => {
    if (recipientType === 'specific') return;
    setLoadingUsers(true);
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setUsers(data);
        else if (Array.isArray(data.users)) setUsers(data.users);
        else setUsers([]);
      })
      .finally(() => setLoadingUsers(false));
  }, [recipientType]);
  
  useEffect(() => {
    if (recipientType !== 'specific') return;
    setLoadingUsers(true);
    const query = search ? `&search=${encodeURIComponent(search)}` : '';
    fetch(`/api/users?limit=50${query}`)
      .then(res => res.json())
      .then(data => {
        console.log("Fetched data:", data);
        if (Array.isArray(data)) setUsers(data);
        else if (Array.isArray(data.users)) setUsers(data.users);
        else setUsers([]);
      })
      .finally(() => setLoadingUsers(false));
  }, [recipientType, debouncedSearch]);
  
  const now = new Date();  // current timestamp

  const toggleUser = (user: TelegramUser) => {  // add/remove from specific selection
    setSelectedUsers(prev =>
      prev.some(u => u.telegram_id === user.telegram_id)
        ? prev.filter(u => u.telegram_id !== user.telegram_id)
        : [...prev, user]
    );
  };

  const insertPlaceholder = (placeholder: string) => {  // insert placeholder at cursor
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const before = messageText.substring(0, start);
    const after = messageText.substring(end);
    const newText = before + placeholder + after;
    setMessageText(newText);

    // move cursor after inserted placeholder
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + placeholder.length;
      el.setSelectionRange(pos, pos);
    });
  };

  // determine recipients based on type
  const getRecipientCount = () => {
    const oneDay = 1000 * 60 * 60 * 24;
    const thirtyDays = oneDay * 30;
    switch (recipientType) {
      case 'all':
        return users;
      case 'active':
        return users.filter(u => now.getTime() - new Date(u.last_activity).getTime() <= 3 * oneDay);
      case 'inactive': {
        const active = users.filter(u => now.getTime() - new Date(u.last_activity).getTime() <= 3 * oneDay);
        return users.filter(u => !active.includes(u));
      }
      case 'recent':
        return users.filter(u => now.getTime() - new Date(u.last_activity).getTime() <= thirtyDays);
      case 'specific':
        return selectedUsers;
      default:
        return [];
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) {
      alert('Please enter a message');
      return;
    }
    setSending(true);
    setSendProgress(0);
    setSendResults(null);

    const recipients = getRecipientCount();
    const placeholderRegex = /{{(?:username|firstname|lastname)}}/;
    const shouldPersonalize = placeholderRegex.test(messageText);

    try {
      if (shouldPersonalize) {
        // send one-by-one with personalized content
        for (let i = 0; i < recipients.length; i++) {
          const user = recipients[i];
          const personalized = messageText
            .replace(/{{username}}/g, user.username || '')
            .replace(/{{firstname}}/g, user.first_name)
            .replace(/{{lastname}}/g, user.last_name);
          await fetch('/api/send-message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: personalized, recipientType: 'specific', specificUserIds: [user.telegram_id], includeMarkdown }),
          });
          setSendProgress(Math.round(((i + 1) / recipients.length) * 100));
        }
      } else {
        // batch send without personalization
        const response = await fetch('/api/send-message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: messageText,
            recipientType,
            specificUserIds: recipientType === 'specific' ? recipients.map(u => u.telegram_id) : [],
            includeMarkdown
          }),
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message);
        }
        // process streamed progress
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value);
            chunk.split('\n').forEach(line => {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  if (data.progress !== undefined) setSendProgress(data.progress);
                  if (data.results) setSendResults(data.results);
                } catch { }
              }
            });
          }
        }
      }
      onMessageSent();
      setMessageText('');
      setSelectedUsers([]);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setSending(false);
    }
  };


  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Compose Message</h3>
        <p className="text-slate-600">Send messages to your Telegram bot users with targeting options</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />Message Content</CardTitle>
              <CardDescription>Compose your message and configure formatting options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">  {/* placeholder buttons */}
                <Button size="sm" onClick={() => insertPlaceholder('{{username}}')}>Username</Button>
                <Button size="sm" onClick={() => insertPlaceholder('{{firstname}}')}>First Name</Button>
                <Button size="sm" onClick={() => insertPlaceholder('{{lastname}}')}>Last Name</Button>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Message Text</label>
                <Textarea
                  ref={textareaRef}  // attach ref
                  placeholder="Enter your message here..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
                <p className="text-xs text-slate-500 mt-1">{messageText.length} characters</p>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="markdown"
                  checked={includeMarkdown}
                  onCheckedChange={(checked) => setIncludeMarkdown(checked as boolean)}
                />
                <label htmlFor="markdown" className="text-sm text-slate-700">Enable Markdown formatting</label>
              </div>
              {includeMarkdown && (
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-600 mb-2">Markdown Reference:</p>
                  <div className="text-xs space-y-1 text-slate-500">
                    <p><code>*bold*</code> - Bold text</p>
                    <p><code>_italic_</code> - Italic text</p>
                    <p><code>code</code> - Monospace text</p>
                    <p><code>[link](url)</code> - Hyperlink</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Target Audience</CardTitle>
              <CardDescription>Choose who will receive this message</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Recipient Type</label>
                <Select
                  value={recipientType}
                  onValueChange={(value: string) => setRecipientType(value as 'all' | 'active' | 'inactive' | 'recent' | 'specific')}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="active">Active Users Only</SelectItem>
                    <SelectItem value="inactive">Inactive Users Only</SelectItem>
                    <SelectItem value="recent">Recently Active (30 days)</SelectItem>
                    <SelectItem value="specific">Specific Users</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {recipientType === 'specific' && (
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Select Users</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        {selectedUsers.length > 0
                          ? selectedUsers.map(u => u.username || `${u.first_name} ${u.last_name}`).join(', ')
                          : 'Search & select users…'}
                        <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                      <div className="p-2 border-b flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Type to filter…"
                          value={search}
                          onChange={e => setSearch(e.target.value)}
                          className="w-full px-2 py-1 border rounded text-sm"
                        />
                        {selectedUsers.length > 0 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs px-2 py-1"
                            onClick={() => setSelectedUsers([])}
                            type="button"
                          >
                            Clear All
                          </Button>
                        )}
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {loadingUsers ? (
                          <div className="p-4 text-center text-sm text-slate-500">Loading…</div>
                        ) : users.length === 0 ? (
                          <div className="p-4 text-center text-sm text-slate-500">No users found.</div>
                        ) : (
                          users.map(user => {
                            const display = user.username || user.telegram_id;
                            const lastLogin = new Date(user.last_activity);
                            const isActive = (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24) <= 3;
                            const checked = selectedUsers.some(u => u.telegram_id === user.telegram_id);
                            return (
                              <div
                                key={user.telegram_id}
                                className="flex items-center px-3 py-2 hover:bg-slate-50 cursor-pointer gap-2"
                                onClick={() => toggleUser(user)}
                              >
                                <Checkbox checked={checked} onCheckedChange={() => toggleUser(user)} />
                                <span className="flex-1 text-sm">{display}</span>
                                <Badge variant={isActive ? 'default' : 'secondary'}>
                                  {isActive ? 'Active' : 'Inactive'}
                                </Badge>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-1">Estimated Recipients</p>
                <p className="text-sm text-blue-700">{getRecipientCount().length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Send Message</CardTitle>
              <CardDescription>Review and send your message</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleSendMessage} disabled={!messageText.trim() || sending} className="w-full" size="lg">
                {sending
                  ? <><div className="animate-spin rounded-full h-4 w-4 border-б-2 border-white mr-2" />Sending...</>
                  : <><Send className="h-4 w-4 mr-2" />Send Message</>}
              </Button>

              {sending && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Sending progress</span>
                    <span>{sendProgress}%</span>
                  </div>
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                </div>
              )}

              {sendResults && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-900">Sending Complete</span>
                  </div>

                  <div className="grid	grid-cols-3 gap-2 text-center">
                    <div className="bg-blue-50 p-2 rounded">
                      <p className="text-lg font-bold text-blue-900">{sendResults.total}</p>
                      <p className="text-xs text-blue-700">Total</p>
                    </div>
                    <div className="bg-green-50 p-2 rounded">
                      <p className="text-lg font-bold text-green-900">{sendResults.success}</p>
                      <p className="text-xs text-green-700">Success</p>
                    </div>
                    <div className="bg-red-50 p-2 rounded">
                      <p className="text-lg font-bold text-red-900">{sendResults.failed}</p>
                      <p className="text-xs text-red-700">Failed</p>
                    </div>
                  </div>

                  {sendResults.errors.length > 0 && (
                    <div className="bg-red-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium text-red-900">Errors</span>
                      </div>
                      <ul className="text-xs text-red-700 space-y-1">
                        {sendResults.errors.map((error, index) => (<li key={index}>• {error}</li>))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
