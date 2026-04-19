"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import {
  GraduationCap,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Award,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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

interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  description?: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  createdAt: string;
  order: number;
}

interface EducationForm {
  institution: string;
  degree: string;
  field: string;
  description: string;
  startDate: string;
  endDate: string;
  gpa: string;
  order: number;
}

const defaultForm: EducationForm = {
  institution: "",
  degree: "",
  field: "",
  description: "",
  startDate: "",
  endDate: "",
  gpa: "",
  order: 0,
};

export default function EducationManager() {
  const token = useAdminStore((s) => s.token);
  const [education, setEducation] = useState<Education[]>([]);
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
  } = useForm<EducationForm>({ defaultValues: defaultForm });

  const fetchEducation = async () => {
    try {
      const res = await fetch("/api/education", {
        headers: { Authorization: "Bearer " + token },
      });
      if (res.ok) {
        const data = await res.json();
        setEducation(Array.isArray(data) ? data : data.education || []);
      }
    } catch {
      toast.error("Failed to load education");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEducation();
  }, [token]);

  const openCreate = () => {
    setEditingId(null);
    reset(defaultForm);
    setDialogOpen(true);
  };

  const openEdit = (edu: Education) => {
    setEditingId(edu.id);
    reset({
      institution: edu.institution,
      degree: edu.degree,
      field: edu.field,
      description: edu.description || "",
      startDate: edu.startDate || "",
      endDate: edu.endDate || "",
      gpa: edu.gpa || "",
      order: edu.order || 0,
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data: EducationForm) => {
    setSaving(true);
    try {
      const url = editingId
        ? `/api/education?id=${editingId}`
        : "/api/education";
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

      if (!res.ok) throw new Error("Failed to save education");
      toast.success(editingId ? "Education updated" : "Education created");
      setDialogOpen(false);
      fetchEducation();
    } catch {
      toast.error("Failed to save education");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/education?id=${deleteId}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token },
      });
      if (!res.ok) throw new Error("Failed to delete education");
      toast.success("Education deleted");
      setDeleteId(null);
      fetchEducation();
    } catch {
      toast.error("Failed to delete education");
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-purple-400" />
            Education
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your educational background
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-neon text-background hover:bg-neon-dim gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Education
        </Button>
      </div>

      {/* Education Cards */}
      {education.length === 0 ? (
        <Card className="bg-card/50 border-border">
          <CardContent className="p-12 text-center">
            <GraduationCap className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              No education entries yet. Add your academic background!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {education.map((edu, index) => (
            <motion.div
              key={edu.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="bg-card/50 border-border hover:border-purple-400/20 transition-colors group h-full">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="h-9 w-9 rounded-lg bg-purple-400/10 flex items-center justify-center flex-shrink-0">
                          <GraduationCap className="h-5 w-5 text-purple-400" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-foreground text-sm truncate">
                            {edu.institution}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {edu.degree} — {edu.field}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-cyan hover:text-cyan hover:bg-cyan/10"
                        onClick={() => openEdit(edu)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteId(edu.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(edu.startDate)} — {formatDate(edu.endDate)}
                    </div>
                    {edu.gpa && (
                      <div className="flex items-center gap-1">
                        <Award className="h-3 w-3" />
                        GPA: {edu.gpa}
                      </div>
                    )}
                  </div>

                  {edu.description && (
                    <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                      {edu.description}
                    </p>
                  )}
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
              {editingId ? "Edit Education" : "New Education"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                Institution
              </Label>
              <Input
                {...register("institution", {
                  required: "Institution is required",
                })}
                placeholder="Stanford University"
                className="bg-secondary border-border focus-visible:ring-neon/50"
              />
              {errors.institution && (
                <p className="text-destructive text-xs">
                  {errors.institution.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Degree</Label>
                <Input
                  {...register("degree", { required: "Degree is required" })}
                  placeholder="Bachelor of Science"
                  className="bg-secondary border-border focus-visible:ring-neon/50"
                />
                {errors.degree && (
                  <p className="text-destructive text-xs">
                    {errors.degree.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  Field of Study
                </Label>
                <Input
                  {...register("field", { required: "Field is required" })}
                  placeholder="Computer Science"
                  className="bg-secondary border-border focus-visible:ring-neon/50"
                />
                {errors.field && (
                  <p className="text-destructive text-xs">
                    {errors.field.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                Description
              </Label>
              <Textarea
                {...register("description")}
                placeholder="Notable achievements, activities..."
                rows={3}
                className="bg-secondary border-border focus-visible:ring-neon/50 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  Start Date
                </Label>
                <Input
                  {...register("startDate", {
                    required: "Start date is required",
                  })}
                  type="month"
                  className="bg-secondary border-border focus-visible:ring-neon/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  End Date
                </Label>
                <Input
                  {...register("endDate", { required: "End date is required" })}
                  type="month"
                  className="bg-secondary border-border focus-visible:ring-neon/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                GPA (optional)
              </Label>
              <Input
                {...register("gpa")}
                placeholder="3.8 / 4.0"
                className="bg-secondary border-border focus-visible:ring-neon/50"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                Display Order (0 = first)
              </Label>
              <Input
                {...register("order", { valueAsNumber: true })}
                type="number"
                min={0}
                placeholder="0"
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
            <AlertDialogTitle>Delete Education</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this education entry? This action
              cannot be undone.
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
