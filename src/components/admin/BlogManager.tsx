"use client";

import MarkdownEditor from "@/components/ui/markdown-editor";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import {
  FileText,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Calendar,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAdminStore } from "@/store/admin-store";
import { toast } from "sonner";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  tags?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BlogForm {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  tags: string;
  published: boolean;
  createdAt: string;
}

const defaultForm: BlogForm = {
  title: "",
  slug: "",
  content: "",
  excerpt: "",
  tags: "",
  published: false,
  createdAt: "",
};

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function BlogManager() {
  const token = useAdminStore((s) => s.token);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BlogForm>({ defaultValues: defaultForm });

  const title = watch("title");

  // Auto-generate slug when editing a new post
  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!editingId) {
        setValue("slug", generateSlug(e.target.value));
      }
    },
    [editingId, setValue],
  );

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/blog", {
        headers: { Authorization: "Bearer " + token },
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(Array.isArray(data) ? data : data.posts || []);
      }
    } catch {
      toast.error("Failed to load blog posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [token]);

  const openCreate = () => {
    setEditingId(null);
    reset({ ...defaultForm, createdAt: "" });
    setDialogOpen(true);
  };

  const openEdit = (post: BlogPost) => {
    setEditingId(post.id);
    // Format createdAt to datetime-local format (YYYY-MM-DDTHH:mm)
    let dateStr = "";
    if (post.createdAt) {
      const d = new Date(post.createdAt);
      const pad = (n: number) => String(n).padStart(2, "0");
      dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }
    reset({
      title: post.title,
      slug: post.slug,
      content: post.content || "",
      excerpt: post.excerpt || "",
      tags: post.tags || "",
      published: post.published,
      createdAt: dateStr,
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data: BlogForm) => {
    setSaving(true);
    try {
      const url = editingId ? `/api/blog?id=${editingId}` : "/api/blog";
      const method = editingId ? "PUT" : "POST";
      const body = editingId ? { ...data, id: editingId } : data;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to save post");
      toast.success(editingId ? "Post updated" : "Post created");
      setDialogOpen(false);
      fetchPosts();
    } catch {
      toast.error("Failed to save post");
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (post: BlogPost) => {
    setTogglingId(post.id);
    try {
      const res = await fetch(`/api/blog?id=${post.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ published: !post.published }),
      });
      if (!res.ok) throw new Error("Failed to toggle publish");
      toast.success(post.published ? "Post unpublished" : "Post published");
      fetchPosts();
    } catch {
      toast.error("Failed to toggle publish status");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/blog?id=${deleteId}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token },
      });
      if (!res.ok) throw new Error("Failed to delete post");
      toast.success("Post deleted");
      setDeleteId(null);
      fetchPosts();
    } catch {
      toast.error("Failed to delete post");
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const filtered = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full max-w-sm" />
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileText className="h-6 w-6 text-purple-400" />
            Blog
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your blog posts
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-neon text-background hover:bg-neon-dim gap-2"
        >
          <Plus className="h-4 w-4" />
          New Post
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search posts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-secondary border-border focus-visible:ring-neon/50"
        />
      </div>

      {/* Posts */}
      {filtered.length === 0 ? (
        <Card className="bg-card/50 border-border">
          <CardContent className="p-12 text-center">
            <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              {search
                ? "No posts match your search"
                : "No blog posts yet. Write your first post!"}
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
                    <TableHead className="text-muted-foreground">
                      Title
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Slug
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Status
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Tags
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Date
                    </TableHead>
                    <TableHead className="text-muted-foreground text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((post, index) => (
                    <motion.tr
                      key={post.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className="border-border hover:bg-secondary/50"
                    >
                      <TableCell className="font-medium">
                        {post.title}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm font-mono">
                        /{post.slug}
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => togglePublish(post)}
                          disabled={togglingId === post.id}
                          className="inline-flex"
                        >
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-2 py-0 cursor-pointer transition-colors ${
                              post.published
                                ? "bg-neon/10 text-neon border-neon/20"
                                : "bg-secondary text-muted-foreground"
                            }`}
                          >
                            {togglingId === post.id ? (
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            ) : post.published ? (
                              <Eye className="h-3 w-3 mr-1" />
                            ) : (
                              <EyeOff className="h-3 w-3 mr-1" />
                            )}
                            {post.published ? "Published" : "Draft"}
                          </Badge>
                        </button>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {(post.tags || "")
                            .split(",")
                            .filter(Boolean)
                            .slice(0, 2)
                            .map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="text-[10px] px-1.5 py-0"
                              >
                                {tag.trim()}
                              </Badge>
                            ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(post.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-cyan hover:text-cyan hover:bg-cyan/10"
                            onClick={() => openEdit(post)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteId(post.id)}
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
            {filtered.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="bg-card/50 border-border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium text-sm">{post.title}</h3>
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-1.5 py-0 ${
                              post.published
                                ? "bg-neon/10 text-neon border-neon/20"
                                : "bg-secondary text-muted-foreground"
                            }`}
                          >
                            {post.published ? "Published" : "Draft"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground font-mono mt-1">
                          /{post.slug}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                          <Calendar className="h-3 w-3" />
                          {formatDate(post.createdAt)}
                        </div>
                        {(post.tags || "").split(",").filter(Boolean).length >
                          0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {(post.tags || "")
                              .split(",")
                              .filter(Boolean)
                              .slice(0, 3)
                              .map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="secondary"
                                  className="text-[10px] px-1.5 py-0"
                                >
                                  {tag.trim()}
                                </Badge>
                              ))}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-cyan"
                          onClick={() => openEdit(post)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => setDeleteId(post.id)}
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
              {editingId ? "Edit Post" : "New Post"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Title</Label>
              <Input
                {...register("title", { required: "Title is required" })}
                onChange={handleTitleChange}
                placeholder="My Blog Post"
                className="bg-secondary border-border focus-visible:ring-neon/50"
              />
              {errors.title && (
                <p className="text-destructive text-xs">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Slug</Label>
              <Input
                {...register("slug", { required: "Slug is required" })}
                placeholder="my-blog-post"
                className="bg-secondary border-border focus-visible:ring-neon/50 font-mono text-sm"
              />
              {errors.slug && (
                <p className="text-destructive text-xs">
                  {errors.slug.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Excerpt</Label>
              <Textarea
                {...register("excerpt")}
                placeholder="Short summary of the post..."
                rows={2}
                className="bg-secondary border-border focus-visible:ring-neon/50 resize-none"
              />
            </div>

            <MarkdownEditor
              value={watch("content") || ""}
              onChange={(val) => setValue("content", val)}
              placeholder="Write your blog post in Markdown...&#10;&#10;## Subheading&#10;Use **bold** and *italic* for formatting&#10;- Bullet points&#10;1. Numbered lists"
            />

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                Tags (comma separated)
              </Label>
              <Input
                {...register("tags")}
                placeholder="react, nextjs, typescript"
                className="bg-secondary border-border focus-visible:ring-neon/50"
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <Label className="text-sm text-muted-foreground">
                Publish immediately
              </Label>
              <Switch
                {...register("published")}
                onCheckedChange={(checked) => setValue("published", checked)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                Post Date &amp; Time
              </Label>
              <Input
                {...register("createdAt")}
                type="datetime-local"
                className="bg-secondary border-border focus-visible:ring-neon/50"
              />
              <p className="text-[11px] text-muted-foreground">
                Leave empty to use current date &amp; time. Select a past date
                for backdated posts.
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-neon text-background hover:bg-neon-dim gap-2"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {editingId ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this blog post? This action cannot
              be undone.
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
