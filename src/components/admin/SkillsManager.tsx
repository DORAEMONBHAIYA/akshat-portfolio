'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import {
  Cpu,
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

interface Skill {
  id: string;
  name: string;
  level: number;
  category: string;
  icon?: string;
}

interface SkillForm {
  name: string;
  level: number;
  category: string;
  icon: string;
}

const defaultCategories = ['Languages', 'AI & ML', 'Frontend', 'Backend', 'Data Science', 'Other'];

const defaultForm: SkillForm = {
  name: '',
  level: 80,
  category: 'Languages',
  icon: '',
};

export default function SkillsManager() {
  const token = useAdminStore((s) => s.token);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [allCategories, setAllCategories] = useState<string[]>(defaultCategories);
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SkillForm>({
    defaultValues: defaultForm,
  });

  const skillLevel = watch('level');
  const skillCategory = watch('category');

  // Watch for custom category selection
  useEffect(() => {
    if (skillCategory === '__custom__') {
      setShowCustomInput(true);
    }
  }, [skillCategory]);

  // Fetch categories from SkillCategory table + existing skills
  const fetchCategories = async () => {
    try {
      const [skillsRes, skillCatsRes] = await Promise.all([
        fetch('/api/skills'),
        fetch('/api/skill-categories'),
      ]);

      const catsSet = new Set<string>(defaultCategories);

      // Add categories from SkillCategory table (admin-managed)
      if (skillCatsRes.ok) {
        const skillCatsData = await skillCatsRes.json();
        const skillCatsArr = Array.isArray(skillCatsData) ? skillCatsData : [];
        skillCatsArr.forEach((c: { name: string }) => catsSet.add(c.name));
      }

      // Add categories from existing skills (in case any aren't in the table yet)
      if (skillsRes.ok) {
        const skillsData = await skillsRes.json();
        const skillsArr = Array.isArray(skillsData) ? skillsData : [];
        skillsArr.forEach((s: Skill) => catsSet.add(s.category));
      }

      setAllCategories(Array.from(catsSet));
    } catch {
      // Keep default categories on error
    }
  };

  const fetchSkills = async () => {
    try {
      const res = await fetch('/api/skills', {
        headers: { Authorization: 'Bearer ' + token },
      });
      if (res.ok) {
        const data = await res.json();
        setSkills(Array.isArray(data) ? data : data.skills || []);
      }
    } catch {
      toast.error('Failed to load skills');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchSkills();
  }, [token]);

  // Re-fetch categories after saving a skill (new category might have been added)
  const fetchSkillsAndCategories = async () => {
    await fetchSkills();
    await fetchCategories();
  };

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Auto-expand all categories that have skills
  useEffect(() => {
    const catsWithSkills = new Set(skills.map((s) => s.category));
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      catsWithSkills.forEach((c) => next.add(c));
      return next;
    });
  }, [skills]);

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const groupedSkills = allCategories
    .map((cat) => ({
      category: cat,
      skills: skills.filter((s) => s.category === cat),
    }))
    .filter((g) => g.skills.length > 0);

  const openCreate = () => {
    setEditingId(null);
    reset(defaultForm);
    setShowCustomInput(false);
    setCustomCategory('');
    setDialogOpen(true);
  };

  const openEdit = (skill: Skill) => {
    setEditingId(skill.id);
    reset({
      name: skill.name,
      level: skill.level,
      category: skill.category,
      icon: skill.icon || '',
    });
    setShowCustomInput(false);
    setCustomCategory('');
    setDialogOpen(true);
  };

  const onSubmit = async (data: SkillForm) => {
    setSaving(true);
    try {
      const url = editingId ? `/api/skills?id=${editingId}` : '/api/skills';
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

      if (!res.ok) throw new Error('Failed to save skill');
      toast.success(editingId ? 'Skill updated' : 'Skill created');
      setDialogOpen(false);
      fetchSkillsAndCategories();
    } catch {
      toast.error('Failed to save skill');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/skills?id=${deleteId}`, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + token },
      });
      if (!res.ok) throw new Error('Failed to delete skill');
      toast.success('Skill deleted');
      setDeleteId(null);
      fetchSkillsAndCategories();
    } catch {
      toast.error('Failed to delete skill');
    }
  };

  const getLevelColor = (level: number) => {
    if (level >= 80) return 'text-neon';
    if (level >= 60) return 'text-cyan';
    if (level >= 40) return 'text-amber-400';
    return 'text-rose-400';
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-lg" />
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
            <Cpu className="h-6 w-6 text-neon" />
            Skills
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your technical skills by category
          </p>
        </div>
        <Button onClick={openCreate} className="bg-neon text-background hover:bg-neon-dim gap-2">
          <Plus className="h-4 w-4" />
          Add Skill
        </Button>
      </div>

      {/* Grouped Skills */}
      {groupedSkills.length === 0 ? (
        <Card className="bg-card/50 border-border">
          <CardContent className="p-12 text-center">
            <Cpu className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-muted-foreground">No skills yet. Add your first skill!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {groupedSkills.map((group) => (
            <motion.div
              key={group.category}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-card/50 border-border overflow-hidden">
                <CardHeader
                  className="cursor-pointer select-none py-4 px-5"
                  onClick={() => toggleCategory(group.category)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {expandedCategories.has(group.category) ? (
                        <ChevronDown className="h-4 w-4 text-neon" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                      <CardTitle className="text-base font-semibold">{group.category}</CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {group.skills.length}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <AnimatePresence>
                  {expandedCategories.has(group.category) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <CardContent className="pt-0 pb-4 px-5 space-y-3">
                        {group.skills.map((skill) => (
                          <div
                            key={skill.id}
                            className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-1.5">
                                <span className="font-medium text-sm">{skill.name}</span>
                                <span className={`text-xs font-mono ${getLevelColor(skill.level)}`}>
                                  {skill.level}%
                                </span>
                              </div>
                              <Progress
                                value={skill.level}
                                className="h-1.5 bg-border"
                              />
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-cyan hover:text-cyan hover:bg-cyan/10"
                                onClick={() => openEdit(skill)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => setDeleteId(skill.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingId ? 'Edit Skill' : 'New Skill'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Skill Name</Label>
              <Input
                {...register('name', { required: 'Name is required' })}
                placeholder="React"
                className="bg-secondary border-border focus-visible:ring-neon/50"
              />
              {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Category</Label>
              <Select
                value={skillCategory}
                onValueChange={(val) => { setValue('category', val); setShowCustomInput(false); }}
              >
                <SelectTrigger className="bg-secondary border-border focus:ring-neon/50">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {allCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                  <SelectItem value="__custom__" className="text-neon">
                    + Add Custom Category...
                  </SelectItem>
                </SelectContent>
              </Select>
              {showCustomInput && (
                <Input
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  onBlur={() => {
                    if (customCategory.trim()) {
                      setValue('category', customCategory.trim());
                      if (!allCategories.includes(customCategory.trim())) {
                        setAllCategories((prev) => [...prev, customCategory.trim()]);
                      }
                    }
                    setShowCustomInput(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (customCategory.trim()) {
                        setValue('category', customCategory.trim());
                        if (!allCategories.includes(customCategory.trim())) {
                          setAllCategories((prev) => [...prev, customCategory.trim()]);
                        }
                      }
                      setShowCustomInput(false);
                    }
                  }}
                  placeholder="Type category name..."
                  className="bg-secondary border-border focus-visible:ring-neon/50 mt-2"
                  autoFocus
                />
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-muted-foreground">Skill Level</Label>
                <span className="text-sm font-mono text-neon">{skillLevel}%</span>
              </div>
              <Slider
                value={[skillLevel]}
                onValueChange={([val]) => setValue('level', val)}
                min={0}
                max={100}
                step={5}
                className="py-2"
              />
              <Progress value={skillLevel} className="h-2 bg-border" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Icon (optional)</Label>
              <Input
                {...register('icon')}
                placeholder="react or icon name"
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
            <AlertDialogTitle>Delete Skill</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this skill? This action cannot be undone.
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
