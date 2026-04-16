'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { GraduationCap, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  gpa: string;
  startDate: string;
  endDate: string;
  description?: string;
}

interface EducationSectionProps {
  education: Education[];
}

export default function EducationSection({
  education,
}: EducationSectionProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="education" ref={ref} className="grid-bg relative py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-12 flex items-center gap-4"
        >
          <span className="font-mono text-sm text-[var(--neon)]">05.</span>
          <h2 className="text-2xl font-bold sm:text-3xl md:text-4xl">
            Education
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-[var(--neon)]/30 to-transparent" />
        </motion.div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {education.map((edu, i) => (
            <motion.div
              key={edu.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.12 }}
            >
              <Card className="card-glow group h-full border-[var(--neon)]/10 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-5 sm:p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--neon)]/20 bg-[var(--neon)]/5">
                      <GraduationCap className="h-5 w-5 text-[var(--neon)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="truncate text-sm font-bold text-foreground sm:text-base">
                        {edu.institution}
                      </h3>
                      <p className="font-mono text-[10px] text-muted-foreground">
                        {edu.startDate} — {edu.endDate}
                      </p>
                    </div>
                  </div>

                  <div className="mb-3 space-y-1">
                    <p className="text-sm font-semibold text-[var(--cyan)]">
                      {edu.degree}
                    </p>
                    <p className="text-xs text-muted-foreground">{edu.field}</p>
                  </div>

                  {edu.gpa && (
                    <div className="mb-3 flex items-center gap-2">
                      <Award className="h-3.5 w-3.5 text-[var(--neon)]" />
                      <span className="text-xs font-medium">
                        GPA: <span className="text-[var(--neon)]">{edu.gpa}</span>
                      </span>
                    </div>
                  )}

                  {edu.description && (
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {edu.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
