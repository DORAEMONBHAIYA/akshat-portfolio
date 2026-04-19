"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ExternalLink, Github, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

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

// Markdown-like renderer for longDesc
function renderFormattedText(text: string) {
  if (!text) return null;
  const lines = text.split("\n");
  const elements: React.JSX.Element[] = [];
  let listItems: string[] = [];

  const flushList = (ordered: boolean) => {
    if (listItems.length > 0) {
      const Tag = ordered ? "ol" : "ul";
      elements.push(
        <Tag
          key={`list-${elements.length}`}
          className={
            ordered
              ? "my-3 list-decimal list-inside space-y-1.5"
              : "my-3 space-y-1.5"
          }
        >
          {listItems.map((item, i) => {
            // Parse bold text within list items
            const parts = item.split(/(\*\*.*?\*\*)/g);
            return (
              <li
                key={i}
                className="flex gap-2 text-sm leading-relaxed text-muted-foreground"
              >
                {!ordered && (
                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--neon)]" />
                )}
                <span>
                  {parts.map((part, pi) => {
                    if (part.startsWith("**") && part.endsWith("**")) {
                      return (
                        <span
                          key={pi}
                          className="font-semibold text-foreground"
                        >
                          {part.slice(2, -2)}
                        </span>
                      );
                    }
                    return <span key={pi}>{part}</span>;
                  })}
                </span>
              </li>
            );
          })}
        </Tag>,
      );
      listItems = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Bullet list items (• or -)
    if (line.trim().startsWith("• ") || line.trim().startsWith("- ")) {
      flushList(false);
      listItems.push(line.trim().replace(/^[•-]\s/, ""));
      continue;
    }

    // Numbered list items
    if (line.trim().match(/^\d+\.\s/)) {
      flushList(false);
      listItems.push(line.trim().replace(/^\d+\.\s/, ""));
      continue;
    }

    flushList(false);

    // Headers
    if (line.startsWith("### ")) {
      elements.push(
        <h3
          key={`h3-${i}`}
          className="mb-2 mt-5 text-base font-bold text-foreground"
        >
          {line.slice(4)}
        </h3>,
      );
      continue;
    }
    if (line.startsWith("## ")) {
      elements.push(
        <h2
          key={`h2-${i}`}
          className="mb-3 mt-6 text-lg font-bold text-[var(--neon)]"
        >
          {line.slice(3)}
        </h2>,
      );
      continue;
    }

    // Horizontal rule
    if (line.trim() === "---") {
      elements.push(
        <Separator key={`hr-${i}`} className="my-4 bg-[var(--neon)]/10" />,
      );
      continue;
    }

    // Empty line
    if (line.trim() === "") continue;

    // Paragraph with bold support
    const parts = line.split(/(\*\*.*?\*\*)/g);
    elements.push(
      <p
        key={`p-${i}`}
        className="mb-2 text-sm leading-relaxed text-muted-foreground"
      >
        {parts.map((part, pi) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return (
              <span key={pi} className="font-semibold text-foreground">
                {part.slice(2, -2)}
              </span>
            );
          }
          // Handle "Key Features:" style labels
          if (part.match(/^[A-Z][\w\s]+:$/)) {
            return (
              <span key={pi} className="font-semibold text-[var(--neon)]">
                {part}
              </span>
            );
          }
          return <span key={pi}>{part}</span>;
        })}
      </p>,
    );
  }

  flushList(false);
  return elements;
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
          <div className="mt-auto flex items-center gap-2 pt-2">
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-md border border-[var(--neon)]/20 bg-[var(--neon)]/5 px-3 py-1.5 text-xs font-medium text-[var(--neon)] transition-colors hover:bg-[var(--neon)]/10"
              >
                <Github className="h-3.5 w-3.5" /> Code
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-md border border-[var(--cyan)]/20 bg-[var(--cyan)]/5 px-3 py-1.5 text-xs font-medium text-[var(--cyan)] transition-colors hover:bg-[var(--cyan)]/10"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Live Demo
              </a>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto gap-1 text-xs text-muted-foreground hover:text-[var(--neon)]"
              onClick={() => onViewDetails(project)}
            >
              Details <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function ProjectsSection({ projects }: ProjectsSectionProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const categorySet = new Set<string>();
  projects.forEach((p) => {
    if (p.category) categorySet.add(p.category);
  });
  const filterTabs = ["All", ...Array.from(categorySet)];

  const filteredProjects =
    activeFilter === "All"
      ? projects
      : projects.filter((p) => p.category === activeFilter);

  return (
    <section
      id="projects"
      ref={ref}
      className="dot-pattern relative py-20 sm:py-28"
    >
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
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
                  ? "bg-[var(--neon)]/15 text-[var(--neon)] border border-[var(--neon)]/30"
                  : "border border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </motion.div>

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
          <DialogContent className="max-w-xl border-[var(--neon)]/20 bg-background/95 backdrop-blur-lg p-0 overflow-hidden">
            {selectedProject && (
              <>
                <div className="px-6 pt-6 pb-0">
                  <DialogHeader>
                    <DialogTitle className="text-xl">
                      {selectedProject.title}
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                      Details about {selectedProject.title}
                    </DialogDescription>
                  </DialogHeader>
                  <Separator className="mt-3 bg-[var(--neon)]/10" />
                </div>
                <ScrollArea className="max-h-[60vh] px-6 py-4">
                  <div className="prose-neon">
                    {renderFormattedText(
                      selectedProject.longDesc || selectedProject.description,
                    )}
                  </div>
                </ScrollArea>
                <div className="border-t border-[var(--neon)]/10 px-6 py-4">
                  <div className="flex flex-wrap gap-1.5 mb-3">
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
                  <div className="flex gap-2">
                    {selectedProject.github && (
                      <a
                        href={selectedProject.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 rounded-md border border-[var(--neon)]/20 bg-[var(--neon)]/5 px-3 py-2 text-xs font-medium text-[var(--neon)] transition-colors hover:bg-[var(--neon)]/10"
                      >
                        <Github className="h-3.5 w-3.5" /> View Source
                      </a>
                    )}
                    {selectedProject.liveUrl && (
                      <a
                        href={selectedProject.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 rounded-md border border-[var(--cyan)]/20 bg-[var(--cyan)]/5 px-3 py-2 text-xs font-medium text-[var(--cyan)] transition-colors hover:bg-[var(--cyan)]/10"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> Live Demo
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
