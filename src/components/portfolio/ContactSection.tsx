'use client';

import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Mail,
  Phone,
  MapPin,
  Github,
  Linkedin,
  Twitter,
  Globe,
  Code2,
  Send,
  Terminal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { z } from 'zod/v4';
import { zodResolver } from '@hookform/resolvers/zod';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.email('Please enter a valid email address'),
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactForm = z.infer<typeof contactSchema>;

interface ContactSectionProps {
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  leetcode?: string;
}

export default function ContactSection({
  email = '',
  phone = '',
  location = '',
  website = '',
  github = '',
  linkedin = '',
  twitter = '',
  leetcode = '',
}: ContactSectionProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  const onSubmit = async (data: ContactForm) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        toast.success('Message sent successfully!', {
          description: "I'll get back to you soon.",
        });
        form.reset();
      } else {
        toast.error('Failed to send message', {
          description: 'Please try again later.',
        });
      }
    } catch {
      toast.error('Network error', {
        description: 'Please check your connection and try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const socialLinks = [
    ...(github ? [{ icon: Github, href: github, label: 'GitHub' }] : []),
    ...(linkedin ? [{ icon: Linkedin, href: linkedin, label: 'LinkedIn' }] : []),
    ...(leetcode ? [{ icon: Code2, href: leetcode, label: 'LeetCode' }] : []),
    ...(twitter ? [{ icon: Twitter, href: twitter, label: 'Twitter' }] : []),
    ...(website ? [{ icon: Globe, href: website, label: 'Website' }] : []),
  ];

  const contactInfo = [
    ...(email ? [{ icon: Mail, value: email, label: 'Email' }] : []),
    ...(phone ? [{ icon: Phone, value: phone, label: 'Phone' }] : []),
    ...(location ? [{ icon: MapPin, value: location, label: 'Location' }] : []),
  ];

  return (
    <section id="contact" ref={ref} className="dot-pattern relative py-20 sm:py-28">
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-12 flex items-center gap-4"
        >
          <span className="font-mono text-sm text-[var(--neon)]">08.</span>
          <h2 className="text-2xl font-bold sm:text-3xl md:text-4xl">
            Get in Touch
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-[var(--neon)]/30 to-transparent" />
        </motion.div>

        <div className="grid gap-10 lg:grid-cols-5">
          {/* Left: Contact info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-2"
          >
            <p className="mb-8 text-sm leading-relaxed text-muted-foreground sm:text-base">
              I&apos;m currently open to new opportunities and collaborations. Whether
              you have a project idea, a question, or just want to say hi, feel free
              to reach out!
            </p>

            <div className="mb-8 space-y-4">
              {contactInfo.map((info) => {
                const Icon = info.icon;
                return (
                  <div key={info.label} className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--neon)]/20 bg-[var(--neon)]/5">
                      <Icon className="h-4 w-4 text-[var(--neon)]" />
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        {info.label}
                      </div>
                      <div className="text-sm font-medium">{info.value}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Social links */}
            {socialLinks.length > 0 && (
              <div className="mb-8">
                <div className="mb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Connect
                </div>
                <div className="flex gap-2">
                  {socialLinks.map((social) => {
                    const Icon = social.icon;
                    return (
                      <a
                        key={social.label}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--neon)]/15 bg-[var(--neon)]/5 text-muted-foreground transition-colors hover:border-[var(--neon)]/40 hover:bg-[var(--neon)]/10 hover:text-[var(--neon)]"
                      >
                        <Icon className="h-4 w-4" />
                        <span className="sr-only">{social.label}</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Terminal decoration */}
            <div className="terminal rounded-lg overflow-hidden">
              <div className="flex items-center gap-2 border-b border-[var(--neon)]/20 bg-[oklch(0.11_0.005_260)]/80 px-3 py-2">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                <span className="ml-1.5 font-mono text-[10px] text-muted-foreground">
                  contact.sh
                </span>
              </div>
              <div className="p-3 font-mono text-[10px] sm:text-xs text-muted-foreground">
                <div>
                  <span className="text-[var(--cyan)]">$</span> echo &quot;Let&apos;s build something amazing together!&quot;
                </div>
                <div className="text-[var(--neon)]">
                  &gt; Let&apos;s build something amazing together!
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Contact form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-3"
          >
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-muted-foreground">
                          Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="John Doe"
                            className="border-[var(--neon)]/15 bg-card/50 text-sm placeholder:text-muted-foreground/50 focus-visible:border-[var(--neon)]/40 focus-visible:ring-[var(--neon)]/20"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-muted-foreground">
                          Email
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="john@example.com"
                            className="border-[var(--neon)]/15 bg-card/50 text-sm placeholder:text-muted-foreground/50 focus-visible:border-[var(--neon)]/40 focus-visible:ring-[var(--neon)]/20"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">
                        Subject
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Project Collaboration"
                          className="border-[var(--neon)]/15 bg-card/50 text-sm placeholder:text-muted-foreground/50 focus-visible:border-[var(--neon)]/40 focus-visible:ring-[var(--neon)]/20"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">
                        Message
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Tell me about your project or idea..."
                          rows={5}
                          className="border-[var(--neon)]/15 bg-card/50 text-sm placeholder:text-muted-foreground/50 focus-visible:border-[var(--neon)]/40 focus-visible:ring-[var(--neon)]/20 resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full gap-2 border-[var(--neon)] bg-[var(--neon)]/10 text-[var(--neon)] hover:bg-[var(--neon)]/20 hover:text-[var(--neon)] sm:w-auto"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
