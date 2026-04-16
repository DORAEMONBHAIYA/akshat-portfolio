'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Save, Loader2, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useAdminStore } from '@/store/admin-store';
import { toast } from 'sonner';

interface ProfileForm {
  name: string;
  title: string;
  tagline: string;
  bio: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  github: string;
  linkedin: string;
  twitter: string;
  resume: string;
  leetcode: string;
  titles: string;
}

const defaultProfile: ProfileForm = {
  name: '',
  title: '',
  tagline: '',
  bio: '',
  email: '',
  phone: '',
  location: '',
  website: '',
  github: '',
  linkedin: '',
  twitter: '',
  resume: '',
  leetcode: '',
  titles: '',
};

export default function ProfileEditor() {
  const token = useAdminStore((s) => s.token);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileForm>({ defaultValues: defaultProfile });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/profile', {
          headers: { Authorization: 'Bearer ' + token },
        });
        if (res.ok) {
          const data = await res.json();
          reset({
            name: data.name || '',
            title: data.title || '',
            tagline: data.tagline || '',
            bio: data.bio || '',
            email: data.email || '',
            phone: data.phone || '',
            location: data.location || '',
            website: data.website || '',
            github: data.github || '',
            linkedin: data.linkedin || '',
            twitter: data.twitter || '',
            resume: data.resume || '',
            leetcode: data.leetcode || '',
            titles: data.titles || '',
          });
        }
      } catch {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token, reset]);

  const onSubmit = async (data: ProfileForm) => {
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to save profile');
      toast.success('Profile saved successfully');
    } catch {
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const formFields = [
    { name: 'name' as const, label: 'Full Name', placeholder: 'John Doe', span: 1 },
    { name: 'title' as const, label: 'Job Title', placeholder: 'Full Stack Developer', span: 1 },
    { name: 'tagline' as const, label: 'Tagline', placeholder: 'Building the future...', span: 2 },
    { name: 'bio' as const, label: 'Bio', placeholder: 'Tell us about yourself...', span: 2, textarea: true },
    { name: 'email' as const, label: 'Email', placeholder: 'john@example.com', type: 'email' },
    { name: 'phone' as const, label: 'Phone', placeholder: '+1 (555) 000-0000' },
    { name: 'location' as const, label: 'Location', placeholder: 'San Francisco, CA' },
    { name: 'website' as const, label: 'Website', placeholder: 'https://yoursite.com', type: 'url' },
    { name: 'github' as const, label: 'GitHub', placeholder: 'https://github.com/username' },
    { name: 'linkedin' as const, label: 'LinkedIn', placeholder: 'https://linkedin.com/in/username' },
    { name: 'twitter' as const, label: 'Twitter / X', placeholder: 'https://x.com/username' },
    { name: 'leetcode' as const, label: 'LeetCode', placeholder: 'https://leetcode.com/u/username', type: 'url' },
    { name: 'resume' as const, label: 'Resume URL', placeholder: 'https://drive.google.com/...' },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4 md:p-6 space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <User className="h-6 w-6 text-neon" />
            Profile
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Edit your personal information
          </p>
        </div>
        <Button
          type="submit"
          disabled={saving}
          className="bg-neon text-background font-semibold hover:bg-neon-dim gap-2"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Profile
        </Button>
      </div>

      <Separator />

      {/* Typing Titles */}
      <Card className="bg-card/50 border-neon/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="text-neon">✦</span>
            Hero Typing Titles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            These titles cycle with a typewriter animation on your hero section. Separate each title with a comma. The animation will type each title, delete it, then type the next one.
          </p>
          <Textarea
            {...register('titles')}
            placeholder="AI/ML Engineer,Full-Stack Developer,Deep Learning Researcher"
            rows={3}
            className="bg-secondary border-border focus-visible:ring-neon/50 focus-visible:border-neon/50 resize-none font-mono text-sm"
          />
          <p className="text-[11px] text-muted-foreground">
            Example: AI/ML Engineer,Full-Stack Developer,Deep Learning Researcher,Prompt Engineer
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border">
        <CardHeader>
          <CardTitle className="text-base">Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {formFields.map((field) => (
              <motion.div
                key={field.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={field.span === 2 ? 'md:col-span-2' : ''}
              >
                <Label className="text-sm text-muted-foreground mb-2 block">{field.label}</Label>
                {field.textarea ? (
                  <Textarea
                    {...register(field.name)}
                    placeholder={field.placeholder}
                    rows={4}
                    className="bg-secondary border-border focus-visible:ring-neon/50 focus-visible:border-neon/50 resize-none"
                  />
                ) : (
                  <Input
                    {...register(field.name)}
                    type={field.type || 'text'}
                    placeholder={field.placeholder}
                    className="bg-secondary border-border focus-visible:ring-neon/50 focus-visible:border-neon/50 h-10"
                  />
                )}
                {errors[field.name] && (
                  <p className="text-destructive text-xs mt-1">{errors[field.name]?.message}</p>
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
