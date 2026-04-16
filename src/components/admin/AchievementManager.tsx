'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import {
  Trophy,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Loader2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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

interface Achievement {
  id: string;
  title: string;
  description?: string;
  date?: string;
  techStack?: string;
  order?: number;
  createdAt: string;
}

interface AchievementForm {
  title: string;
  description: string;
  date: string;
  techStack: string;
  order: number;
}

const defaultForm: AchievementForm = {
  title: '',
  description: '',
  date: '',
  techStack: '',
  order: 0,
};

export default function AchievementManager() {
  const token = useAdminStore((s) => s.token);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AchievementForm>({ defaultValues: defaultForm });

  const fetchAchievements = async () => {
    try {
      const res = await fetch('/api/achievements', {
        headers: { Authorization: 'Bearer ' + token },
      });
      if (res.ok) {
        const data = await res.json();
        setAchievements(Array.isArray(data) ? data : data.achievements || []);
      }
    } catch {
      toast.error('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, [token]);

  const openCreate = () => {
    setEditingId(null);
    reset(defaultForm);
    setDialogOpen(true);
  };

  const openEdit = (ach: Achievement) => {
    setEditingId(ach.id);
    reset({
      title: ach.title,
      description: ach.description || '',
      date: ach.date || '',
      techStack: ach.techStack || '',
      order: ach.order || 0,
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data: AchievementForm) => {
    setSaving(true);
    try {
      const url = editingId ? `/api/achievements?id=${editingId}` : '/api/achievements';
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

      if (!res.ok) throw new Error('Failed to save achievement');
      toast.success(editingId ? 'Achievement updated' : 'Achievement created');
      setDialogOpen(false);
      fetchAchievements();
    } catch {
      toast.error('Failed to save achievement');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/achievements?id=${deleteId}`, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + token },
      });
      if (!res.ok) throw new Error('Failed to delete achievement');
      toast.success('Achievement deleted');
      setDeleteId(null);
      fetchAchievements();
    } catch {
      toast.error('Failed to delete achievement');
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
            <Trophy className="h-6 w-6 text-amber-400" />
            Achievements
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your awards and accomplishments
          </p>
        </div>
        <Button onClick={openCreate} className="bg-neon text-background hover:bg-neon-dim gap-2">
          <Plus className="h-4 w-4" />
          Add Achievement
        </Button>
      </div>

      {/* Grid of achievements */}
      {achievements.length === 0 ? (
        <Card className="bg-card/50 border-border">
          <CardContent className="p-12 text-center">
            <Trophy className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-muted-foreground">No achievements yet. Add your awards and accomplishments!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {achievements.map((ach, index) => (
            <motion.div
              key={ach.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="bg-card/50 border-border hover:border-neon/20 transition-colors group">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground">{ach.title}</h3>
                      {ach.date && (
                        <div className="flex items-center gap-1.5 text-muted-foreground text-xs mt-1">
                          <Calendar className="h-3 w-3" />
                          {ach.date}
                        </div>
                      )}
                      {ach.description && (
                        <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{ach.description}</p>
                      )}
                      {ach.techStack && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {ach.techStack.split(',').filter(Boolean).map((tech) => (
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
                        onClick={() => openEdit(ach)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteId(ach.id)}
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
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingId ? 'Edit Achievement' : 'New Achievement'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Title</Label>
              <Input
                {...register('title', { required: 'Title is required' })}
                placeholder="Best Paper Award at ICML"
                className="bg-secondary border-border focus-visible:ring-neon/50"
              />
              {errors.title && <p className="text-destructive text-xs">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Description</Label>
              <Textarea
                {...register('description')}
                placeholder="Describe the achievement (use new lines for bullet points)"
                rows={3}
                className="bg-secondary border-border focus-visible:ring-neon/50 resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Date</Label>
              <Input
                {...register('date')}
                type="text"
                placeholder="January 2024"
                className="bg-secondary border-border focus-visible:ring-neon/50"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Tech Stack (comma separated)</Label>
              <Input
                {...register('techStack')}
                placeholder="PyTorch, TensorFlow, NLP"
                className="bg-secondary border-border focus-visible:ring-neon/50"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Display Order</Label>
              <Input
                {...register('order', { valueAsNumber: true })}
                type="number"
                placeholder="0"
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
            <AlertDialogTitle>Delete Achievement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this achievement? This action cannot be undone.
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
