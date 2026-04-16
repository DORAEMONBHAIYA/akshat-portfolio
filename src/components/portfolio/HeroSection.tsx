'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Send, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface HeroStatData {
  value: string;
  label: string;
}

interface HeroSectionProps {
  name?: string;
  title?: string;
  tagline?: string;
  resume?: string;
  stats?: HeroStatData[];
  typingTitles?: string[];
  onNameClick?: () => void;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

const terminalLines = [
  { prompt: '$ whoami', output: 'Passionate AI/ML Engineer' },
  { prompt: '$ cat interests.txt', output: 'Deep Learning | NLP | Computer Vision' },
  { prompt: '$ echo $CURRENT_STATUS', output: 'Open to opportunities' },
];

const defaultStats = [
  { value: '3+', label: 'Years Experience' },
  { value: '6+', label: 'Projects' },
  { value: '5+', label: 'Technologies' },
  { value: '3+', label: 'Publications' },
];

const defaultTitles = [
  'AI/ML Engineer',
  'Full-Stack Developer',
  'Deep Learning Researcher',
];

export default function HeroSection({ name = 'Developer', title, tagline, resume, stats, typingTitles, onNameClick }: HeroSectionProps) {

  // Use dynamic titles from props, or fallback to defaults
  const titles = typingTitles && typingTitles.length > 0
    ? typingTitles.filter(t => t.trim())
    : defaultTitles;

  // Use dynamic stats from DB if available, otherwise use defaults
  // Only show stats that have both label and value (non-empty)
  const displayStats = (stats && stats.length > 0 ? stats : defaultStats).filter(
    (s) => s.label.trim() && s.value.trim()
  );
  const [titleIndex, setTitleIndex] = useState(0);
  const [displayedTitle, setDisplayedTitle] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [terminalLineIndex, setTerminalLineIndex] = useState(-1);

  // Use title from profile if provided, else use the first typing title
  const displayTagline = tagline || 'B.Tech CSE (AI & ML) | Building Intelligent Systems';

  // Typing effect for titles
  useEffect(() => {
    if (titles.length === 0) return;
    const currentTitle = titles[titleIndex % titles.length];
    let timeout: NodeJS.Timeout;

    if (!isDeleting) {
      if (displayedTitle.length < currentTitle.length) {
        // Typing forward
        timeout = setTimeout(() => {
          setDisplayedTitle(currentTitle.slice(0, displayedTitle.length + 1));
        }, 80);
      } else {
        // Finished typing - pause then start deleting
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, 2000);
      }
    } else {
      if (displayedTitle.length > 0) {
        // Deleting
        timeout = setTimeout(() => {
          setDisplayedTitle(currentTitle.slice(0, displayedTitle.length - 1));
        }, 40);
      } else {
        // Finished deleting - move to next title
        setIsDeleting(false);
        setTitleIndex((prev) => (prev + 1) % titles.length);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayedTitle, isDeleting, titleIndex, titles]);

  // Terminal line reveal
  useEffect(() => {
    if (terminalLineIndex < terminalLines.length) {
      const timeout = setTimeout(() => {
        setTerminalLineIndex((prev) => prev + 1);
      }, 1200);
      return () => clearTimeout(timeout);
    }
  }, [terminalLineIndex]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' as const },
    },
  };

  return (
    <section className="grid-bg relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pt-20">
      {/* Background gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-80 w-80 rounded-full bg-[var(--neon)]/5 blur-[120px]" />
        <div className="absolute top-1/3 -right-20 h-60 w-60 rounded-full bg-[var(--cyan)]/5 blur-[100px]" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-auto max-w-5xl text-center"
      >
        {/* Greeting tag */}
        <motion.div variants={itemVariants} className="mb-4">
          <span className="font-mono text-sm text-[var(--neon)]/70">
            &lt;Welcome to my portfolio /&gt;
          </span>
        </motion.div>

        {/* Name */}
        <motion.h1
          variants={itemVariants}
          className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-7xl"
        >
          Hi, I&apos;m{' '}
          <span className="neon-glow text-[var(--neon)]">{name}</span>
        </motion.h1>

        {/* Typing title */}
        <motion.div
          variants={itemVariants}
          className="mb-2 text-xl font-medium sm:text-2xl md:text-3xl"
        >
          <span className="text-[var(--cyan)]">{displayedTitle}</span>
          <span className="typing-cursor" />
        </motion.div>

        {/* Tagline */}
        <motion.div variants={itemVariants} className="mb-8">
          <code className="inline-block rounded-md border border-[var(--neon)]/20 bg-[var(--neon)]/5 px-3 py-1.5 font-mono text-xs text-muted-foreground sm:text-sm md:text-base">
            <span className="text-[var(--neon)]">&gt;</span> {displayTagline}
          </code>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={itemVariants}
          className={`mb-10 grid grid-cols-2 gap-3 sm:gap-4 ${displayStats.length >= 4 ? 'md:grid-cols-4' : displayStats.length >= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}
        >
          {displayStats.map((stat, i) => (
            <Card
              key={stat.label}
              className="card-glow border-[var(--neon)]/10 bg-card/50 backdrop-blur-sm"
            >
              <CardContent className="p-3 sm:p-4">
                <div className="text-2xl font-bold text-[var(--neon)] sm:text-3xl">
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground sm:text-sm">
                  {stat.label}
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Terminal window */}
        <motion.div
          variants={itemVariants}
          className="mx-auto mb-10 max-w-lg overflow-hidden rounded-lg terminal"
        >
          {/* Title bar */}
          <div className="flex items-center gap-2 border-b border-[var(--neon)]/20 bg-[oklch(0.11_0.005_260)]/80 px-4 py-2.5">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <div className="h-3 w-3 rounded-full bg-yellow-500" />
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <span className="ml-2 font-mono text-xs text-muted-foreground">
              {name.toLowerCase().replace(/\s+/g, '')}@portfolio:~
            </span>
          </div>
          {/* Terminal content */}
          <div className="p-4 text-left font-mono text-sm">
            {terminalLines.map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={
                  i <= terminalLineIndex
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0, y: 10 }
                }
                transition={{ duration: 0.4 }}
                className="mb-2 last:mb-0"
              >
                <div className="text-[var(--cyan)]/80">{line.prompt}</div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={
                    i <= terminalLineIndex ? { opacity: 1 } : { opacity: 0 }
                  }
                  transition={{ duration: 0.4, delay: 0.3 }}
                  className="text-[var(--neon)]"
                >
                  {line.output}
                </motion.div>
              </motion.div>
            ))}
            {terminalLineIndex >= terminalLines.length && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="typing-cursor text-[var(--neon)]"
              >
                $
              </motion.span>
            )}
          </div>
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4"
        >
          <Button
            onClick={() => scrollTo('projects')}
            className="group gap-2 border-[var(--neon)] bg-[var(--neon)]/10 text-[var(--neon)] hover:bg-[var(--neon)]/20 hover:text-[var(--neon)]"
            size="lg"
          >
            View Projects
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
          <Button
            onClick={() => scrollTo('contact')}
            variant="outline"
            className="group gap-2 border-[var(--cyan)]/30 text-[var(--cyan)] hover:border-[var(--cyan)]/60 hover:bg-[var(--cyan)]/10 hover:text-[var(--cyan)]"
            size="lg"
          >
            Get in Touch
            <Send className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
          {resume && (
            <Button
              onClick={() => window.open(resume, '_blank')}
              variant="outline"
              className="group gap-2 border-[var(--neon)]/30 text-[var(--neon)] hover:border-[var(--neon)]/60 hover:bg-[var(--neon)]/10 hover:text-[var(--neon)]"
              size="lg"
            >
              <FileDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
              Download Resume
            </Button>
          )}
        </motion.div>
      </motion.div>

    </section>
  );
}
