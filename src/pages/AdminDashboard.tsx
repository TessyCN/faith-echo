import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Clock, CheckCircle2, XCircle, BarChart3, LogOut,
  Menu, X, Image, Video, Music, FileText, ChevronRight, Church,
  ClipboardList, Edit3, TrendingUp, TrendingDown, Minus, Plus,
  Trash2, Save, X as XIcon, FolderPlus, Edit2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { format, subDays, isAfter, isBefore, startOfDay } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  useGetDashboardStats,
  useGetPendingTestimonies,
  useGetApprovedTestimonies,
  useGetRejectedTestimonies,
  useGetCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
  useUpdateTestimonyStatus,
  useUpdateTestimony,
} from "@/services/testimonies.service";
import axios from "axios";

/* ─── Types ─── */

type AdminView = "dashboard" | "pending" | "approved" | "rejected" | "analytics" | "audit" | "detail" | "categories";

type AuditAction = "Approved" | "Rejected" | "Edited";

interface AuditEntry {
  id: string;
  testimonyTitle: string;
  testimonyId: string;
  action: AuditAction;
  timestamp: Date;
  details?: string;
}

// Backend testimony type
interface BackendTestimony {
  id: number;
  title: string;
  content: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
  authorEmail: string;
  authorName: string;
  updatedByEmail: string | null;
  isFeatured: boolean;
  featuredAt: string | null;
  views: number;
  shared: number;
  categoryId: number;
  category: {
    id: number;
    name: string;
    slug: string;
  };
  rejectionNote?: string;
}

// Category type
interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    testimonies: number;
  };
}

// Frontend adapted testimony type
export interface AdaptedTestimony {
  id: string;
  title: string;
  snippet: string;
  fullStory: string;
  contributor: string;
  realName?: string;
  isAnonymous?: boolean;
  category: string;
  categoryId: number;
  mediaType?: "image" | "video" | "audio" | "pdf";
  mediaThumbnail?: string;
  views: number;
  createdAt: Date;
  status: "pending" | "approved" | "rejected";
  rejectionNote?: string;
  isFeatured?: boolean;
}

/* ─── Constants ─── */

export const getCategoryColor = (categoryName: string): string => {
  const colors = [
    "bg-healing/10 text-healing border-healing/20",
    "bg-provision/10 text-provision border-provision/20",
    "bg-deliverance/10 text-deliverance border-deliverance/20",
    "bg-breakthrough/10 text-breakthrough border-breakthrough/20",
    "bg-intimacy/10 text-intimacy border-intimacy/20",
  ];
  // Generate a consistent color based on category name
  const index = categoryName.length % colors.length;
  return colors[index];
};

const getChartColor = (categoryName: string, index: number): string => {
  const colors = [
    "hsl(160, 60%, 45%)",
    "hsl(35, 85%, 55%)",
    "hsl(280, 50%, 55%)",
    "hsl(220, 65%, 50%)",
    "hsl(320, 70%, 55%)",
    "hsl(90, 60%, 45%)",
    "hsl(10, 80%, 55%)",
    "hsl(200, 70%, 50%)",
  ];
  return colors[index % colors.length];
};

const mediaIcons = { image: Image, video: Video, audio: Music, pdf: FileText };

const navItems: { key: AdminView; label: string; icon: typeof LayoutDashboard }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "pending", label: "Pending", icon: Clock },
  { key: "approved", label: "Approved", icon: CheckCircle2 },
  { key: "rejected", label: "Rejected", icon: XCircle },
  { key: "categories", label: "Categories", icon: FolderPlus },
  { key: "audit", label: "Audit Log", icon: ClipboardList },
  { key: "analytics", label: "Analytics", icon: BarChart3 },
];

