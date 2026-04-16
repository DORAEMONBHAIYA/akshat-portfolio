'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FolderKanban,
  Cpu,
  Briefcase,
  FileText,
  Mail,
  TrendingUp,
  Plus,
  MessageSquare,
  Clock,
  Loader2,
  Eye,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAdminStore } from '@/store/admin-store';

interface Stats {
  totalProjects: number;
  featuredProjects: number;
  totalSkills: number;
  skillCategories: number;
  totalExperience: number;
  totalEducation: number;
  totalBlogPosts: number;
  publishedPosts: number;
  totalMessages: number;
  unreadMessages: number;
}

interface RecentMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  createdAt: string;
  read: boolean;
}

const statCards = [
  {
    key: 'totalProjects' as const,
    label: 'Total Projects',
    icon: FolderKanban,
    accent: 'text-cyan',
    accentBg: 'bg-cyan/10',
    accentBorder: 'border-cyan/20',
    trend: '+2 this month',
  },
  {
    key: 'totalSkills' as const,
    label: 'Total Skills',
    icon: Cpu,
    accent: 'text-neon',
    accentBg: 'bg-neon/10',
    accentBorder: 'border-neon/20',
    trend: `${0} categories`,
  },
  {
    key: 'totalExperience' as const,
    label: 'Experience',
    icon: Briefcase,
    accent: 'text-amber-400',
    accentBg: 'bg-amber-400/10',
    accentBorder: 'border-amber-400/20',
    trend: 'Updated',
  },
  {
    key: 'totalBlogPosts' as const,
    label: 'Blog Posts',
    icon: FileText,
    accent: 'text-purple-400',
    accentBg: 'bg-purple-400/10',
    accentBorder: 'border-purple-400/20',
    trend: '+1 this week',
  },
  {
    key: 'totalMessages' as const,
    label: 'Messages',
    icon: Mail,
    accent: 'text-rose-400',
    accentBg: 'bg-rose-400/10',
    accentBorder: 'border-rose-400/20',
    trend: 'All time',
  },
  {
    key: 'unreadMessages' as const,
    label: 'Unread',
    icon: MessageSquare,
    accent: 'text-orange-400',
    accentBg: 'bg-orange-400/10',
    accentBorder: 'border-orange-400/20',
    trend: 'Needs attention',
  },
];

export default function Dashboard() {
  const token = useAdminStore((s) => s.token);
  const setActiveSection = useAdminStore((s) => s.setActiveSection);
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = {
          Authorization: 'Bearer ' + token,
        };

        const statsRes = await fetch('/api/stats', { headers });
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        const msgRes = await fetch('/api/contact', { headers });
        if (msgRes.ok) {
          const msgData = await msgRes.json();
          setRecentMessages(msgData.slice?.(0, 5) || []);
        }
      } catch {
        // silently handle
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Overview of your portfolio content
        </p>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            const count = stats ? stats[card.key] : 0;
            return (
              <motion.div
                key={card.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`${card.accentBorder} border bg-card/50 hover:bg-card/80 transition-colors duration-200`}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{card.label}</p>
                        <p className="text-3xl font-bold mt-1">{count}</p>
                      </div>
                      <div className={`h-10 w-10 rounded-lg ${card.accentBg} flex items-center justify-center`}>
                        <Icon className={`h-5 w-5 ${card.accent}`} />
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 mt-3">
                      <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{card.trend}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Quick Actions */}
      <Card className="bg-card/50 border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => setActiveSection('projects')}
              variant="outline"
              className="border-neon/20 text-neon hover:bg-neon/10 hover:text-neon gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Project
            </Button>
            <Button
              onClick={() => setActiveSection('blog')}
              variant="outline"
              className="border-cyan/20 text-cyan hover:bg-cyan/10 hover:text-cyan gap-2"
            >
              <FileText className="h-4 w-4" />
              Write Post
            </Button>
            <Button
              onClick={() => setActiveSection('messages')}
              variant="outline"
              className="border-rose-400/20 text-rose-400 hover:bg-rose-400/10 hover:text-rose-400 gap-2"
            >
              <Eye className="h-4 w-4" />
              View Messages
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Messages */}
      <Card className="bg-card/50 border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Recent Messages</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveSection('messages')}
              className="text-neon hover:text-neon hover:bg-neon/10 text-xs"
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-md" />
              ))}
            </div>
          ) : recentMessages.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No messages yet</p>
            </div>
          ) : (
            <ScrollArea className="max-h-96">
              <div className="divide-y divide-border">
                {recentMessages.map((msg, index) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-start gap-3 p-4 hover:bg-secondary/50 transition-colors ${
                      !msg.read ? 'border-l-2 border-l-neon bg-neon/5' : ''
                    }`}
                  >
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      !msg.read ? 'bg-neon/10' : 'bg-secondary'
                    }`}>
                      <Mail className={`h-4 w-4 ${!msg.read ? 'text-neon' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{msg.name}</p>
                        {!msg.read && (
                          <Badge variant="default" className="bg-neon/20 text-neon border-neon/30 text-[10px] px-1.5 py-0">
                            New
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{msg.subject}</p>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground flex-shrink-0">
                      <Clock className="h-3 w-3" />
                      <span className="text-xs">{formatDate(msg.createdAt)}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
