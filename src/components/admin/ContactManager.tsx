'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Trash2,
  Eye,
  EyeOff,
  Check,
  Clock,
  User,
  Loader2,
  Search,
  Inbox,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAdminStore } from '@/store/admin-store';
import { toast } from 'sonner';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function ContactManager() {
  const token = useAdminStore((s) => s.token);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMessages = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      else setRefreshing(true);

      const res = await fetch('/api/contact', {
        headers: { Authorization: 'Bearer ' + token },
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(Array.isArray(data) ? data : data.messages || []);
      } else {
        const errData = await res.json().catch(() => ({}));
        toast.error(errData.error || `Failed to load messages (${res.status})`);
      }
    } catch {
      toast.error('Network error - Failed to load messages');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMessages(true);
  }, [token]);

  const toggleRead = async (msg: ContactMessage) => {
    setTogglingId(msg.id);
    try {
      const res = await fetch(`/api/contact?id=${msg.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify({ read: !msg.read }),
      });
      if (!res.ok) throw new Error('Failed to update');
      toast.success(msg.read ? 'Marked as unread' : 'Marked as read');
      fetchMessages(false);
    } catch {
      toast.error('Failed to update message');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/contact?id=${deleteId}`, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + token },
      });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Message deleted');
      setDeleteId(null);
      if (expandedId === deleteId) setExpandedId(null);
      fetchMessages(false);
    } catch {
      toast.error('Failed to delete message');
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const unreadCount = messages.filter((m) => !m.read).length;
  const filtered = messages.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.subject.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full max-w-sm" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Mail className="h-6 w-6 text-rose-400" />
            Messages
            {unreadCount > 0 && (
              <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20 ml-1">
                {unreadCount} unread
              </Badge>
            )}
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Manage contact form submissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchMessages(false)}
            disabled={refreshing}
            className="border-border text-muted-foreground hover:bg-secondary hover:text-foreground gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              Promise.all(
                messages.filter((m) => !m.read).map((m) =>
                  fetch(`/api/contact?id=${m.id}`, {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: 'Bearer ' + token,
                    },
                    body: JSON.stringify({ read: true }),
                  })
                )
              ).then(() => {
                toast.success('All messages marked as read');
                fetchMessages(false);
              });
            }}
            disabled={unreadCount === 0}
            className="border-neon/20 text-neon hover:bg-neon/10 hover:text-neon gap-2"
          >
            <Check className="h-4 w-4" />
            Mark All Read
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search messages..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-secondary border-border focus-visible:ring-neon/50"
        />
      </div>

      {/* Messages List */}
      {filtered.length === 0 ? (
        <Card className="bg-card/50 border-border">
          <CardContent className="p-12 text-center">
            <Inbox className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              {search ? 'No messages match your search' : 'No messages yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((msg, index) => {
            const isExpanded = expandedId === msg.id;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <Card
                  className={`bg-card/50 border transition-all duration-200 overflow-hidden ${
                    !msg.read
                      ? 'border-l-2 border-l-neon border-t-border border-r-border border-b-border shadow-[0_0_15px_oklch(0.82_0.19_155/0.05)]'
                      : 'border-border hover:border-border/80'
                  }`}
                >
                  <CardContent className="p-0">
                    {/* Message Header */}
                    <button
                      className="w-full text-left p-4 hover:bg-secondary/30 transition-colors"
                      onClick={() => setExpandedId(isExpanded ? null : msg.id)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div
                            className={`h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                              !msg.read ? 'bg-neon/10' : 'bg-secondary'
                            }`}
                          >
                            <Mail
                              className={`h-4 w-4 ${
                                !msg.read ? 'text-neon' : 'text-muted-foreground'
                              }`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-sm ${
                                  !msg.read ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground'
                                }`}
                              >
                                {msg.name}
                              </span>
                              {!msg.read && (
                                <div className="h-2 w-2 rounded-full bg-neon flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{msg.email}</p>
                            <p className="text-sm text-foreground mt-1 truncate">{msg.subject}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground flex-shrink-0">
                          <Clock className="h-3 w-3" />
                          <span className="text-xs hidden sm:inline">
                            {formatDate(msg.createdAt)}
                          </span>
                        </div>
                      </div>
                    </button>

                    {/* Expanded Content */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <Separator />
                          <div className="p-4 space-y-4">
                            {/* Full message */}
                            <div className="bg-secondary/50 rounded-lg p-4">
                              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                                {msg.message}
                              </p>
                            </div>

                            {/* Meta info */}
                            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {msg.name} ({msg.email})
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDate(msg.createdAt)}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleRead(msg)}
                                disabled={togglingId === msg.id}
                                className={`gap-1.5 text-xs ${
                                  msg.read
                                    ? 'border-amber-400/20 text-amber-400 hover:bg-amber-400/10'
                                    : 'border-neon/20 text-neon hover:bg-neon/10'
                                }`}
                              >
                                {togglingId === msg.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : msg.read ? (
                                  <EyeOff className="h-3 w-3" />
                                ) : (
                                  <Eye className="h-3 w-3" />
                                )}
                                {msg.read ? 'Mark Unread' : 'Mark Read'}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDeleteId(msg.id)}
                                className="border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive gap-1.5 text-xs"
                              >
                                <Trash2 className="h-3 w-3" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this message? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
