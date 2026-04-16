'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Globe,
  Languages,
  Heart,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export interface Profile {
  name: string;
  title: string;
  tagline: string;
  bio: string[];
  email: string;
  phone: string;
  location: string;
  website: string;
  github: string;
  linkedin: string;
  twitter: string;
}

interface AboutSectionProps {
  profile: Profile;
}

const quickInfo = [
  { icon: Mail, label: 'Email', key: 'email' as const },
  { icon: Phone, label: 'Phone', key: 'phone' as const },
  { icon: MapPin, label: 'Location', key: 'location' as const },
  { icon: GraduationCap, label: 'Education', key: 'education' as const },
  { icon: Languages, label: 'Languages', key: 'languages' as const },
  { icon: Heart, label: 'Interests', key: 'interests' as const },
];

function highlightKeywords(text: string) {
  const keywords = [
    'AI',
    'Machine Learning',
    'Deep Learning',
    'NLP',
    'Computer Vision',
    'Python',
    'React',
    'TensorFlow',
    'PyTorch',
    'Full-Stack',
    'neural networks',
    'data pipelines',
    'MLOps',
  ];
  const parts: { text: string; highlighted: boolean }[] = [];
  let remaining = text;

  for (const kw of keywords) {
    const idx = remaining.toLowerCase().indexOf(kw.toLowerCase());
    if (idx !== -1) {
      if (idx > 0) {
        parts.push({ text: remaining.slice(0, idx), highlighted: false });
      }
      parts.push({
        text: remaining.slice(idx, idx + kw.length),
        highlighted: true,
      });
      remaining = remaining.slice(idx + kw.length);
    }
  }

  if (remaining.length > 0) {
    parts.push({ text: remaining, highlighted: false });
  }

  if (parts.length === 0) {
    parts.push({ text, highlighted: false });
  }

  return parts.map((part, i) =>
    part.highlighted ? (
      <span key={i} className="text-[var(--neon)] font-semibold">
        {part.text}
      </span>
    ) : (
      <span key={i}>{part.text}</span>
    )
  );
}

export default function AboutSection({ profile }: AboutSectionProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const infoValues: Record<string, string> = {
    email: profile.email,
    phone: profile.phone,
    location: profile.location,
    education: 'B.Tech CSE (AI & ML)',
    languages: 'English, Hindi',
    interests: 'AI, Open Source, Chess',
  };

  return (
    <section id="about" ref={ref} className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-12 flex items-center gap-4"
        >
          <span className="font-mono text-sm text-[var(--neon)]">01.</span>
          <h2 className="text-2xl font-bold sm:text-3xl md:text-4xl">
            About Me
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-[var(--neon)]/30 to-transparent" />
        </motion.div>

        <div className="grid gap-10 lg:grid-cols-5">
          {/* Left column: Profile */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col items-center lg:col-span-2"
          >
            {/* Avatar */}
            <div className="pulse-glow mb-6 flex h-36 w-36 items-center justify-center rounded-full bg-gradient-to-br from-[var(--neon)] via-[var(--cyan)] to-[var(--neon-dim)] sm:h-44 sm:w-44">
              <span className="text-4xl font-bold text-background sm:text-5xl">
                AC
              </span>
            </div>
            <h3 className="mb-1 text-xl font-bold sm:text-2xl">{profile.name}</h3>
            <p className="mb-1 text-[var(--neon)] text-sm font-medium">
              {profile.title}
            </p>
            <div className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground sm:text-sm">
              <MapPin className="h-3.5 w-3.5" />
              {profile.location}
            </div>
            <p className="text-center text-sm text-muted-foreground sm:text-base">
              {profile.tagline}
            </p>
          </motion.div>

          {/* Right column: Bio */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="lg:col-span-3"
          >
            <div className="space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {profile.bio.map((paragraph, i) => (
                <p key={i}>{highlightKeywords(paragraph)}</p>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Quick info cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6"
        >
          {quickInfo.map((info) => {
            const Icon = info.icon;
            return (
              <Card
                key={info.label}
                className="card-glow border-[var(--neon)]/10 bg-card/50 text-center"
              >
                <CardContent className="p-3 sm:p-4">
                  <Icon className="mx-auto mb-2 h-5 w-5 text-[var(--neon)] sm:h-6 sm:w-6" />
                  <div className="text-xs font-medium text-muted-foreground">
                    {info.label}
                  </div>
                  <div className="mt-1 text-xs font-medium text-foreground sm:text-sm break-all">
                    {infoValues[info.key]}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
