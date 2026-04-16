'use client';

import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ExternalLink, Github, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export interface Project {
  id: string;
  title: string;
  description: string;
  longDesc: string;
  techStack: string[];
  github: string;
  liveUrl: string;
  featured: boolean;
  category?: string;
}

interface ProjectsSectionProps {
  projects: Project[];
}

function ProjectCard({
  project,
  index,
  inView,
  onViewDetails,
}: {
  project: Project;
  index: number;
  inView: boolean;
  onViewDetails: (p: Project) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="card-glow group relative h-full overflow-hidden border-[var(--neon)]/10 bg-card/50 backdrop-blur-sm">
        {/* Gradient top border */}
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-[var(--neon)] via-[var(--cyan)] to-[var(--neon)]" />

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg font-bold leading-tight text-foreground group-hover:text-[var(--neon)] transition-colors">
              {project.title}
            </CardTitle>
            {project.featured && (
              <Badge
                variant="outline"
                className="shrink-0 border-[var(--neon)]/30 text-[var(--neon)] text-[10px]"
              >
                Featured
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col gap-4">
          <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">
            {project.description}
          </p>

          {/* Tech stack */}
          <div className="flex flex-wrap gap-1.5">
            {project.techStack.slice(0, 5).map((tech) => (
              <Badge
                key={tech}
                variant="secondary"
                className="bg-[var(--neon)]/5 text-[10px] text-muted-foreground border-0"
              >
                {tech}
              </Badge>
            ))}
            {project.techStack.length > 5 && (
              <Badge
                variant="secondary"
                className="bg-[var(--neon)]/5 text-[10px] text-muted-foreground border-0"
              >
                +{project.techStack.length - 5}
              </Badge>
            )}
          </div>

          {/* Actions */}
          <div className="mt-auto flex items-center gap-2 pt-2">
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-md border border-[var(--neon)]/20 bg-[var(--neon)]/5 px-3 py-1.5 text-xs font-medium text-[var(--neon)] transition-colors hover:bg-[var(--neon)]/10"
              >
                <Github className="h-3.5 w-3.5" />
                Code
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-md border border-[var(--cyan)]/20 bg-[var(--cyan)]/5 px-3 py-1.5 text-xs font-medium text-[var(--cyan)] transition-colors hover:bg-[var(--cyan)]/10"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Live Demo
              </a>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto gap-1 text-xs text-muted-foreground hover:text-[var(--neon)]"
              onClick={() => onViewDetails(project)}
            >
              Details
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function ProjectsSection({ projects }: ProjectsSectionProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Build filter tabs from actual categories
  const categorySet = new Set<string>();
  projects.forEach((p) => {
    if (p.category) categorySet.add(p.category);
  });
  const filterTabs = ['All', ...Array.from(categorySet)];

  const filteredProjects =
    activeFilter === 'All'
      ? projects
      : projects.filter((p) => p.category === activeFilter);

  return (
    <section id="projects" ref={ref} className="dot-pattern relative py-20 sm:py-28">
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-12 flex items-center gap-4"
        >
          <span className="font-mono text-sm text-[var(--neon)]">03.</span>
          <h2 className="text-2xl font-bold sm:text-3xl md:text-4xl">
            Featured Projects
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-[var(--neon)]/30 to-transparent" />
        </motion.div>

        {/* Filter tabs */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-8 flex flex-wrap gap-2"
        >
          {filterTabs.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`rounded-md px-4 py-1.5 text-xs font-medium transition-all sm:text-sm ${
                activeFilter === f
                  ? 'bg-[var(--neon)]/15 text-[var(--neon)] border border-[var(--neon)]/30'
                  : 'border border-transparent text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {f}
            </button>
          ))}
        </motion.div>

        {/* Project grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFilter}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid gap-5 sm:grid-cols-2"
          >
            {filteredProjects.map((project, i) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={i}
                inView={isInView}
                onViewDetails={setSelectedProject}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        {filteredProjects.length === 0 && (
          <div className="py-16 text-center text-muted-foreground">
            No projects found for this filter.
          </div>
        )}

        {/* Project detail dialog */}
        <Dialog
          open={!!selectedProject}
          onOpenChange={(open) => !open && setSelectedProject(null)}
        >
          <DialogContent className="max-w-xl border-[var(--neon)]/20 bg-background/95 backdrop-blur-lg">
            {selectedProject && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-xl">
                    {selectedProject.title}
                  </DialogTitle>
                  <DialogDescription className="sr-only">
                    Details about {selectedProject.title}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {selectedProject.longDesc || selectedProject.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProject.techStack.map((tech) => (
                      <Badge
                        key={tech}
                        variant="secondary"
                        className="bg-[var(--neon)]/5 text-xs border-0"
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-2">
                    {selectedProject.github && (
                      <a
                        href={selectedProject.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 rounded-md border border-[var(--neon)]/20 bg-[var(--neon)]/5 px-3 py-2 text-xs font-medium text-[var(--neon)] transition-colors hover:bg-[var(--neon)]/10"
                      >
                        <Github className="h-3.5 w-3.5" />
                        View Source
                      </a>
                    )}
                    {selectedProject.liveUrl && (
                      <a
                        href={selectedProject.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 rounded-md border border-[var(--cyan)]/20 bg-[var(--cyan)]/5 px-3 py-2 text-xs font-medium text-[var(--cyan)] transition-colors hover:bg-[var(--cyan)]/10"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Live Demo
                      </a>
                    )}
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
