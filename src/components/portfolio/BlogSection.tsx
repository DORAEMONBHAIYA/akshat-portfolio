'use client';

import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Calendar, ArrowRight, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  tags: string[];
  createdAt: string;
  coverGradient?: string;
}

interface BlogSectionProps {
  posts: BlogPost[];
}

const gradients = [
  'from-[var(--neon)]/20 via-[var(--cyan)]/10 to-transparent',
  'from-[var(--cyan)]/20 via-[var(--neon)]/10 to-transparent',
  'from-purple-500/20 via-[var(--neon)]/10 to-transparent',
  'from-[var(--neon)]/15 via-emerald-500/10 to-transparent',
  'from-[var(--cyan)]/15 via-[var(--neon)]/5 to-transparent',
  'from-amber-500/15 via-[var(--neon)]/10 to-transparent',
];

export default function BlogSection({ posts }: BlogSectionProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  // Simple markdown-like renderer for blog content
  const renderContent = (content: string) => {
    if (!content) return null;

    const lines = content.split('\n');
    const elements: React.JSX.Element[] = [];
    let inCodeBlock = false;
    let codeContent = '';
    let listItems: string[] = [];

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`ul-${elements.length}`} className="my-3 space-y-1.5">
            {listItems.map((item, i) => (
              <li key={i} className="flex gap-2 text-sm leading-relaxed text-muted-foreground">
                <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--neon)]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        );
        listItems = [];
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Code blocks
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <pre key={`code-${i}`} className="my-3 overflow-x-auto rounded-lg border border-[var(--neon)]/15 bg-[oklch(0.11_0.005_260)] p-4 text-sm">
              <code className="font-mono text-[var(--neon)]/90">{codeContent.trim()}</code>
            </pre>
          );
          codeContent = '';
          inCodeBlock = false;
        } else {
          flushList();
          inCodeBlock = true;
        }
        continue;
      }

      if (inCodeBlock) {
        codeContent += line + '\n';
        continue;
      }

      // Unordered list items
      if (line.trim().match(/^\d+\.\s/)) {
        flushList();
        const text = line.trim().replace(/^\d+\.\s/, '').replace(/\*\*(.*?)\*\*/g, '$1');
        listItems.push(text);
        continue;
      }

      if (line.trim().startsWith('- ')) {
        flushList();
        const text = line.trim().slice(2).replace(/\*\*(.*?)\*\*/g, '$1');
        listItems.push(text);
        continue;
      }

      flushList();

      // Headers
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={`h3-${i}`} className="mb-2 mt-6 text-lg font-bold text-foreground">
            {line.slice(4)}
          </h3>
        );
        continue;
      }

      if (line.startsWith('## ')) {
        elements.push(
          <h2 key={`h2-${i}`} className="mb-3 mt-8 text-xl font-bold text-[var(--neon)]">
            {line.slice(3)}
          </h2>
        );
        continue;
      }

      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={`h1-${i}`} className="mb-4 mt-6 text-2xl font-bold text-[var(--neon)]">
            {line.slice(2)}
          </h1>
        );
        continue;
      }

      // Table support
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        const cells = line.split('|').filter(c => c.trim() !== '').map(c => c.trim());
        if (cells.every(c => /^[-:\s]+$/.test(c))) continue; // separator row
        elements.push(
          <div key={`table-${i}`} className="my-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {cells.map((cell, ci) => (
              <div key={ci} className="rounded border border-[var(--neon)]/10 bg-[var(--neon)]/5 px-3 py-2 text-xs text-muted-foreground">
                {cell.replace(/\*\*/g, '')}
              </div>
            ))}
          </div>
        );
        continue;
      }

      // Horizontal rule
      if (line.trim() === '---') {
        elements.push(
          <Separator key={`hr-${i}`} className="my-4 bg-[var(--neon)]/10" />
        );
        continue;
      }

      // Empty line
      if (line.trim() === '') continue;

      // Paragraph - support bold text
      const parts = line.split(/(\*\*.*?\*\*)/g);
      elements.push(
        <p key={`p-${i}`} className="mb-2 text-sm leading-relaxed text-muted-foreground">
          {parts.map((part, pi) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <span key={pi} className="font-semibold text-foreground">
                  {part.slice(2, -2)}
                </span>
              );
            }
            return <span key={pi}>{part}</span>;
          })}
        </p>
      );
    }

    flushList();

    return elements;
  };

  return (
    <section id="blog" ref={ref} className="relative py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-0 top-1/3 h-60 w-60 rounded-full bg-[var(--cyan)]/3 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-12 flex items-center gap-4"
        >
          <span className="font-mono text-sm text-[var(--neon)]">07.</span>
          <h2 className="text-2xl font-bold sm:text-3xl md:text-4xl">
            Blog &amp; Articles
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-[var(--neon)]/30 to-transparent" />
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Card className="card-glow group h-full overflow-hidden border-[var(--neon)]/10 bg-card/50 backdrop-blur-sm">
                {/* Cover gradient */}
                <div
                  className={`h-32 bg-gradient-to-br ${
                    post.coverGradient || gradients[i % gradients.length]
                  }`}
                >
                  <div className="dot-pattern flex h-full items-end p-4">
                    <div className="font-mono text-[10px] text-muted-foreground opacity-60">
                      {post.tags.slice(0, 2).join(' / ')}
                    </div>
                  </div>
                </div>

                <CardContent className="p-5">
                  <div className="mb-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(post.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>

                  <h3 className="mb-2 text-base font-bold leading-tight text-foreground group-hover:text-[var(--neon)] transition-colors">
                    {post.title}
                  </h3>

                  <p className="mb-4 text-xs leading-relaxed text-muted-foreground line-clamp-2 sm:text-sm">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {post.tags.slice(0, 3).map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="bg-[var(--neon)]/5 text-[10px] text-muted-foreground border-0"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <button
                      onClick={() => setSelectedPost(post)}
                      className="flex items-center gap-1 text-xs font-medium text-[var(--neon)] transition-colors hover:text-[var(--cyan)]"
                    >
                      Read
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="py-16 text-center text-muted-foreground">
            Blog posts coming soon...
          </div>
        )}
      </div>

      {/* Blog Post Dialog */}
      <Dialog
        open={!!selectedPost}
        onOpenChange={(open) => !open && setSelectedPost(null)}
      >
        <DialogContent className="max-h-[90vh] max-w-3xl border-[var(--neon)]/20 bg-background/95 backdrop-blur-lg p-0 overflow-hidden">
          {selectedPost && (
            <>
              {/* Cover gradient */}
              <div
                className={`h-32 bg-gradient-to-br ${
                  gradients[posts.findIndex(p => p.id === selectedPost.id) % gradients.length]
                }`}
              >
                <div className="dot-pattern flex h-full items-end p-6">
                  <div className="flex gap-1.5">
                    {selectedPost.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="bg-background/60 text-[10px] text-foreground backdrop-blur-sm border-0"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Header */}
              <div className="px-6 pt-4 pb-0">
                <DialogHeader>
                  <DialogTitle className="text-xl leading-tight text-foreground pr-8">
                    {selectedPost.title}
                  </DialogTitle>
                  <DialogDescription className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(selectedPost.createdAt).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </DialogDescription>
                </DialogHeader>
                <Separator className="mt-4 bg-[var(--neon)]/10" />
              </div>

              {/* Content */}
              <ScrollArea className="max-h-[calc(90vh-14rem)] px-6 py-5">
                <div className="prose-neon">
                  {renderContent(selectedPost.content)}
                </div>
              </ScrollArea>

              {/* Close button */}
              <div className="border-t border-[var(--neon)]/10 px-6 py-3">
                <Button
                  variant="ghost"
                  onClick={() => setSelectedPost(null)}
                  className="w-full text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4 mr-2" />
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
