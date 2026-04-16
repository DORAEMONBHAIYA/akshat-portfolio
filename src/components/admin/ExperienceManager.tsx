'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import {
  Briefcase,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  MapPin,
  Loader2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAdminStore } from '@/store/admin-store';
import { toast } from 'sonner';

interface Experience {
  id: string;
  company: string;
  role: string;
  description?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  techStack?: string;
  createdAt: string;
}

interface ExperienceForm {
  company: string;
  role: string;
  description: string;
  startDate: string;
  endDate: string;
  current: boolean;
  techStack: string;
}

const defaultForm: ExperienceForm = {
  company: '',
  role: '',
  description: '',
  startDate: '',
  endDate: '',
  current: false,
  techStack: '',
};

export default function ExperienceManager() {
  const token = useAdminStore((s) => s.token);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ExperienceForm>({ defaultValues: defaultForm });

  const isCurrent = watch('current');

  const fetchExperiences = async () => {
    try {
      const res = await fetch('/api/experience', {
        headers: { Authorization: 'Bearer ' + token },
      });
      if (res.ok) {
        const data = await res.json();
        setExperiences(Array.isArray(data) ? data : data.experiences || []);
      }
    } catch {
      toast.error('Failed to load experience');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences();
  }, [token]);

  const openCreate = () => {
    setEditingId(null);
    reset(defaultForm);
    setDialogOpen(true);
  };

  const openEdit = (exp: Experience) => {
    setEditingId(exp.id);
    reset({
      company: exp.company,
      role: exp.role,
      description: exp.description || '',
      startDate: exp.startDate || '',
      endDate: exp.endDate || '',
      current: exp.current,
      techStack: exp.techStack || '',
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data: ExperienceForm) => {
    setSaving(true);
    try {
      const url = editingId ? `/api/experience?id=${editingId}` : '/api/experience';
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId ? { ...data, id: editingId } : data;

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error('Failed to save experience');
      toast.success(editingId ? 'Experience updated' : 'Experience created');
      setDialogOpen(false);
      fetchExperiences();
    } catch {
      toast.error('Failed to save experience');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/experience?id=${deleteId}`, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + token },
      });
      if (!res.ok) throw new Error('Failed to delete experience');
      toast.success('Experience deleted');
      setDeleteId(null);
      fetchExperiences();
    } catch {
      toast.error('Failed to delete experience');
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Present';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-amber-400" />
            Experience
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your work experience timeline
          </p>
        </div>
        <Button onClick={openCreate} className="bg-neon text-background hover:bg-neon-dim gap-2">
          <Plus className="h-4 w-4" />
          Add Experience
        </Button>
      </div>

      {/* Timeline */}
      {experiences.length === 0 ? (
        <Card className="bg-card/50 border-border">
          <CardContent className="p-12 text-center">
            <Briefcase className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-muted-foreground">No experience entries yet. Add your work history!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-border hidden md:block" />

          <div className="space-y-4">
            {experiences.map((exp, index) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative md:pl-14"
              >
                {/* Timeline dot */}
                <div className="hidden md:flex absolute left-3 top-5 h-4 w-4 rounded-full border-2 border-neon bg-background items-center justify-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-neon" />
                </div>

                <Card className="bg-card/50 border-border hover:border-neon/20 transition-colors group">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-foreground">{exp.role}</h3>
                          {exp.current && (
                            <Badge className="bg-neon/10 text-neon border-neon/20 text-[10px] px-1.5 py-0">
                              Current
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground text-sm mt-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {exp.company}
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground text-xs mt-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(exp.startDate)} — {exp.current ? 'Present' : formatDate(exp.endDate || '')}
                        </div>
                        {exp.description && (
                          <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{exp.description}</p>
                        )}
                        {exp.techStack && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {exp.techStack.split(',').filter(Boolean).map((tech) => (
                              <Badge key={tech} variant="secondary" className="text-[10px] px-1.5 py-0">
                                {tech.trim()}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-cyan hover:text-cyan hover:bg-cyan/10"
                          onClick={() => openEdit(exp)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteId(exp.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingId ? 'Edit Experience' : 'New Experience'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Company</Label>
              <Input
                {...register('company', { required: 'Company is required' })}
                placeholder="Google"
                className="bg-secondary border-border focus-visible:ring-neon/50"
              />
              {errors.company && <p className="text-destructive text-xs">{errors.company.message}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Role / Position</Label>
              <Input
                {...register('role', { required: 'Role is required' })}
                placeholder="Senior Software Engineer"
                className="bg-secondary border-border focus-visible:ring-neon/50"
              />
              {errors.role && <p className="text-destructive text-xs">{errors.role.message}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Description</Label>
              <Textarea
                {...register('description')}
                placeholder="Describe your responsibilities and achievements"
                rows={3}
                className="bg-secondary border-border focus-visible:ring-neon/50 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Start Date</Label>
                <Input
                  {...register('startDate', { required: 'Start date is required' })}
                  type="month"
                  className="bg-secondary border-border focus-visible:ring-neon/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">End Date</Label>
                <Input
                  {...register('endDate')}
                  type="month"
                  disabled={isCurrent}
                  className="bg-secondary border-border focus-visible:ring-neon/50 disabled:opacity-50"
                />
              </div>
            </div>

            <div className="flex items-center justify-between py-1">
              <Label className="text-sm text-muted-foreground">Currently working here</Label>
              <Switch
                checked={isCurrent}
                onCheckedChange={(checked) => setValue('current', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Tech Stack (comma separated)</Label>
              <Input
                {...register('techStack')}
                placeholder="React, Node.js, PostgreSQL"
                className="bg-secondary border-border focus-visible:ring-neon/50"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="bg-neon text-background hover:bg-neon-dim gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {editingId ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Experience</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this experience entry? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
