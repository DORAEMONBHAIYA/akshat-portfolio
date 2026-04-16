'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Trophy, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface AchievementData {
  id: string;
  title: string;
  description: string;
  date: string;
  techStack: string[];
}

interface AchievementSectionProps {
  achievements: AchievementData[];
}

function AchievementCard({
  achievement,
  index,
  isInView,
}: {
  achievement: AchievementData;
  index: number;
  isInView: boolean;
}) {
  const descriptions = achievement.description
    ? achievement.description.split('\n').filter((d) => d.trim())
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group"
    >
      <div className="card-glow h-full rounded-lg border border-[var(--neon)]/10 bg-card/50 p-5 backdrop-blur-sm transition-colors hover:border-[var(--neon)]/30">
        {/* Trophy icon + title */}
        <div className="mb-3 flex items-start gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-[var(--neon)]/20 bg-[var(--neon)]/10">
            <Trophy className="h-4 w-4 text-[var(--neon)]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-foreground sm:text-base leading-tight">
              {achievement.title}
            </h3>
            {achievement.date && (
              <div className="mt-1 flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span className="font-mono text-xs">{achievement.date}</span>
              </div>
            )}
          </div>
        </div>

        {/* Description as bullet points */}
        {descriptions.length > 0 && (
          <ul className="mb-3 space-y-1.5">
            {descriptions.map((desc, i) => (
              <li
                key={i}
                className="text-xs leading-relaxed text-muted-foreground sm:text-sm"
              >
                <span className="mr-1.5 text-[var(--neon)]">▸</span>
                {desc}
              </li>
            ))}
          </ul>
        )}

        {/* Tech stack badges */}
        {achievement.techStack.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {achievement.techStack.map((tech) => (
              <Badge
                key={tech}
                variant="secondary"
                className="bg-[var(--neon)]/5 text-[10px] text-muted-foreground border-0"
              >
                {tech}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function AchievementSection({
  achievements,
}: AchievementSectionProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      id="achievements"
      ref={ref}
      className="relative py-20 sm:py-28"
    >
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-0 top-1/3 h-60 w-60 rounded-full bg-[var(--neon)]/3 blur-[120px]" />
        <div className="absolute bottom-1/4 left-0 h-60 w-60 rounded-full bg-[var(--cyan)]/3 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-12 flex items-center gap-4"
        >
          <span className="font-mono text-sm text-[var(--neon)]">06.</span>
          <h2 className="text-2xl font-bold sm:text-3xl md:text-4xl">
            Achievements
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-[var(--neon)]/30 to-transparent" />
        </motion.div>

        {/* Grid layout */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {achievements.map((achievement, i) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              index={i}
              isInView={isInView}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
