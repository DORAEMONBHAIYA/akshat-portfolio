'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface NavbarProps {
  name?: string;
  visibleSections?: string[]
  onLogoTripleClick?: () => void;
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

const allNavLinks = [
  { id: 'about', label: 'About', href: '#about' },
  { id: 'skills', label: 'Skills', href: '#skills' },
  { id: 'projects', label: 'Projects', href: '#projects' },
  { id: 'experience', label: 'Experience', href: '#experience' },
  { id: 'education', label: 'Education', href: '#education' },
  { id: 'achievements', label: 'Achievements', href: '#achievements' },
  { id: 'blog', label: 'Blog', href: '#blog' },
  { id: 'contact', label: 'Contact', href: '#contact' },
];

export default function Navbar({ name = 'Developer', visibleSections, onLogoTripleClick }: NavbarProps) {

  const navLinks = allNavLinks.filter((link) => !visibleSections || visibleSections.includes(link.id));
  const [activeSection, setActiveSection] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const initials = getInitials(name);
  const nameParts = name.trim().split(/\s+/);
  const firstName = nameParts[0] || 'Developer';
  const lastName = nameParts.slice(1).join(' ');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      const sections = navLinks.map((link) => link.href.slice(1));
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120) {
            setActiveSection(sections[i]);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (href: string) => {
    setIsOpen(false);
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'glass shadow-lg' : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo - triple-click opens admin */}
        <motion.button
          onClick={() => {
            if (onLogoTripleClick) onLogoTripleClick();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2"
          title="Triple-click for secret access"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border-2 border-[var(--neon)] text-sm font-bold text-[var(--neon)]">
            {initials}
          </div>
          <span className="hidden text-lg font-semibold text-foreground sm:block">
            {firstName}<span className="text-[var(--neon)]">{lastName}</span>
          </span>
        </motion.button>

        {/* Desktop Nav Links */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollTo(link.href)}
              className={`relative rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-[var(--neon)] ${
                activeSection === link.href.slice(1)
                  ? 'text-[var(--neon)]'
                  : 'text-muted-foreground'
              }`}
            >
              {link.label}
              {activeSection === link.href.slice(1) && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-[var(--neon)]"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Mobile hamburger */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-[var(--neon)]"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-72 border-[var(--neon)]/20 bg-background/95 backdrop-blur-lg"
              >
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2 text-[var(--neon)]">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-[var(--neon)] text-xs font-bold text-[var(--neon)]">
                      {initials}
                    </div>
                    Navigation
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 flex flex-col gap-1">
                  {navLinks.map((link, i) => (
                    <motion.button
                      key={link.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => scrollTo(link.href)}
                      className={`rounded-md px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-[var(--neon)]/10 hover:text-[var(--neon)] ${
                        activeSection === link.href.slice(1)
                          ? 'bg-[var(--neon)]/10 text-[var(--neon)]'
                          : 'text-muted-foreground'
                      }`}
                    >
                      <span className="font-mono text-[var(--neon)]/50 mr-2">
                        0{i + 1}.
                      </span>
                      {link.label}
                    </motion.button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </motion.header>
  );
}
