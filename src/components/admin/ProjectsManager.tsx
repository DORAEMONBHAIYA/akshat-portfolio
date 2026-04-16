'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import {
  FolderKanban,
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Github,
  Star,
  Loader2,
  Search,
  Tag,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAdminStore } from '@/store/admin-store';
import { toast } from 'sonner';

interface Project {
  id: string;
  title: string;
  description: string;
  longDesc?: string;
  techStack?: string;
  github?: string;
  liveUrl?: string;
  featured: boolean;
  categoryId?: string | null;
  category?: { id: string; name: string; slug: string } | null;
  createdAt: string;
  updatedAt: string;
}

interface ProjectCategory {
  id: string;
  name: string;
  slug: string;
}

interface ProjectForm {
  title: string;
  description: string;
  longDesc: string;
  techStack: string;
  github: string;
  liveUrl: string;
  featured: boolean;
  categoryId: string;
}

const defaultForm: ProjectForm = {
  title: '',
  description: '',
  longDesc: '',
  techStack: '',
  github: '',
  liveUrl: '',
  featured: false,
  categoryId: '',
};

export default function ProjectsManager() {
  const token = useAdminStore((s) => s.token);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [projectCategories, setProjectCategories] = useState<ProjectCategory[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProjectForm>({ defaultValues: defaultForm });

  const featured = watch('featured');

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects', {
        headers: { Authorization: 'Bearer ' + token },
      });
      if (res.ok) {
        const data = await res.json();
        setProjects(Array.isArray(data) ? data : data.projects || []);
      }
    } catch {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [token]);

  useEffect(() => {
    fetch('/api/project-categories')
      .then((r) => r.ok ? r.json() : [])
      .then(setProjectCategories)
      .catch(() => {});
  }, [token]);

  const openCreate = () => {
    setEditingId(null);
    reset(defaultForm);
    setDialogOpen(true);
  };

  const openEdit = (project: Project) => {
    setEditingId(project.id);
    reset({
      title: project.title,
      description: project.description,
      longDesc: project.longDesc || '',
      techStack: project.techStack || '',
      github: project.github || '',
      liveUrl: project.liveUrl || '',
      featured: project.featured,
      categoryId: project.categoryId || '',
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data: ProjectForm) => {
    setSaving(true);
    try {
      const url = editingId ? `/api/projects?id=${editingId}` : '/api/projects';
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

      if (!res.ok) throw new Error('Failed to save project');
      toast.success(editingId ? 'Project updated' : 'Project created');
      setDialogOpen(false);
      fetchProjects();
    } catch {
      toast.error('Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/projects?id=${deleteId}`, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + token },
      });
      if (!res.ok) throw new Error('Failed to delete project');
      toast.success('Project deleted');
      setDeleteId(null);
      fetchProjects();
    } catch {
      toast.error('Failed to delete project');
    }
  };

  const filtered = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full max-w-sm" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
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
            <FolderKanban className="h-6 w-6 text-cyan" />
            Projects
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your portfolio projects
          </p>
        </div>
        <Button onClick={openCreate} className="bg-neon text-background hover:bg-neon-dim gap-2">
          <Plus className="h-4 w-4" />
          Add Project
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-secondary border-border focus-visible:ring-neon/50"
        />
      </div>

      {/* Projects List */}
      {filtered.length === 0 ? (
        <Card className="bg-card/50 border-border">
          <CardContent className="p-12 text-center">
            <FolderKanban className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              {search ? 'No projects match your search' : 'No projects yet. Create your first one!'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block">
            <Card className="bg-card/50 border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Title</TableHead>
                    <TableHead className="text-muted-foreground">Description</TableHead>
                    <TableHead className="text-muted-foreground">Tech Stack</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((project, index) => (
                    <motion.tr
                      key={project.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className="border-border hover:bg-secondary/50"
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {project.title}
                          {project.featured && (
                            <Badge variant="outline" className="bg-amber-400/10 text-amber-400 border-amber-400/20 text-[10px] px-1.5 py-0">
                              <Star className="h-2.5 w-2.5 mr-0.5" /> Featured
                            </Badge>
                          )}
                          {project.category && (
                            <Badge variant="outline" className="bg-cyan/10 text-cyan border-cyan/20 text-[10px] px-1.5 py-0">
                              <Tag className="h-2.5 w-2.5 mr-0.5" /> {project.category.name}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate">
                        {project.description}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {(project.techStack || '').split(',').filter(Boolean).slice(0, 3).map((tech) => (
                            <Badge key={tech} variant="secondary" className="text-[10px] px-1.5 py-0">
                              {tech.trim()}
                            </Badge>
                          ))}
                          {(project.techStack || '').split(',').filter(Boolean).length > 3 && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              +{(project.techStack || '').split(',').filter(Boolean).length - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            project.featured
                              ? 'bg-neon/10 text-neon border-neon/20 text-[10px]'
                              : 'bg-secondary text-muted-foreground text-[10px]'
                          }
                        >
                          {project.featured ? 'Featured' : 'Standard'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {project.github && (
                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                              <a href={project.github} target="_blank" rel="noopener noreferrer">
                                <Github className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                          {project.liveUrl && (
                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-cyan hover:text-cyan hover:bg-cyan/10"
                            onClick={() => openEdit(project)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteId(project.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="bg-card/50 border-border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium">{project.title}</h3>
                          {project.featured && (
                            <Badge variant="outline" className="bg-amber-400/10 text-amber-400 border-amber-400/20 text-[10px] px-1.5 py-0">
                              <Star className="h-2.5 w-2.5 mr-0.5" /> Featured
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {project.description}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {(project.techStack || '').split(',').filter(Boolean).slice(0, 4).map((tech) => (
                            <Badge key={tech} variant="secondary" className="text-[10px] px-1.5 py-0">
                              {tech.trim()}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-cyan"
                          onClick={() => openEdit(project)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => setDeleteId(project.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingId ? 'Edit Project' : 'New Project'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Title</Label>
              <Input
                {...register('title', { required: 'Title is required' })}
                placeholder="My Awesome Project"
                className="bg-secondary border-border focus-visible:ring-neon/50"
              />
              {errors.title && <p className="text-destructive text-xs">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Description</Label>
              <Textarea
                {...register('description', { required: 'Description is required' })}
                placeholder="Short description of the project"
                rows={2}
                className="bg-secondary border-border focus-visible:ring-neon/50 resize-none"
              />
              {errors.description && <p className="text-destructive text-xs">{errors.description.message}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Detailed Description</Label>
              <Textarea
                {...register('longDesc')}
                placeholder="Full project description, features, etc."
                rows={4}
                className="bg-secondary border-border focus-visible:ring-neon/50 resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Tech Stack (comma separated)</Label>
              <Input
                {...register('techStack')}
                placeholder="React, Next.js, TypeScript, Tailwind"
                className="bg-secondary border-border focus-visible:ring-neon/50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">GitHub URL</Label>
                <Input
                  {...register('github')}
                  placeholder="https://github.com/..."
                  className="bg-secondary border-border focus-visible:ring-neon/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Live URL</Label>
                <Input
                  {...register('liveUrl')}
                  placeholder="https://..."
                  className="bg-secondary border-border focus-visible:ring-neon/50"
                />
              </div>
            </div>

            {projectCategories.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Category</Label>
                <Select
                  value={watch('categoryId')}
                  onValueChange={(val) => setValue('categoryId', val)}
                >
                  <SelectTrigger className="bg-secondary border-border focus-visible:ring-neon/50">
                    <SelectValue placeholder="No category" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="none">
                      <span className="text-muted-foreground">No category</span>
                    </SelectItem>
                    {projectCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center justify-between py-2">
              <Label className="text-sm text-muted-foreground">Featured Project</Label>
              <Switch
                checked={featured}
                onCheckedChange={(checked) => setValue('featured', checked)}
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
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this project? This action cannot be undone.
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
