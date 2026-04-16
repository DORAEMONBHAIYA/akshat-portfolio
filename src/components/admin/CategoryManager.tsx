'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import {
  Tag,
  Cpu,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  FolderOpen,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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

interface ProjectCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  order: number;
  _count?: { projects: number };
}

interface SkillCategory {
  id: string;
  name: string;
  order: number;
}

interface CategoryForm {
  name: string;
  description: string;
  order: number;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function CategoryManager() {
  const token = useAdminStore((s) => s.token);
  const [projectCategories, setProjectCategories] = useState<ProjectCategory[]>([]);
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('skill-categories');

  // Project category dialog state
  const [projDialogOpen, setProjDialogOpen] = useState(false);
  const [projEditId, setProjEditId] = useState<string | null>(null);
  const [projDeleteId, setProjDeleteId] = useState<string | null>(null);
  const [projSaving, setProjSaving] = useState(false);

  // Skill category dialog state
  const [skillDialogOpen, setSkillDialogOpen] = useState(false);
  const [skillEditId, setSkillEditId] = useState<string | null>(null);
  const [skillDeleteId, setSkillDeleteId] = useState<string | null>(null);
  const [skillSaving, setSkillSaving] = useState(false);

  const projForm = useForm<CategoryForm>({
    defaultValues: { name: '', description: '', order: 0 },
  });
  const skillForm = useForm<{ name: string; order: number }>({
    defaultValues: { name: '', order: 0 },
  });

  // Fetch all categories
  const fetchAll = async () => {
    try {
      const [projRes, skillRes] = await Promise.all([
        fetch('/api/project-categories'),
        fetch('/api/skill-categories'),
      ]);
      if (projRes.ok) {
        const data = await projRes.json();
        setProjectCategories(Array.isArray(data) ? data : []);
      }
      if (skillRes.ok) {
        const data = await skillRes.json();
        setSkillCategories(Array.isArray(data) ? data : []);
      }
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // === Project Category Handlers ===
  const openProjCreate = () => {
    setProjEditId(null);
    projForm.reset({ name: '', description: '', order: projectCategories.length });
    setProjDialogOpen(true);
  };

  const openProjEdit = (cat: ProjectCategory) => {
    setProjEditId(cat.id);
    projForm.reset({
      name: cat.name,
      description: cat.description || '',
      order: cat.order ?? 0,
    });
    setProjDialogOpen(true);
  };

  const onProjSubmit = async (data: CategoryForm) => {
    setProjSaving(true);
    try {
      const url = '/api/project-categories';
      const method = projEditId ? 'PUT' : 'POST';
      const body = projEditId
        ? { id: projEditId, ...data, slug: generateSlug(data.name) }
        : { ...data, slug: generateSlug(data.name) };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error('Failed');
      toast.success(projEditId ? 'Project category updated' : 'Project category created');
      setProjDialogOpen(false);
      fetchAll();
    } catch {
      toast.error('Failed to save project category');
    } finally {
      setProjSaving(false);
    }
  };

  const handleProjDelete = async () => {
    if (!projDeleteId) return;
    try {
      const res = await fetch(`/api/project-categories?id=${projDeleteId}`, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + token },
      });
      if (!res.ok) throw new Error('Failed');
      toast.success('Project category deleted');
      setProjDeleteId(null);
      fetchAll();
    } catch {
      toast.error('Failed to delete project category');
    }
  };

  // === Skill Category Handlers ===
  const openSkillCreate = () => {
    setSkillEditId(null);
    skillForm.reset({ name: '', order: skillCategories.length });
    setSkillDialogOpen(true);
  };

  const openSkillEdit = (cat: SkillCategory) => {
    setSkillEditId(cat.id);
    skillForm.reset({ name: cat.name, order: cat.order ?? 0 });
    setSkillDialogOpen(true);
  };

  const onSkillSubmit = async (data: { name: string; order: number }) => {
    setSkillSaving(true);
    try {
      const url = '/api/skill-categories';
      const method = skillEditId ? 'PUT' : 'POST';
      const body = skillEditId ? { id: skillEditId, ...data } : data;

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed');
      }
      toast.success(skillEditId ? 'Skill category updated' : 'Skill category created');
      setSkillDialogOpen(false);
      fetchAll();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save skill category';
      toast.error(msg);
    } finally {
      setSkillSaving(false);
    }
  };

