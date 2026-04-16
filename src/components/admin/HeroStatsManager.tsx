'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import {
  BarChart3,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  GripVertical,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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

interface HeroStat {
  id: string;
  label: string;
  value: string;
  icon: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface StatForm {
  label: string;
  value: string;
  icon: string;
  order: number;
  visible: boolean;
}

const defaultForm: StatForm = {
  label: '',
  value: '',
  icon: '',
  order: 0,
  visible: true,
};

export default function HeroStatsManager() {
  const token = useAdminStore((s) => s.token);
  const [stats, setStats] = useState<HeroStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [hiddenStats, setHiddenStats] = useState<Set<string>>(new Set());

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<StatForm>({
    defaultValues: defaultForm,
  });

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/hero-stats');
      if (res.ok) {
        const data = await res.json();
        setStats(Array.isArray(data) ? data : []);
      }
    } catch {
      toast.error('Failed to load hero stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Load hidden state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('hidden_hero_stats');
      if (saved) {
        setHiddenStats(new Set(JSON.parse(saved)));
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleVisibility = (id: string) => {
    setHiddenStats((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem('hidden_hero_stats', JSON.stringify([...next]));
      return next;
    });
  };

  const openCreate = () => {
    setEditingId(null);
    reset({ ...defaultForm, order: stats.length });
    setDialogOpen(true);
  };

  const openEdit = (stat: HeroStat) => {
    setEditingId(stat.id);
    reset({
      label: stat.label,
      value: stat.value,
      icon: stat.icon || '',
      order: stat.order ?? 0,
      visible: !hiddenStats.has(stat.id),
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data: StatForm) => {
    setSaving(true);
    try {
      const url = editingId ? `/api/hero-stats?id=${editingId}` : '/api/hero-stats';
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

      if (!res.ok) throw new Error('Failed to save stat');
      toast.success(editingId ? 'Stat updated' : 'Stat created');
      setDialogOpen(false);

      // Update visibility
      if (editingId) {
        if (!data.visible) {
          setHiddenStats((prev) => {
            const next = new Set(prev);
            next.add(editingId);
            localStorage.setItem('hidden_hero_stats', JSON.stringify([...next]));
            return next;
          });
        } else {
          setHiddenStats((prev) => {
            const next = new Set(prev);
            next.delete(editingId);
            localStorage.setItem('hidden_hero_stats', JSON.stringify([...next]));
            return next;
          });
        }
      }

      fetchStats();
    } catch {
      toast.error('Failed to save stat');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/hero-stats?id=${deleteId}`, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + token },
      });
      if (!res.ok) throw new Error('Failed to delete stat');
      toast.success('Stat deleted');
      setDeleteId(null);
      fetchStats();
    } catch {
      toast.error('Failed to delete stat');
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const visibleStats = stats.filter((s) => !hiddenStats.has(s.id));
  const hiddenCount = stats.length - visibleStats.length;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-neon" />
            Hero Stats
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Manage the stats shown in your hero section
          </p>
        </div>
        <Button onClick={openCreate} className="bg-neon text-background hover:bg-neon-dim gap-2">
          <Plus className="h-4 w-4" />
          Add Stat
        </Button>
      </div>

      {/* Info banner */}
      <Card className="bg-neon/5 border-neon/20">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            <span className="text-neon font-medium">Tip:</span> Leave both label and value blank to hide a stat from the portfolio. You can also toggle visibility with the eye icon. Use custom labels like &quot;Achievements&quot;, &quot;Certifications&quot;, etc.
          </p>
          {hiddenCount > 0 && (
            <p className="text-xs text-amber-400 mt-2">
              {hiddenCount} stat{hiddenCount > 1 ? 's are' : ' is'} currently hidden on the portfolio.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Stats List */}
      {stats.length === 0 ? (
        <Card className="bg-card/50 border-border">
          <CardContent className="p-12 text-center">
            <BarChart3 className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-muted-foreground">No stats yet. Add your first hero stat!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {stats.map((stat, index) => {
            const isHidden = hiddenStats.has(stat.id);
            const isEmpty = !stat.label.trim() && !stat.value.trim();
            return (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <Card className={`bg-card/50 border transition-colors ${
                  isHidden
                    ? 'border-amber-400/20 opacity-50'
                    : isEmpty
                    ? 'border-destructive/20 opacity-40'
                    : 'border-border hover:border-border/80'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Drag handle + order */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <GripVertical className="h-4 w-4 text-muted-foreground/40" />
                        <span className="text-xs font-mono text-muted-foreground/50 w-5 text-center">
                          {index + 1}
                        </span>
                      </div>

                      {/* Preview card */}
                      <div className="flex-1 min-w-0">
                        <div className={`flex items-center gap-3 rounded-lg border p-3 ${
                          isHidden
                            ? 'border-amber-400/10 bg-amber-400/5'
                            : 'border-border bg-secondary/50'
                        }`}>
                          <div className="text-xl font-bold text-neon whitespace-nowrap">
                            {stat.value || '—'}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {stat.label || 'Untitled'}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          {stat.icon && (
                            <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0">
                              icon: {stat.icon}
                            </Badge>
                          )}
                          {isHidden && (
                            <Badge variant="outline" className="text-[10px] text-amber-400 border-amber-400/20 px-1.5 py-0">
                              Hidden
                            </Badge>
                          )}
                          {isEmpty && (
                            <Badge variant="outline" className="text-[10px] text-destructive border-destructive/20 px-1.5 py-0">
                              Empty — will be hidden
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-8 w-8 ${
                            isHidden
                              ? 'text-amber-400 hover:text-amber-400 hover:bg-amber-400/10'
                              : 'text-cyan hover:text-cyan hover:bg-cyan/10'
                          }`}
                          onClick={() => toggleVisibility(stat.id)}
                          title={isHidden ? 'Show on portfolio' : 'Hide from portfolio'}
                        >
                          {isHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-cyan hover:text-cyan hover:bg-cyan/10"
                          onClick={() => openEdit(stat)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteId(stat.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingId ? 'Edit Hero Stat' : 'New Hero Stat'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Label (heading name)</Label>
              <Input
                {...register('label')}
                placeholder="e.g. Years Experience, Projects, Achievements"
                className="bg-secondary border-border focus-visible:ring-neon/50"
              />
              <p className="text-[11px] text-muted-foreground">This is the text below the number. Leave blank to hide.</p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Value (the number/text)</Label>
              <Input
                {...register('value')}
                placeholder="e.g. 3+, 6+, 100+, Top 10%"
                className="bg-secondary border-border focus-visible:ring-neon/50"
              />
              <p className="text-[11px] text-muted-foreground">The big number shown on the hero. Leave blank to hide.</p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Icon name (optional)</Label>
              <Input
                {...register('icon')}
                placeholder="e.g. briefcase, folder, trophy, star"
                className="bg-secondary border-border focus-visible:ring-neon/50"
              />
              <p className="text-[11px] text-muted-foreground">Lucide icon name for future use. Current icons: briefcase, folder, cpu, book.</p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Display Order</Label>
              <Input
                {...register('order', { valueAsNumber: true })}
                type="number"
                min={0}
                className="bg-secondary border-border focus-visible:ring-neon/50"
              />
              <p className="text-[11px] text-muted-foreground">Lower numbers appear first on the portfolio.</p>
            </div>

            {editingId && (
              <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/50 border border-border">
                <div>
                  <Label className="text-sm text-foreground">Visible on Portfolio</Label>
                  <p className="text-[11px] text-muted-foreground">Toggle to show/hide on the hero section</p>
                </div>
                <Switch
                  checked={watch('visible')}
                  onCheckedChange={(val) => setValue('visible', val)}
                />
              </div>
            )}

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
            <AlertDialogTitle>Delete Hero Stat</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this stat? This action cannot be undone.
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