/* ─── Component ─── */

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout, isAuthenticated } = useAdminAuth();
  const { toast } = useToast();

  const [currentView, setCurrentView] = useState<AdminView>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedTestimony, setSelectedTestimony] = useState<AdaptedTestimony | null>(null);
  const [rejectionNote, setRejectionNote] = useState("");

  // Category management state
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });
  const [deleteCategoryDialog, setDeleteCategoryDialog] = useState<{ open: boolean; category: Category | null }>({ open: false, category: null });

  // Audit log
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [auditActionFilter, setAuditActionFilter] = useState<string>("all");
  const [auditDaysFilter, setAuditDaysFilter] = useState<string>("all");

  // Fetch data from backend
  const dashboardStats = useGetDashboardStats();
  const { data: statsData, isLoading: isLoadingStats } = useGetDashboardStats();
  const { data: pendingData, refetch: refetchPending, isLoading: isLoadingPending } = useGetPendingTestimonies();
  const { data: approvedData, refetch: refetchApproved, isLoading: isLoadingApproved } = useGetApprovedTestimonies();
  const { data: rejectedData, refetch: refetchRejected, isLoading: isLoadingRejected } = useGetRejectedTestimonies();
  const { data: categoriesData, refetch: refetchCategories, isLoading: isLoadingCategories } = useGetCategories();

  // Category mutations
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  // Mutations for updating testimonies
  const updateStatusMutation = useUpdateTestimonyStatus();
  const updateTestimonyMutation = useUpdateTestimony();

  // Confirmation dialogs
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: "approve" | "reject" | "edit";
    testimonyId: string;
  }>({ open: false, type: "approve", testimonyId: "" });

  // Edit form
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ title: "", categoryId: 0, categoryName: "", fullStory: "", isFeatured: false, status: "PENDING" as "PENDING" | "APPROVED" | "REJECTED" });

  // Convert backend data to frontend format
  const adaptTestimony = (backendTestimony: BackendTestimony): AdaptedTestimony => {
    const snippet = backendTestimony.content.length > 100
      ? backendTestimony.content.substring(0, 100) + "..."
      : backendTestimony.content;

    let status: "pending" | "approved" | "rejected" = "pending";
    if (backendTestimony.status === "APPROVED") status = "approved";
    if (backendTestimony.status === "REJECTED") status = "rejected";

    return {
      id: backendTestimony.id.toString(),
      title: backendTestimony.title,
      snippet: snippet,
      fullStory: backendTestimony.content,
      contributor: backendTestimony.authorName,
      realName: backendTestimony.authorName,
      isAnonymous: false,
      category: backendTestimony.category.name,
      categoryId: backendTestimony.category.id,
      views: backendTestimony.views,
      createdAt: new Date(backendTestimony.createdAt),
      status: status,
      rejectionNote: backendTestimony.rejectionNote,
      isFeatured: backendTestimony.isFeatured,
    };
  };

  // Get adapted testimonies lists
  const pendingTestimonies: AdaptedTestimony[] = useMemo(() => {
    if (!pendingData?.data) return [];
    return pendingData?.data?.map(adaptTestimony);
  }, [pendingData]);



  const approvedTestimonies: AdaptedTestimony[] = useMemo(() => {
    if (!approvedData?.data) return [];
    return approvedData.data.map(adaptTestimony);
  }, [approvedData]);

  const rejectedTestimonies: AdaptedTestimony[] = useMemo(() => {
    if (!rejectedData?.data) return [];
    return rejectedData.data.map(adaptTestimony);
  }, [rejectedData]);

  const categories: Category[] = useMemo(() => {
    if (!categoriesData) return [];
    return categoriesData;
  }, [categoriesData]);



  const counts = {

    pending: statsData?.pendingTestimonies ?? 0,
    approved: statsData?.approvedTestimonies ?? 0,
    rejected: statsData?.rejectedTestimonies ?? 0,
    total: statsData?.totalTestimonies ?? 0,
  };

  // Combine all testimonies for analytics
  const allTestimonies = useMemo(() => {
    return [...pendingTestimonies, ...approvedTestimonies, ...rejectedTestimonies];
  }, [pendingTestimonies, approvedTestimonies, rejectedTestimonies]);

  const categoryBreakdown = useMemo(() =>
    categories.map((cat) => ({
      name: cat.name,
      total: allTestimonies.filter((t) => t.categoryId === cat.id).length,
      approved: allTestimonies.filter((t) => t.categoryId === cat.id && t.status === "approved").length,
      pending: allTestimonies.filter((t) => t.categoryId === cat.id && t.status === "pending").length,
      rejected: allTestimonies.filter((t) => t.categoryId === cat.id && t.status === "rejected").length,
    })).filter((cat) => cat.total > 0), [allTestimonies, categories]);

  const pieData = useMemo(() =>
    categories.map((cat, index) => ({
      name: cat.name,
      value: allTestimonies.filter((t) => t.categoryId === cat.id).length,
      color: getChartColor(cat.name, index),
    })).filter((d) => d.value > 0), [allTestimonies, categories]);

  const weeklyTrend = useMemo(() => {
    const now = new Date();
    const thisWeek = allTestimonies.filter((t) => isAfter(t.createdAt, subDays(now, 7))).length;
    const lastWeek = allTestimonies.filter((t) => isAfter(t.createdAt, subDays(now, 14)) && isBefore(t.createdAt, subDays(now, 7))).length;
    const diff = thisWeek - lastWeek;
    return { thisWeek, lastWeek, diff, trend: diff > 0 ? "up" : diff < 0 ? "down" : "flat" as const };
  }, [allTestimonies]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/admin", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  const addAuditEntry = (testimonyId: string, title: string, action: AuditAction, details?: string) => {
    setAuditLog((prev) => [{
      id: `audit-${Date.now()}`,
      testimonyTitle: title,
      testimonyId,
      action,
      timestamp: new Date(),
      details,
    }, ...prev]);
  };

  const handleAction = async (id: string, action: "approve" | "reject") => {
    const testimony = pendingTestimonies.find((t) => t.id === id);
    if (!testimony) return;

    const newStatus = action === "approve" ? "APPROVED" : "REJECTED";

    try {
      await updateStatusMutation.mutateAsync({
        id: parseInt(id),
        status: newStatus,
        // rejectionNote: action === "reject" ? rejectionNote : undefined
      });

      addAuditEntry(id, testimony.title, action === "approve" ? "Approved" : "Rejected", action === "reject" ? rejectionNote : undefined);

      toast({
        title: action === "approve" ? "Testimony Approved" : "Testimony Rejected",
        description: `The testimony has been ${action === "approve" ? "published" : "declined"}.`,
      });

      setRejectionNote("");
      setSelectedTestimony(null);
      setConfirmDialog({ open: false, type: "approve", testimonyId: "" });

      await refetchPending();
      await refetchApproved();
      await refetchRejected();

      setCurrentView(action === "approve" ? "approved" : "rejected");
    } catch (error) {
      console.error("Error updating testimony status:", error);
      toast({
        title: "Error",
        description: "Failed to update testimony status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async (id: string) => {
    try {
      await updateTestimonyMutation.mutateAsync({
        id: parseInt(id),
        title: editForm.title,
        content: editForm.fullStory,
        categoryId: editForm.categoryId,
        status: editForm.status,
        isFeatured: editForm.isFeatured
      });

      addAuditEntry(id, editForm.title, "Edited", `Updated title, category, content, status, and featured status`);

      toast({
        title: "Testimony Updated",
        description: "Changes saved successfully."
      });

      setEditMode(false);

      if (selectedTestimony) {
        setSelectedTestimony({
          ...selectedTestimony,
          title: editForm.title,
          category: editForm.categoryName,
          categoryId: editForm.categoryId,
          fullStory: editForm.fullStory,
        });
      }

      setConfirmDialog({ open: false, type: "approve", testimonyId: "" });

      await refetchPending();
      await refetchApproved();
      await refetchRejected();

    } catch (error) {
  let message = "Failed to update testimony";

  if (axios.isAxiosError(error)) {
    const apiMessage = error.response?.data?.message;

    if (Array.isArray(apiMessage)) {
      message = apiMessage.join(", ");
    } else if (typeof apiMessage === "string") {
      message = apiMessage;
    }
  }

  toast({
    title: "Error",
    description: message,
    variant: "destructive",
  });
}
  };

  // Category management functions
  const handleCreateCategory = async () => {
    if (!categoryForm.name.trim()) {
      toast({ title: "Error", description: "Category name is required", variant: "destructive" });
      return;
    }

    try {
      await createCategoryMutation.mutateAsync({
        name: categoryForm.name,
        description: categoryForm.description || undefined,
        slug: categoryForm.name.toLowerCase().replace(/ /g, "")
      });

      toast({ title: "Success", description: "Category created successfully" });
      setCategoryDialogOpen(false);
      setCategoryForm({ name: "", description: "" });
      await createCategoryMutation.mutateAsync({
        name: categoryForm.name,
        description: categoryForm.description || undefined,
        slug: categoryForm.name.toLowerCase().replace(/ /g, "")
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create category",
        variant: "destructive"
      });
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;
    if (!categoryForm.name.trim()) {
      toast({ title: "Error", description: "Category name is required", variant: "destructive" });
      return;
    }

    try {
      await updateCategoryMutation.mutateAsync({
        id: editingCategory.id,
        category: {
          name: categoryForm.name,
          description: categoryForm.description || undefined,
          slug: categoryForm.name.toLowerCase().replace(/ /g, "")
        }
      });

      toast({ title: "Success", description: "Category updated successfully" });
      setCategoryDialogOpen(false);
      setEditingCategory(null);
      setCategoryForm({ name: "", description: "" });
      await refetchCategories();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update category",
        variant: "destructive"
      });
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteCategoryDialog.category) return;

    try {
      await deleteCategoryMutation.mutateAsync(deleteCategoryDialog.category.id);

      toast({ title: "Success", description: "Category deleted successfully" });
      setDeleteCategoryDialog({ open: false, category: null });
      await refetchCategories();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete category",
        variant: "destructive"
      });
    }
  };

  const openEditCategoryDialog = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({ name: category.name, description: category.description || "" });
    setCategoryDialogOpen(true);
  };

  const openCreateCategoryDialog = () => {
    setEditingCategory(null);
    setCategoryForm({ name: "", description: "" });
    setCategoryDialogOpen(true);
  };

  const openDetail = (testimony: AdaptedTestimony) => {
    setSelectedTestimony(testimony);
    setEditMode(false);
    setCurrentView("detail");
  };

  const startEdit = (t: AdaptedTestimony) => {
    setEditForm({
      title: t.title,
      categoryId: t.categoryId,
      categoryName: t.category,
      fullStory: t.fullStory,
      isFeatured: false,
      status: t.status === "approved" ? "APPROVED" : t.status === "rejected" ? "REJECTED" : "PENDING"
    });
    setEditMode(true);
  };

  const handleLogout = () => {
    logout();
    navigate("/admin", { replace: true });
  };

  const goToView = (view: AdminView) => {
    setCurrentView(view);
    setSidebarOpen(false);
    if (view !== "detail") {
      setSelectedTestimony(null);
      setEditMode(false);
    }
  };

  /* ─── Render helpers ─── */

  const renderTestimonyRow = (t: AdaptedTestimony) => {
    return (
      <div key={t.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border border-border rounded-lg bg-card hover:shadow-[var(--card-hover-shadow)] transition-shadow cursor-pointer" onClick={() => openDetail(t)}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-foreground truncate">{t.title}</h4>
            <Badge variant="outline" className={`text-xs flex-shrink-0 ${getCategoryColor(t.category)}`}>
              {t.category}
            </Badge>
            {t.isFeatured && (
              <Badge className="text-xs flex-shrink-0 bg-healing text-white">Featured</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-1">{t.snippet}</p>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            <span>{t.contributor}</span>
            <span>{format(t.createdAt, "MMM d, yyyy")}</span>
            <span>{t.views} views</span>
          </div>
        </div>
        {t.status === "pending" && (
          <div className="flex gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <Button size="sm" onClick={() => setConfirmDialog({ open: true, type: "approve", testimonyId: t.id })}>Approve</Button>
            <Button size="sm" variant="destructive" onClick={() => setConfirmDialog({ open: true, type: "reject", testimonyId: t.id })}>Reject</Button>
            <Button size="sm" variant="outline" onClick={() => { openDetail(t); setTimeout(() => startEdit(t), 0); }}>
              <Edit3 className="h-3 w-3" />
            </Button>
          </div>
        )}
        <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 hidden sm:block" />
      </div>
    );
  };

  const renderQueue = (status: "pending" | "approved" | "rejected", emptyMessage: string) => {
    let items: AdaptedTestimony[] = [];
    if (status === "pending") items = pendingTestimonies;
    if (status === "approved") items = approvedTestimonies;
    if (status === "rejected") items = rejectedTestimonies;

    if (items.length === 0) return <p className="text-muted-foreground text-center py-12">{emptyMessage}</p>;
    return <div className="space-y-3">{items.map(renderTestimonyRow)}</div>;
  };

  const renderCategories = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Manage Categories</h2>
        <Button onClick={openCreateCategoryDialog} className="gap-2">
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div key={category.id} className="bg-card border border-border rounded-lg p-4 shadow-[var(--card-shadow)]">
            <div className="flex items-start justify-between mb-3">
              <div>
                <Badge className="mb-2" style={{ backgroundColor: getChartColor(category.name, category.id) }}>
                  {category.name}
                </Badge>
                <h3 className="font-semibold text-foreground">{category.name}</h3>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEditCategoryDialog(category)}
                  className="h-8 w-8 p-0"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteCategoryDialog({ open: true, category })}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  disabled={(category._count?.testimonies || 0) > 0}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {category.description && (
              <p className="text-sm text-muted-foreground mb-3">{category.description}</p>
            )}
            <div className="text-xs text-muted-foreground border-t border-border pt-3 mt-2">
              <p>Slug: {category.slug}</p>
              <p>Testimonies: {category._count?.testimonies || 0}</p>
              <p>Created: {format(new Date(category.createdAt), "MMM d, yyyy")}</p>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <p className="text-muted-foreground text-center py-12">No categories found. Create your first category!</p>
      )}
    </div>
  );

  const renderDetail = () => {
    if (!selectedTestimony) return null;
    const t = selectedTestimony;

    return (
      <div className="space-y-6">
        <button onClick={() => goToView(t.status as AdminView)} className="text-sm text-muted-foreground hover:text-primary transition-colors">
          ← Back to {t.status} queue
        </button>

        {editMode ? (
          <div className="space-y-4 bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold text-foreground">Edit Testimony</h3>
            <div>
              <label className="text-sm font-medium text-foreground">Title</label>
              <Input
                value={editForm.title}
                onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Category</label>
              <Select
                value={editForm.categoryId.toString()}
                onValueChange={(v) => {
                  const category = categories.find(c => c.id.toString() === v);
                  setEditForm((f) => ({
                    ...f,
                    categoryId: parseInt(v),
                    categoryName: category?.name || ""
                  }));
                }}
              >
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Status</label>
              <Select
                value={editForm.status}
                onValueChange={(v) => setEditForm((f) => ({ ...f, status: v as "PENDING" | "APPROVED" | "REJECTED" }))}
              >
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-border">
              <Input
                type="checkbox"
                checked={editForm.isFeatured}
                onChange={(e) => setEditForm((f) => ({ ...f, isFeatured: e.target.checked }))}
                className="h-4 w-4 cursor-pointer"
              />
              <label className="text-sm font-medium text-foreground cursor-pointer flex-1">
                Feature this testimony
              </label>
              {editForm.isFeatured && (
                <Badge className="bg-healing text-white">Featured</Badge>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Full Story</label>
              <Textarea
                value={editForm.fullStory}
                onChange={(e) => setEditForm((f) => ({ ...f, fullStory: e.target.value }))}
                rows={8}
                className="mt-1"
              />
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={() => setConfirmDialog({ open: true, type: "edit", testimonyId: t.id })}
                disabled={updateTestimonyMutation.isPending}
                className="relative"
              >
                {updateTestimonyMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Saving</span>
                  </div>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" /> Save Changes
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setEditMode(false)}
                disabled={updateTestimonyMutation.isPending}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline" className={`${getCategoryColor(t.category)}`}>
                  {t.category}
                </Badge>
                {t.isFeatured && (
                  <Badge className="bg-healing text-white">Featured</Badge>
                )}
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">{t.title}</h2>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span>Contributor: <span className="text-foreground font-medium">{t.contributor}</span></span>
              <span>Submitted: {format(t.createdAt, "MMMM d, yyyy 'at' h:mm a")}</span>
              <span>Views: {t.views}</span>
              <span>Status: <Badge variant={t.status === "approved" ? "default" : t.status === "rejected" ? "destructive" : "secondary"} className="ml-1">{t.status}</Badge></span>
            </div>

            <div className="bg-muted/30 rounded-lg p-6">
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">{t.fullStory}</p>
            </div>

            {t.status === "rejected" && t.rejectionNote && (
              <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
                <p className="text-sm font-medium text-destructive mb-1">Rejection Note</p>
                <p className="text-sm text-foreground">{t.rejectionNote}</p>
              </div>
            )}

            {t.status === "pending" && (
              <div className="border-t border-border pt-6 space-y-4">
                <h3 className="font-semibold text-foreground">Moderation Actions</h3>
                <Textarea
                  placeholder="Optional rejection note..."
                  value={rejectionNote}
                  onChange={(e) => setRejectionNote(e.target.value)}
                  maxLength={500}
                  className="resize-none"
                />
                <div className="flex gap-3">
                  <Button onClick={() => setConfirmDialog({ open: true, type: "approve", testimonyId: t.id })} className="gap-2">
                    <CheckCircle2 className="h-4 w-4" /> Approve
                  </Button>
                  <Button variant="destructive" onClick={() => setConfirmDialog({ open: true, type: "reject", testimonyId: t.id })} className="gap-2">
                    <XCircle className="h-4 w-4" /> Reject
                  </Button>
                  <Button variant="outline" onClick={() => startEdit(t)} className="gap-2">
                    <Edit3 className="h-4 w-4" /> Edit
                  </Button>
                </div>
              </div>
            )}

            {(t.status === "approved" || t.status === "rejected") && (
              <div className="border-t border-border pt-6">
                <Button variant="outline" onClick={() => startEdit(t)} className="gap-2">
                  <Edit3 className="h-4 w-4" /> Edit Testimony
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  const renderAuditLog = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">Audit Log</h2>
      <div className="flex flex-wrap gap-3">
        <Select value={auditActionFilter} onValueChange={setAuditActionFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Action" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="Approved">Approved</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
            <SelectItem value="Edited">Edited</SelectItem>
          </SelectContent>
        </Select>
        <Select value={auditDaysFilter} onValueChange={setAuditDaysFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Date range" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="7">Last 7 Days</SelectItem>
            <SelectItem value="30">Last 30 Days</SelectItem>
            <SelectItem value="90">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {filteredAuditLog.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">No audit entries yet. Moderation actions will appear here.</p>
      ) : (
        <div className="space-y-2">
          {filteredAuditLog.map((entry) => (
            <div key={entry.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-4 border border-border rounded-lg bg-card">
              <Badge variant={entry.action === "Approved" ? "default" : entry.action === "Rejected" ? "destructive" : "secondary"} className="w-fit">
                {entry.action}
              </Badge>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{entry.testimonyTitle}</p>
                {entry.details && <p className="text-xs text-muted-foreground mt-0.5">{entry.details}</p>}
              </div>
              <div className="text-xs text-muted-foreground flex flex-col sm:items-end gap-0.5">
                <span>{format(entry.timestamp, "MMM d, yyyy 'at' h:mm a")}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
  const isLoading = createCategoryMutation.isPending || updateCategoryMutation.isPending;

  const filteredAuditLog = useMemo(() => {
    let entries = [...auditLog];
    if (auditActionFilter !== "all") entries = entries.filter((e) => e.action === auditActionFilter);
    if (auditDaysFilter !== "all") {
      const cutoff = startOfDay(subDays(new Date(), parseInt(auditDaysFilter)));
      entries = entries.filter((e) => isAfter(e.timestamp, cutoff));
    }
    return entries;
  }, [auditLog, auditActionFilter, auditDaysFilter]);

  const renderDashboardOverview = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total", value: counts.total, icon: BarChart3, color: "text-primary" },
          { label: "Pending", value: counts.pending, icon: Clock, color: "text-accent" },
          { label: "Approved", value: counts.approved ?? 0, icon: CheckCircle2, color: "text-healing" },
          { label: "Rejected", value: counts.rejected, icon: XCircle, color: "text-destructive" },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-lg p-4 shadow-[var(--card-shadow)]">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-lg p-4 shadow-[var(--card-shadow)] flex items-center gap-3">
        {dashboardStats.data?.submitionsThisWeek > 0 ? <TrendingUp className="h-5 w-5 text-healing" /> : <TrendingDown className="h-5 w-5 text-destructive" />}
        <div>
          <p className="text-sm text-muted-foreground">This week's submissions</p>
          <p className="font-semibold text-foreground">
            {dashboardStats.data?.submitionsThisWeek || 0} submissions
            {dashboardStats.data?.submitionsThisWeek !== undefined && dashboardStats.data?.submitionsThisWeek !== 0 &&
              <span className={dashboardStats.data?.submitionsThisWeek > 0 ? "text-healing" : "text-destructive"}>
                ({dashboardStats.data?.submitionsThisWeek > 0 ? "+" : ""}{dashboardStats.data?.submitionsThisWeek} vs last week)
              </span>
            }
          </p>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Pending Review</h3>
          {counts.pending > 0 && <button onClick={() => goToView("pending")} className="text-sm text-primary hover:underline">View all →</button>}
        </div>
        {renderQueue("pending", "No pending testimonies 🎉")}
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">Analytics Overview</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Pending", value: counts.pending, pct: Math.round((counts.pending / Math.max(counts.total, 1)) * 100), color: "bg-accent" },
          { label: "Approved", value: counts.approved, pct: Math.round((counts.approved / Math.max(counts.total, 1)) * 100), color: "bg-healing" },
          { label: "Rejected", value: counts.rejected, pct: Math.round((counts.rejected / Math.max(counts.total, 1)) * 100), color: "bg-destructive" },
        ].map((item) => (
          <div key={item.label} className="bg-card border border-border rounded-lg p-5 shadow-[var(--card-shadow)]">
            <p className="text-sm text-muted-foreground mb-1">{item.label}</p>
            <p className="text-3xl font-bold text-foreground mb-3">{item.value}</p>
            <div className="w-full bg-muted rounded-full h-2">
              <div className={`${item.color} h-2 rounded-full transition-all`} style={{ width: `${item.pct}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{item.pct}% of total</p>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-lg p-5 shadow-[var(--card-shadow)] flex items-center gap-3">
        {weeklyTrend.trend === "up" ? <TrendingUp className="h-5 w-5 text-healing" /> : weeklyTrend.trend === "down" ? <TrendingDown className="h-5 w-5 text-destructive" /> : <Minus className="h-5 w-5 text-muted-foreground" />}
        <div>
          <p className="text-sm text-muted-foreground">Submissions this week</p>
          <p className="text-lg font-bold text-foreground">{weeklyTrend.thisWeek} <span className="text-sm font-normal text-muted-foreground">({weeklyTrend.diff > 0 ? "+" : ""}{weeklyTrend.diff} vs last week)</span></p>
        </div>
      </div>

      {categoryBreakdown.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-5 shadow-[var(--card-shadow)]">
          <h3 className="font-semibold text-foreground mb-4">Submissions by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 90%)" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(220, 10%, 45%)" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "hsl(220, 10%, 45%)" }} />
                <Tooltip contentStyle={{ background: "hsl(0, 0%, 100%)", border: "1px solid hsl(220, 15%, 90%)", borderRadius: "0.5rem" }} />
                <Bar dataKey="approved" stackId="a" fill="hsl(160, 60%, 45%)" name="Approved" radius={[0, 0, 0, 0]} />
                <Bar dataKey="pending" stackId="a" fill="hsl(35, 85%, 55%)" name="Pending" />
                <Bar dataKey="rejected" stackId="a" fill="hsl(0, 84%, 60%)" name="Rejected" radius={[4, 4, 0, 0]} />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {pieData.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-5 shadow-[var(--card-shadow)]">
          <h3 className="font-semibold text-foreground mb-4">Category Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-lg p-5 shadow-[var(--card-shadow)]">
        <p className="text-sm text-muted-foreground mb-1">Total Views (Approved)</p>
        <p className="text-3xl font-bold text-foreground">
          {approvedTestimonies.reduce((sum, t) => sum + t.views, 0).toLocaleString()}
        </p>
      </div>
    </div>
  );

  const viewTitle: Record<AdminView, string> = {
    dashboard: "Dashboard",
    pending: "Pending Testimonies",
    approved: "Approved Testimonies",
    rejected: "Rejected Testimonies",
    analytics: "Analytics",
    audit: "Audit Log",
    detail: selectedTestimony?.title || "Testimony Detail",
    categories: "Manage Categories",
  };

  const confirmTarget = (() => {
    if (confirmDialog.testimonyId) {
      return [...pendingTestimonies, ...approvedTestimonies, ...rejectedTestimonies].find(
        (t) => t.id === confirmDialog.testimonyId
      );
    }
    return null;
  })();

  return (
    <div className="min-h-screen flex bg-muted/20">
      {sidebarOpen && <div className="fixed inset-0 bg-foreground/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      {/* ========================= THE LEFT NAV===================================== */}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col transform transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
          <Church className="h-6 w-6 text-primary" />
          <span className="font-semibold text-foreground">Admin Panel</span>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-muted-foreground"><X className="h-5 w-5" /></button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <button key={item.key} onClick={() => goToView(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${currentView === item.key ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
              <item.icon className="h-4 w-4" />
              {item.label}
              {item.key === "pending" && counts.pending > 0 && <Badge variant="secondary" className="ml-auto text-xs">{counts.pending}</Badge>}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-border">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>

      {/* ========================= END THE LEFT NAV===================================== */}

      {/* ========================= THE MAIN CONTENT===================================== */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border px-4 sm:px-6 h-14 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-muted-foreground"><Menu className="h-5 w-5" /></button>
          <h1 className="text-lg font-semibold text-foreground truncate">{viewTitle[currentView]}</h1>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {currentView === "dashboard" && renderDashboardOverview()}
          {currentView === "pending" && <div><h2 className="text-xl font-bold text-foreground mb-4">Pending Testimonies</h2>{renderQueue("pending", "No pending testimonies. All caught up! 🎉")}</div>}
          {currentView === "approved" && <div><h2 className="text-xl font-bold text-foreground mb-4">Approved Testimonies</h2>{renderQueue("approved", "No approved testimonies yet.")}</div>}
          {currentView === "rejected" && <div><h2 className="text-xl font-bold text-foreground mb-4">Rejected Testimonies</h2>{renderQueue("rejected", "No rejected testimonies.")}</div>}
          {currentView === "categories" && renderCategories()}
          {currentView === "analytics" && renderAnalytics()}
          {currentView === "audit" && renderAuditLog()}
          {currentView === "detail" && renderDetail()}
        </main>
      </div>




      {/* ========================= END THE MAIN CONTENT===================================== */}




      {/* ========================= START THE CATEGORY DIALOG===================================== */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Category" : "Create New Category"}</DialogTitle>
            <DialogDescription>
              {editingCategory ? "Update the category details below." : "Add a new category for organizing testimonies."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-foreground">Name *</label>
              <Input
                value={categoryForm.name}
                onChange={(e) => setCategoryForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g., Healing, Provision, Breakthrough"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Description (Optional)</label>
              <Textarea
                value={categoryForm.description}
                onChange={(e) => setCategoryForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Describe what this category represents"
                rows={3}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>Cancel</Button>


            <Button
              onClick={editingCategory ? handleUpdateCategory : handleCreateCategory}
              disabled={isLoading}
              className={`
      relative transition-all duration-200
      ${isLoading ? 'cursor-not-allowed opacity-80' : 'hover:scale-105'}
    `}
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  {/* Spinner */}
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>

                  {/* Pulsating text */}
                  <span className="animate-pulse">
                    {editingCategory ? "Updating" : "Creating"}
                    <span className="animate-bounce inline-block ml-0.5">.</span>
                    <span className="animate-bounce inline-block ml-0.5" style={{ animationDelay: '0.2s' }}>.</span>
                    <span className="animate-bounce inline-block ml-0.5" style={{ animationDelay: '0.4s' }}>.</span>
                  </span>
                </div>
              ) : (
                editingCategory ? "Update" : "Create"
              )}
            </Button>
            );          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Category Confirmation */}
      <AlertDialog open={deleteCategoryDialog.open} onOpenChange={(open) => setDeleteCategoryDialog(d => ({ ...d, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteCategoryDialog.category?.name}"?
              {deleteCategoryDialog.category && (deleteCategoryDialog.category._count?.testimonies || 0) > 0 && (
                <span className="block mt-2 text-destructive">
                  Warning: This category has {deleteCategoryDialog.category._count?.testimonies} testimonies associated with it.
                  Deleting it will affect these testimonies.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCategory} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmation Dialogs */}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog((s) => ({ ...s, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.type === "approve" ? "Approve Testimony?" : confirmDialog.type === "reject" ? "Reject Testimony?" : "Save Changes?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.type === "approve" && `"${confirmTarget?.title}" will be published to the public archive.`}
              {confirmDialog.type === "reject" && `"${confirmTarget?.title}" will be marked as rejected.${rejectionNote ? ` Note: "${rejectionNote}"` : ""}`}
              {confirmDialog.type === "edit" && (
                <div className="space-y-2">
                  <p>Your edits to "{confirmTarget?.title}" will be saved with:</p>
                  <ul className="text-xs space-y-1 ml-4 mt-2">
                    <li>• <strong>Title:</strong> {editForm.title}</li>
                    <li>• <strong>Category:</strong> {editForm.categoryName}</li>
                    <li>• <strong>Status:</strong> {editForm.status}</li>
                    <li>• <strong>Featured:</strong> {editForm.isFeatured ? "Yes" : "No"}</li>
                  </ul>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmDialog.type === "approve") handleAction(confirmDialog.testimonyId, "approve");
                else if (confirmDialog.type === "reject") handleAction(confirmDialog.testimonyId, "reject");
                else handleEdit(confirmDialog.testimonyId);
              }}
              disabled={confirmDialog.type === "edit" && updateTestimonyMutation.isPending}
              className={confirmDialog.type === "reject" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
            >
              {confirmDialog.type === "approve" && "Approve"}
              {confirmDialog.type === "reject" && "Reject"}
              {confirmDialog.type === "edit" && (updateTestimonyMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving
                </div>
              ) : "Save")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDashboard;