  const handleSkillDelete = async () => {
    if (!skillDeleteId) return;
    try {
      const res = await fetch(`/api/skill-categories?id=${skillDeleteId}`, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + token },
      });
      if (!res.ok) throw new Error('Failed');
      toast.success('Skill category deleted');
      setSkillDeleteId(null);
      fetchAll();
    } catch {
      toast.error('Failed to delete skill category');
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Tag className="h-6 w-6 text-amber-400" />
          Categories
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Manage skill and project categories
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-card/50 border border-border">
          <TabsTrigger
            value="skill-categories"
            className="data-[state=active]:bg-neon/15 data-[state=active]:text-neon text-muted-foreground text-sm gap-1.5"
          >
            <Cpu className="h-3.5 w-3.5" />
            Skill Categories
            <Badge variant="secondary" className="text-[10px] ml-1">{skillCategories.length}</Badge>
          </TabsTrigger>
          <TabsTrigger
            value="project-categories"
            className="data-[state=active]:bg-neon/15 data-[state=active]:text-neon text-muted-foreground text-sm gap-1.5"
          >
            <FolderOpen className="h-3.5 w-3.5" />
            Project Categories
            <Badge variant="secondary" className="text-[10px] ml-1">{projectCategories.length}</Badge>
          </TabsTrigger>
        </TabsList>

        {/* Skill Categories Tab */}
        <TabsContent value="skill-categories">
          <div className="flex justify-end mt-4">
            <Button onClick={openSkillCreate} className="bg-neon text-background hover:bg-neon-dim gap-2">
              <Plus className="h-4 w-4" />
              New Skill Category
            </Button>
          </div>

          {skillCategories.length === 0 ? (
            <Card className="bg-card/50 border-border mt-4">
              <CardContent className="p-6 text-center">
                <Cpu className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-muted-foreground text-sm">
                  No skill categories yet. Create categories like &quot;AI & ML&quot;, &quot;Frontend&quot;, &quot;Database&quot; to organize your skills.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2 mt-4">
              {skillCategories.map((cat, index) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Card className="bg-card/50 border-border hover:border-border/80 transition-colors">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neon/10 border border-neon/20 flex-shrink-0">
                          <Cpu className="h-4 w-4 text-neon" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm">{cat.name}</h3>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-cyan hover:text-cyan hover:bg-cyan/10"
                          onClick={() => openSkillEdit(cat)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setSkillDeleteId(cat.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Project Categories Tab */}
        <TabsContent value="project-categories">
          <div className="flex justify-end mt-4">
            <Button onClick={openProjCreate} className="bg-neon text-background hover:bg-neon-dim gap-2">
              <Plus className="h-4 w-4" />
              New Project Category
            </Button>
          </div>

          {projectCategories.length === 0 ? (
            <Card className="bg-card/50 border-border mt-4">
              <CardContent className="p-6 text-center">
                <FolderOpen className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-muted-foreground text-sm">
                  No project categories yet. Create categories like &quot;AI/ML&quot;, &quot;Web Dev&quot;, &quot;Tools&quot; to organize your projects.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2 mt-4">
              {projectCategories.map((cat, index) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Card className="bg-card/50 border-border hover:border-border/80 transition-colors">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-400/10 border border-amber-400/20 flex-shrink-0">
                          <Tag className="h-4 w-4 text-amber-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-medium text-sm">{cat.name}</h3>
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-mono">
                              {cat.slug}
                            </Badge>
                          </div>
                          {cat.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">{cat.description}</p>
                          )}
                        </div>
                        <Badge variant="outline" className="text-[10px] flex-shrink-0">
                          {cat._count?.projects || 0} projects
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-cyan hover:text-cyan hover:bg-cyan/10"
                          onClick={() => openProjEdit(cat)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setProjDeleteId(cat.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Skill Category Create/Edit Dialog */}
      <Dialog open={skillDialogOpen} onOpenChange={setSkillDialogOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {skillEditId ? 'Edit Skill Category' : 'New Skill Category'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={skillForm.handleSubmit(onSkillSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Category Name</Label>
              <Input
                {...skillForm.register('name', { required: 'Name is required' })}
                placeholder="e.g. AI & ML, Frontend, Database"
                className="bg-secondary border-border focus-visible:ring-neon/50"
              />
              {skillForm.formState.errors.name && (
                <p className="text-destructive text-xs">{skillForm.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Display Order</Label>
              <Input
                {...skillForm.register('order', { valueAsNumber: true })}
                type="number"
                min={0}
                className="bg-secondary border-border focus-visible:ring-neon/50"
              />
              <p className="text-[11px] text-muted-foreground">Lower numbers appear first on the portfolio.</p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSkillDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={skillSaving} className="bg-neon text-background hover:bg-neon-dim gap-2">
                {skillSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {skillEditId ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Skill Category Delete Confirmation */}
      <AlertDialog open={!!skillDeleteId} onOpenChange={() => setSkillDeleteId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Skill Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? Skills in this category will keep their category label but the category will be removed from the list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSkillDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Project Category Create/Edit Dialog */}
      <Dialog open={projDialogOpen} onOpenChange={setProjDialogOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {projEditId ? 'Edit Project Category' : 'New Project Category'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={projForm.handleSubmit(onProjSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Category Name</Label>
              <Input
                {...projForm.register('name', { required: 'Name is required' })}
                placeholder="e.g. AI/ML, Web Dev, Tools"
                className="bg-secondary border-border focus-visible:ring-neon/50"
              />
              {projForm.formState.errors.name && (
                <p className="text-destructive text-xs">{projForm.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Description (optional)</Label>
              <Textarea
                {...projForm.register('description')}
                placeholder="Short description..."
                rows={2}
                className="bg-secondary border-border focus-visible:ring-neon/50 resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Display Order</Label>
              <Input
                {...projForm.register('order', { valueAsNumber: true })}
                type="number"
                min={0}
                className="bg-secondary border-border focus-visible:ring-neon/50"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setProjDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={projSaving} className="bg-neon text-background hover:bg-neon-dim gap-2">
                {projSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {projEditId ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Project Category Delete Confirmation */}
      <AlertDialog open={!!projDeleteId} onOpenChange={() => setProjDeleteId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? Projects in this category will become uncategorized.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleProjDelete}
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
