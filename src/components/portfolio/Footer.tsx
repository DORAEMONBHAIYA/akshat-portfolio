'use client';

import { Github, Linkedin, Twitter, Globe, Code2, Heart, Terminal } from 'lucide-react';

interface FooterProps {
  name?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
  leetcode?: string;
}

export default function Footer({ name = 'Developer', github, linkedin, twitter, website, leetcode }: FooterProps) {
  const socialLinks = [
    ...(github ? [{ icon: Github, href: github, label: 'GitHub' }] : []),
    ...(linkedin ? [{ icon: Linkedin, href: linkedin, label: 'LinkedIn' }] : []),
    ...(leetcode ? [{ icon: Code2, href: leetcode, label: 'LeetCode' }] : []),
    ...(twitter ? [{ icon: Twitter, href: twitter, label: 'Twitter' }] : []),
    ...(website ? [{ icon: Globe, href: website, label: 'Website' }] : []),
  ];

  return (
    <footer className="mt-auto border-t border-[var(--neon)]/10 bg-card/30 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-between">
          {/* Left */}
          <div className="flex flex-col items-center gap-1 text-center sm:items-start sm:text-left">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-[var(--neon)]" />
              <span className="text-sm font-medium">
                Designed &amp; Built by{' '}
                <span className="text-[var(--neon)]">{name}</span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} All Rights Reserved
            </p>
          </div>

          {/* Center: Made with heart */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            Made with{' '}
            <Heart className="h-3.5 w-3.5 fill-[var(--neon)] text-[var(--neon)]" />{' '}
            and lots of{' '}
            <span className="font-mono text-[var(--neon)]">coffee</span>
          </div>

          {/* Right: Social links */}
          <div className="flex items-center gap-3">
            {socialLinks.length > 0 && (
              <div className="flex gap-1.5">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-[var(--neon)]/10 hover:text-[var(--neon)]"
                    >
                      <Icon className="h-4 w-4" />
                      <span className="sr-only">{social.label}</span>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
