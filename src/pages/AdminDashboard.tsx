import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Clock, CheckCircle2, XCircle, BarChart3, LogOut,
  Menu, X, Image, Video, Music, FileText, ChevronRight, Church,
  ClipboardList, Edit3, TrendingUp, TrendingDown, Minus,
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
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { testimoniesData, TestimonyData, TestimonyStatus } from "@/data/testimonies";
import { TestimonyCategory } from "@/components/TestimonyCard";
import { format, subDays, isAfter, isBefore, startOfDay, endOfDay } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

/* ─── Types ─── */

type AdminView = "dashboard" | "pending" | "approved" | "rejected" | "analytics" | "audit" | "detail";

type AuditAction = "Approved" | "Rejected" | "Edited";

interface AuditEntry {
  id: string;
  testimonyTitle: string;
  testimonyId: string;
  action: AuditAction;
  adminEmail: string;
  timestamp: Date;
  details?: string;
}

/* ─── Constants ─── */

const categoryStyles: Record<TestimonyCategory, string> = {
  Healing: "bg-healing/10 text-healing border-healing/20",
  Provision: "bg-provision/10 text-provision border-provision/20",
  Deliverance: "bg-deliverance/10 text-deliverance border-deliverance/20",
  Breakthrough: "bg-breakthrough/10 text-breakthrough border-breakthrough/20",
};

const CATEGORY_COLORS: Record<TestimonyCategory, string> = {
  Healing: "hsl(160, 60%, 45%)",
  Provision: "hsl(35, 85%, 55%)",
  Deliverance: "hsl(280, 50%, 55%)",
  Breakthrough: "hsl(220, 65%, 50%)",
};

const mediaIcons = { image: Image, video: Video, audio: Music, pdf: FileText };

const navItems: { key: AdminView; label: string; icon: typeof LayoutDashboard }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "pending", label: "Pending", icon: Clock },
  { key: "approved", label: "Approved", icon: CheckCircle2 },
  { key: "rejected", label: "Rejected", icon: XCircle },
  { key: "audit", label: "Audit Log", icon: ClipboardList },
  { key: "analytics", label: "Analytics", icon: BarChart3 },
];

const categories: TestimonyCategory[] = ["Healing", "Provision", "Deliverance", "Breakthrough"];

