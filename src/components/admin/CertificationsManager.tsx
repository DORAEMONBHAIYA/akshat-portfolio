"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import {
  Award,
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
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

interface Certification {
  id: string;
  title: string;
  issuer: string;
  description: string;
  date: string;
  credentialUrl: string;
  credentialId: string;
  createdAt: string;
}

interface CertForm {
  title: string;
  issuer: string;
  description: string;
  date: string;
  credentialUrl: string;
  credentialId: string;
}

const defaultForm: CertForm = {
  title: "",
  issuer: "",
  description: "",
  date: "",
  credentialUrl: "",
  credentialId: "",
};

export default function CertificationsManager() {
  const token = useAdminStore((s) => s.token);
  const [items, setItems] = useState<Certification[]>([]);
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
  } = useForm<CertForm>({ defaultValues: defaultForm });

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/certifications", {
        headers: { Authorization: "Bearer " + token },
      });
      if (res.ok) setItems(await res.json());
    } catch {
      toast.error("Failed to load certifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [token]);

  const openCreate = () => {
    setEditingId(null);
    reset(defaultForm);
    setDialogOpen(true);
  };
  const openEdit = (c: Certification) => {
    setEditingId(c.id);
    reset({
      title: c.title,
      issuer: c.issuer,
      description: c.description,
      date: c.date,
      credentialUrl: c.credentialUrl,
      credentialId: c.credentialId,
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data: CertForm) => {
    setSaving(true);
    try {
      const url = editingId
        ? `/api/certifications?id=${editingId}`
        : "/api/certifications";
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
      if (!res.ok) throw new Error();
      toast.success(
        editingId ? "Certification updated" : "Certification created",
      );
      setDialogOpen(false);
      fetchItems();
    } catch {
      toast.error("Failed to save certification");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/certifications?id=${deleteId}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token },
      });
      if (!res.ok) throw new Error();
      toast.success("Certification deleted");
      setDeleteId(null);
      fetchItems();
    } catch {
      toast.error("Failed to delete certification");
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Award className="h-6 w-6 text-amber-400" /> Certifications
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your certifications & credentials
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-neon text-background hover:bg-neon-dim gap-2"
        >
          <Plus className="h-4 w-4" /> Add Certification
        </Button>
      </div>

      {items.length === 0 ? (
        <Card className="bg-card/50 border-border">
          <CardContent className="p-12 text-center">
            <Award className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              No certifications yet. Add your first one!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((cert, index) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="bg-card/50 border-border hover:border-amber-400/20 transition-colors group h-full">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="h-9 w-9 rounded-lg bg-amber-400/10 flex items-center justify-center flex-shrink-0">
                          <Award className="h-5 w-5 text-amber-400" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-foreground text-sm truncate">
                            {cert.title}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {cert.issuer} · {cert.date}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      {cert.credentialUrl && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-neon"
                          asChild
                        >
                          <a
                            href={cert.credentialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-cyan hover:text-cyan hover:bg-cyan/10"
                        onClick={() => openEdit(cert)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteId(cert.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  {cert.description && (
                    <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                      {cert.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingId ? "Edit Certification" : "New Certification"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Title</Label>
              <Input
                {...register("title", { required: "Title is required" })}
                placeholder="AWS Cloud Practitioner"
                className="bg-secondary border-border focus-visible:ring-neon/50"
              />
              {errors.title && (
                <p className="text-destructive text-xs">
                  {errors.title.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Issuer</Label>
              <Input
                {...register("issuer")}
                placeholder="Amazon Web Services"
                className="bg-secondary border-border focus-visible:ring-neon/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                Description
              </Label>
              <Textarea
                {...register("description")}
                placeholder="What you learned or achieved..."
                rows={3}
                className="bg-secondary border-border focus-visible:ring-neon/50 resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Date</Label>
                <Input
                  {...register("date")}
                  placeholder="Jan 2024"
                  className="bg-secondary border-border focus-visible:ring-neon/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  Credential ID
                </Label>
                <Input
                  {...register("credentialId")}
                  placeholder="ABC-12345"
                  className="bg-secondary border-border focus-visible:ring-neon/50 font-mono text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                Credential URL
              </Label>
              <Input
                {...register("credentialUrl")}
                placeholder="https://credly.com/..."
                className="bg-secondary border-border focus-visible:ring-neon/50"
              />
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
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingId ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Certification</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? This action cannot be undone.
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
