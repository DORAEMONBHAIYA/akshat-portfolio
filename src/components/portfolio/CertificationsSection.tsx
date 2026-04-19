"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Award, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  description: string;
  date: string;
  credentialUrl: string;
  credentialId: string;
}

interface CertificationsSectionProps {
  certifications: Certification[];
}

export default function CertificationsSection({
  certifications,
}: CertificationsSectionProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="certifications" ref={ref} className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-12 flex items-center gap-4"
        >
          <span className="font-mono text-sm text-[var(--neon)]">05b.</span>
          <h2 className="text-2xl font-bold sm:text-3xl md:text-4xl">
            Certifications
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-[var(--neon)]/30 to-transparent" />
        </motion.div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {certifications.map((cert, i) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.12 }}
            >
              <Card className="card-glow group h-full border-[var(--neon)]/10 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-5 sm:p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--cyan)]/20 bg-[var(--cyan)]/5">
                      <Award className="h-5 w-5 text-[var(--cyan)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="truncate text-sm font-bold text-foreground sm:text-base group-hover:text-[var(--neon)] transition-colors">
                        {cert.title}
                      </h3>
                      <p className="font-mono text-[10px] text-muted-foreground">
                        {cert.date}
                      </p>
                    </div>
                  </div>

                  {cert.issuer && (
                    <p className="mb-3 text-sm font-semibold text-[var(--cyan)]">
                      {cert.issuer}
                    </p>
                  )}

                  {cert.description && (
                    <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
                      {cert.description}
                    </p>
                  )}

                  {cert.credentialUrl && (
                    <a
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--neon)] transition-colors hover:text-[var(--cyan)]"
                    >
                      <ExternalLink className="h-3 w-3" /> View Credential
                    </a>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {certifications.length === 0 && (
          <div className="py-16 text-center text-muted-foreground">
            No certifications yet.
          </div>
        )}
      </div>
    </section>
  );
}
