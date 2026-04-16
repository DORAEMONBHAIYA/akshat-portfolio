'use client';

import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export interface Skill {
  name: string;
  level: number;
  category: string;
}

interface SkillsSectionProps {
  skills: Skill[];
}

function SkillBar({
  skill,
  index,
  inView,
}: {
  skill: Skill;
  index: number;
  inView: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="group"
    >
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{skill.name}</span>
        <span className="font-mono text-xs text-[var(--neon)]">
          {skill.level}%
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--neon)]/10">
        <motion.div
          initial={{ width: 0 }}
          animate={inView ? { width: `${skill.level}%` } : { width: 0 }}
          transition={{
            duration: 0.8,
            delay: index * 0.06 + 0.2,
            ease: 'easeOut',
          }}
          className="progress-glow h-full rounded-full bg-gradient-to-r from-[var(--neon)] to-[var(--cyan)]"
        />
      </div>
    </motion.div>
  );
}

export default function SkillsSection({ skills }: SkillsSectionProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  // Build categories dynamically from the skills data
  const categorySet = new Set<string>();
  skills.forEach((s) => categorySet.add(s.category));
  const categories = Array.from(categorySet).map((name) => ({ key: name, label: name }));
  const [activeTab, setActiveTab] = useState(categories[0]?.key || '');

  const getSkillsByCategory = (category: string) =>
    skills.filter((s) => s.category === category);

  return (
    <section id="skills" ref={ref} className="relative py-20 sm:py-28">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-1/4 h-60 w-60 rounded-full bg-[var(--neon)]/3 blur-[120px]" />
        <div className="absolute bottom-1/4 right-0 h-60 w-60 rounded-full bg-[var(--cyan)]/3 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-12 flex items-center gap-4"
        >
          <span className="font-mono text-sm text-[var(--neon)]">02.</span>
          <h2 className="text-2xl font-bold sm:text-3xl md:text-4xl">
            Technical Arsenal
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-[var(--neon)]/30 to-transparent" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="mb-8 flex-wrap bg-card/50 border border-[var(--neon)]/10">
              {categories.map((cat) => (
                <TabsTrigger
                  key={cat.key}
                  value={cat.key}
                  className="data-[state=active]:bg-[var(--neon)]/15 data-[state=active]:text-[var(--neon)] text-muted-foreground text-xs sm:text-sm"
                >
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((cat) => {
              const catSkills = getSkillsByCategory(cat.key);
              return (
                <TabsContent key={cat.key} value={cat.key}>
                  {catSkills.length === 0 ? (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                      No skills in this category yet.
                    </div>
                  ) : (
                    <div className="grid gap-5 sm:grid-cols-2">
                      {catSkills.map((skill, i) => (
                        <SkillBar
                          key={skill.name}
                          skill={skill}
                          index={i}
                          inView={isInView}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        </motion.div>
      </div>
    </section>
  );
}
