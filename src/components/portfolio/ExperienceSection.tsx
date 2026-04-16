'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Briefcase } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface Experience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string[];
  techStack: string[];
}

interface ExperienceSectionProps {
  experiences: Experience[];
}

function TimelineEntry({
  experience,
  index,
  isInView,
}: {
  experience: Experience;
  index: number;
  isInView: boolean;
}) {
  const isEven = index % 2 === 0;

  return (
    <div className="relative flex w-full gap-6 md:gap-0">
      {/* Timeline line and dot */}
      <div className="flex flex-col items-center md:absolute md:left-1/2 md:-translate-x-1/2">
        <motion.div
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{ duration: 0.4, delay: index * 0.15 + 0.2 }}
          className={`z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 ${
            experience.current
              ? 'border-[var(--neon)] bg-[var(--neon)]/20 pulse-glow'
              : 'border-[var(--neon)]/30 bg-background'
          }`}
        >
          <Briefcase className="h-3.5 w-3.5 text-[var(--neon)]" />
        </motion.div>
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, x: isEven ? -30 : 30 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.5, delay: index * 0.15 }}
        className={`flex-1 md:w-[calc(50%-2rem)] ${
          isEven ? 'md:mr-auto md:pr-8' : 'md:ml-auto md:pl-8'
        }`}
      >
        <div className="card-glow rounded-lg border border-[var(--neon)]/10 bg-card/50 p-5 backdrop-blur-sm">
          <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-foreground sm:text-lg">
                {experience.role}
              </h3>
              <p className="text-sm font-medium text-[var(--neon)]">
                {experience.company}
              </p>
            </div>
            <span className="font-mono text-xs text-muted-foreground whitespace-nowrap">
              {experience.startDate} — {experience.endDate}
            </span>
          </div>

          <ul className="mb-3 space-y-1.5">
            {experience.description.map((desc, i) => (
              <li
                key={i}
                className="text-xs leading-relaxed text-muted-foreground sm:text-sm"
              >
                <span className="mr-1.5 text-[var(--neon)]">▸</span>
                {desc}
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-1.5">
            {experience.techStack.map((tech) => (
              <Badge
                key={tech}
                variant="secondary"
                className="bg-[var(--neon)]/5 text-[10px] text-muted-foreground border-0"
              >
                {tech}
              </Badge>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function ExperienceSection({
  experiences,
}: ExperienceSectionProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      id="experience"
      ref={ref}
      className="relative py-20 sm:py-28"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16 flex items-center gap-4"
        >
          <span className="font-mono text-sm text-[var(--neon)]">04.</span>
          <h2 className="text-2xl font-bold sm:text-3xl md:text-4xl">
            Experience
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-[var(--neon)]/30 to-transparent" />
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Glowing vertical line */}
          <div className="absolute left-[15px] top-0 h-full w-px bg-gradient-to-b from-[var(--neon)] via-[var(--neon)]/30 to-transparent md:left-1/2 md:-translate-x-1/2" />

          <div className="flex flex-col gap-8 md:gap-10">
            {experiences.map((exp, i) => (
              <TimelineEntry
                key={exp.id}
                experience={exp}
                index={i}
                isInView={isInView}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