/* ─── Component ─── */

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout, isAuthenticated, adminEmail } = useAdminAuth();
  const { toast } = useToast();

  const [currentView, setCurrentView] = useState<AdminView>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedTestimony, setSelectedTestimony] = useState<TestimonyData | null>(null);
  const [data, setData] = useState<TestimonyData[]>([...testimoniesData]);
  const [rejectionNote, setRejectionNote] = useState("");

  // Audit log
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [auditActionFilter, setAuditActionFilter] = useState<string>("all");
  const [auditDaysFilter, setAuditDaysFilter] = useState<string>("all");

  // Confirmation dialogs
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: "approve" | "reject" | "edit";
    testimonyId: string;
  }>({ open: false, type: "approve", testimonyId: "" });

  // Edit form
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ title: "", category: "" as TestimonyCategory, fullStory: "" });

  const counts = useMemo(() => ({
    pending: data.filter((t) => t.status === "pending").length,
    approved: data.filter((t) => t.status === "approved").length,
    rejected: data.filter((t) => t.status === "rejected").length,
    total: data.length,
  }), [data]);

  const categoryBreakdown = useMemo(() =>
    categories.map((cat) => ({
      name: cat,
      total: data.filter((t) => t.category === cat).length,
      approved: data.filter((t) => t.category === cat && t.status === "approved").length,
      pending: data.filter((t) => t.category === cat && t.status === "pending").length,
      rejected: data.filter((t) => t.category === cat && t.status === "rejected").length,
    })), [data]);

  const pieData = useMemo(() =>
    categories.map((cat) => ({
      name: cat,
      value: data.filter((t) => t.category === cat).length,
      color: CATEGORY_COLORS[cat],
    })).filter((d) => d.value > 0), [data]);

  const filteredAuditLog = useMemo(() => {
    let entries = [...auditLog];
    if (auditActionFilter !== "all") entries = entries.filter((e) => e.action === auditActionFilter);
    if (auditDaysFilter !== "all") {
      const cutoff = startOfDay(subDays(new Date(), parseInt(auditDaysFilter)));
      entries = entries.filter((e) => isAfter(e.timestamp, cutoff));
    }
    return entries;
  }, [auditLog, auditActionFilter, auditDaysFilter]);

  const weeklyTrend = useMemo(() => {
    const now = new Date();
    const thisWeek = data.filter((t) => isAfter(t.createdAt, subDays(now, 7))).length;
    const lastWeek = data.filter((t) => isAfter(t.createdAt, subDays(now, 14)) && isBefore(t.createdAt, subDays(now, 7))).length;
    const diff = thisWeek - lastWeek;
    return { thisWeek, lastWeek, diff, trend: diff > 0 ? "up" : diff < 0 ? "down" : "flat" as const };
  }, [data]);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate("/admin", { replace: true });
    return null;
  }

  const filteredTestimonies = (status: TestimonyStatus) =>
    data.filter((t) => t.status === status).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const addAuditEntry = (testimonyId: string, title: string, action: AuditAction, details?: string) => {
    setAuditLog((prev) => [{
      id: `audit-${Date.now()}`,
      testimonyTitle: title,
      testimonyId,
      action,
      adminEmail: adminEmail || "admin",
      timestamp: new Date(),
      details,
    }, ...prev]);
  };

  const handleAction = (id: string, action: "approve" | "reject") => {
    const testimony = data.find((t) => t.id === id);
    setData((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: (action === "approve" ? "approved" : "rejected") as TestimonyStatus, rejectionNote: action === "reject" ? rejectionNote : undefined }
          : t
      )
    );
    addAuditEntry(id, testimony?.title || "", action === "approve" ? "Approved" : "Rejected", action === "reject" ? rejectionNote : undefined);
    toast({
      title: action === "approve" ? "Testimony Approved" : "Testimony Rejected",
      description: `The testimony has been ${action === "approve" ? "published" : "declined"}.`,
    });
    setRejectionNote("");
    setSelectedTestimony(null);
    setConfirmDialog({ open: false, type: "approve", testimonyId: "" });
    setCurrentView(action === "approve" ? "approved" : "rejected");
  };

  const handleEdit = (id: string) => {
    const testimony = data.find((t) => t.id === id);
    if (!testimony) return;
    setData((prev) =>
      prev.map((t) => t.id === id ? { ...t, title: editForm.title, category: editForm.category, fullStory: editForm.fullStory } : t)
    );
    addAuditEntry(id, editForm.title, "Edited", `Updated title, category, or content`);
    toast({ title: "Testimony Updated", description: "Changes saved successfully." });
    setEditMode(false);
    setSelectedTestimony({ ...testimony, title: editForm.title, category: editForm.category, fullStory: editForm.fullStory });
    setConfirmDialog({ open: false, type: "approve", testimonyId: "" });
  };

  const openDetail = (testimony: TestimonyData) => {
    setSelectedTestimony(testimony);
    setEditMode(false);
    setCurrentView("detail");
  };

  const startEdit = (t: TestimonyData) => {
    setEditForm({ title: t.title, category: t.category, fullStory: t.fullStory });
    setEditMode(true);
  };

  const handleLogout = () => { logout(); navigate("/admin", { replace: true }); };

  const goToView = (view: AdminView) => {
    setCurrentView(view);
    setSidebarOpen(false);
    if (view !== "detail") { setSelectedTestimony(null); setEditMode(false); }
  };



  /* ─── Render helpers ─── */

  const renderTestimonyRow = (t: TestimonyData) => {
    const MediaIcon = t.mediaType ? mediaIcons[t.mediaType] : null;
    return (
      <div key={t.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border border-border rounded-lg bg-card hover:shadow-[var(--card-hover-shadow)] transition-shadow cursor-pointer" onClick={() => openDetail(t)}>
        {MediaIcon && (
          <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
            <MediaIcon className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-foreground truncate">{t.title}</h4>
            <Badge variant="outline" className={`text-xs flex-shrink-0 ${categoryStyles[t.category]}`}>{t.category}</Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-1">{t.snippet}</p>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            <span>{t.isAnonymous ? (<>Anonymous <span className="text-muted-foreground/40 italic">({t.realName})</span></>) : t.contributor}</span>
            <span>{format(t.createdAt, "MMM d, yyyy")}</span>
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

  const renderQueue = (status: TestimonyStatus, emptyMessage: string) => {
    const items = filteredTestimonies(status);
    if (items.length === 0) return <p className="text-muted-foreground text-center py-12">{emptyMessage}</p>;
    return <div className="space-y-3">{items.map(renderTestimonyRow)}</div>;
  };

  const renderDetail = () => {
    if (!selectedTestimony) return null;
    const t = selectedTestimony;
    const MediaIcon = t.mediaType ? mediaIcons[t.mediaType] : null;

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
              <Input value={editForm.title} onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Category</label>
              <Select value={editForm.category} onValueChange={(v) => setEditForm((f) => ({ ...f, category: v as TestimonyCategory }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Full Story</label>
              <Textarea value={editForm.fullStory} onChange={(e) => setEditForm((f) => ({ ...f, fullStory: e.target.value }))} rows={8} className="mt-1" />
            </div>
            <div className="flex gap-3">
              <Button onClick={() => setConfirmDialog({ open: true, type: "edit", testimonyId: t.id })}>Save Changes</Button>
              <Button variant="outline" onClick={() => setEditMode(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <>
            <div>
              <Badge variant="outline" className={`mb-3 ${categoryStyles[t.category]}`}>{t.category}</Badge>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">{t.title}</h2>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span>
                Contributor:{" "}
                {t.isAnonymous ? (<>Anonymous <span className="text-muted-foreground/40 italic">({t.realName})</span></>) : <span className="text-foreground font-medium">{t.realName || t.contributor}</span>}
              </span>
              <span>Submitted: {format(t.createdAt, "MMMM d, yyyy 'at' h:mm a")}</span>
              <span>Status: <Badge variant={t.status === "approved" ? "default" : t.status === "rejected" ? "destructive" : "secondary"} className="ml-1">{t.status}</Badge></span>
            </div>

            {MediaIcon && (
              <div className="h-48 bg-muted rounded-lg flex items-center justify-center">
                <MediaIcon className="h-16 w-16 text-muted-foreground/40" />
              </div>
            )}

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
                <Textarea placeholder="Optional rejection note..." value={rejectionNote} onChange={(e) => setRejectionNote(e.target.value)} maxLength={500} className="resize-none" />
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
                <span>{entry.adminEmail}</span>
                <span>{format(entry.timestamp, "MMM d, yyyy 'at' h:mm a")}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderDashboardOverview = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total", value: counts.total, icon: BarChart3, color: "text-primary" },
          { label: "Pending", value: counts.pending, icon: Clock, color: "text-accent" },
          { label: "Approved", value: counts.approved, icon: CheckCircle2, color: "text-healing" },
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

      {/* Weekly trend */}
      <div className="bg-card border border-border rounded-lg p-4 shadow-[var(--card-shadow)] flex items-center gap-3">
        {weeklyTrend.trend === "up" ? <TrendingUp className="h-5 w-5 text-healing" /> : weeklyTrend.trend === "down" ? <TrendingDown className="h-5 w-5 text-destructive" /> : <Minus className="h-5 w-5 text-muted-foreground" />}
        <div>
          <p className="text-sm text-muted-foreground">This week's submissions</p>
          <p className="font-semibold text-foreground">{weeklyTrend.thisWeek} submissions {weeklyTrend.diff !== 0 && <span className={weeklyTrend.diff > 0 ? "text-healing" : "text-destructive"}>({weeklyTrend.diff > 0 ? "+" : ""}{weeklyTrend.diff} vs last week)</span>}</p>
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

      {/* Status cards */}
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

      {/* Trend indicator */}
      <div className="bg-card border border-border rounded-lg p-5 shadow-[var(--card-shadow)] flex items-center gap-3">
        {weeklyTrend.trend === "up" ? <TrendingUp className="h-5 w-5 text-healing" /> : weeklyTrend.trend === "down" ? <TrendingDown className="h-5 w-5 text-destructive" /> : <Minus className="h-5 w-5 text-muted-foreground" />}
        <div>
          <p className="text-sm text-muted-foreground">Submissions this week</p>
          <p className="text-lg font-bold text-foreground">{weeklyTrend.thisWeek} <span className="text-sm font-normal text-muted-foreground">({weeklyTrend.diff > 0 ? "+" : ""}{weeklyTrend.diff} vs last week)</span></p>
        </div>
      </div>

      {/* Category bar chart */}
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

      {/* Pie chart */}
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

      {/* Views */}
      <div className="bg-card border border-border rounded-lg p-5 shadow-[var(--card-shadow)]">
        <p className="text-sm text-muted-foreground mb-1">Total Views (Approved)</p>
        <p className="text-3xl font-bold text-foreground">
          {data.filter((t) => t.status === "approved").reduce((sum, t) => sum + t.views, 0).toLocaleString()}
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
  };

  const confirmTarget = data.find((t) => t.id === confirmDialog.testimonyId);

  return (
    <div className="min-h-screen flex bg-muted/20">
      {sidebarOpen && <div className="fixed inset-0 bg-foreground/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
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

      {/* Main */}
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
          {currentView === "analytics" && renderAnalytics()}
          {currentView === "audit" && renderAuditLog()}
          {currentView === "detail" && renderDetail()}
        </main>
      </div>

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
              {confirmDialog.type === "edit" && `Your edits to "${confirmTarget?.title}" will be saved.`}
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
              className={confirmDialog.type === "reject" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
            >
              {confirmDialog.type === "approve" ? "Approve" : confirmDialog.type === "reject" ? "Reject" : "Save"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDashboard;
